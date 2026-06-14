'use strict'
const { Payment }    = require('mercadopago')
const paymentService = require('../services/payment.service')
const mpClient       = require('../config/mp.config')
const SalesOrder     = require('../models/SalesOrder')
const Product        = require('../models/Product')
const ProductStock   = require('../models/ProductStock')
const StockMovement  = require('../models/StockMovement')
const { pool }       = require('../config/db')
const logger         = require('../utils/logger')

// ─── Mapeo de errores MP → HTTP ───────────────────────────────
const MP_ERROR_STATUS_MAP = {
  invalid_access_token: 401,
  unauthorized:         403,
  not_found:            404,
  bad_request:          400,
}
const resolveMPStatus = (err) => MP_ERROR_STATUS_MAP[err?.cause?.[0]?.code] ?? 500

// ─── POST /api/payments/create-preference ────────────────────
async function createPreference(req, res) {
  const {
    items, payer, externalReference, backUrls,
    autoReturn, notificationUrl, statementDescriptor, expirationMinutes,
  } = req.body

  if (!items) {
    return res.status(400).json({
      ok: false,
      message: "'items' es requerido",
      example: { items: [{ title: 'Producto', quantity: 1, unit_price: 100 }] },
    })
  }

  try {
    const preference = await paymentService.createPreference({
      items, payer, externalReference, backUrls,
      autoReturn, notificationUrl, statementDescriptor, expirationMinutes,
    })
    return res.status(201).json({ ok: true, data: preference })
  } catch (err) {
    const isValidation = err.message.startsWith('Item[') || err.message.startsWith("'items'")
    if (isValidation)
      return res.status(400).json({ ok: false, message: err.message })
    const code = resolveMPStatus(err)
    logger.error(`[PaymentController] Error MP (${code}):`, err.message)
    return res.status(code).json({
      ok:      false,
      message: 'Error al crear la preferencia',
      detail:  process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── POST /api/payments/init-mp ──────────────────────────────
// Crea SOLO la preference de MercadoPago, sin crear orden en BD.
// La orden se crea recién cuando el usuario vuelve con pago aprobado
// (endpoint sync) o cuando MP llama el webhook.
//
// Los items y datos del cliente se guardan en `metadata` de la preference
// para reconstruir la orden después. Esto evita órdenes zombie en
// "Pendiente" si el usuario cancela o cierra MP sin volver.
async function initMP(req, res) {
  try {
    const { items, payer, canal = 'E-commerce', cliente_id, usuario_id } = req.body
    if (!items?.length) {
      return res.status(400).json({ ok: false, message: 'items es requerido' })
    }

    const mpItems = items.map(i => ({
      id:          String(i.producto_id || i.nombre_producto),
      title:       i.nombre_producto,
      quantity:    parseInt(i.cantidad, 10),
      unit_price:  parseFloat(i.precio_unit),
      currency_id: 'ARS',
    }))

    // metadata se incluye en la preference y la devuelve MP al consultar
    // el payment. Es lo que usamos para reconstruir la orden en el sync.
    const metadata = {
      canal,
      cliente_id: cliente_id || null,
      usuario_id: usuario_id || req.user?.id || null,
      items: items.map(i => ({
        producto_id:     i.producto_id || null,
        nombre_producto: i.nombre_producto,
        cantidad:        parseInt(i.cantidad, 10),
        precio_unit:     parseFloat(i.precio_unit),
      })),
    }

    const preference = await paymentService.createPreference({
      items: mpItems,
      payer,
      metadata,
    })

    return res.status(201).json({
      ok:                  true,
      preferenceId:        preference.id,
      init_point:          preference.initPoint,
      sandbox_init_point:  preference.sandboxInitPoint,
    })
  } catch (err) {
    logger.error('[InitMP] Error:', err.message)
    return res.status(500).json({
      ok: false,
      message: 'No se pudo iniciar el pago con MercadoPago',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── GET /api/payments/preference/:id ────────────────────────
async function getPreference(req, res) {
  if (!req.params.id)
    return res.status(400).json({ ok: false, message: "'id' es requerido" })
  try {
    const preference = await paymentService.getPreference(req.params.id)
    return res.status(200).json({ ok: true, data: preference })
  } catch (err) {
    const code = resolveMPStatus(err)
    logger.error(`[PaymentController] Error preference (${code}):`, err.message)
    return res.status(code).json({
      ok:      false,
      message: 'Error al recuperar la preferencia',
      detail:  process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── POST /api/payments/webhook ───────────────────────────────
async function webhook(req, res) {
  res.sendStatus(200) // responder inmediatamente — MP reintenta si tarda > 5s

  const { type, data } = req.body
  if (!type || !data?.id) return

  logger.info(`[Webhook MP] type=${type} | id=${data.id}`)

  if (type === 'payment') {
    _processPaymentNotification(data.id).catch(err =>
      logger.error('[Webhook MP] Error al procesar notificación:', err.message)
    )
  }
}

// Mapeo MP status → estado de orden (compartido por webhook y sync).
const ESTADO_MAP = {
  approved:   'Pagada',
  rejected:   'Cancelada',
  cancelled:  'Cancelada',
  in_process: 'Pendiente',
  pending:    'Pendiente',
  authorized: 'Pendiente',
}

/**
 * Crea una orden en BD a partir de la metadata del pago de MercadoPago.
 * Atómica: orden + items + ajuste de stock + movimiento dentro de una TX.
 * Devuelve el orderId o null si la metadata es insuficiente.
 */
async function _createOrderFromMpMetadata(mpPayment, logTag) {
  const meta = mpPayment.metadata || {}
  const items = Array.isArray(meta.items) ? meta.items : null
  if (!items?.length) {
    logger.warn(`${logTag} metadata sin items — no se puede crear la orden`)
    return null
  }

  const fecha = new Date().toISOString().split('T')[0]
  const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Sanear producto_id: si llega un ID que no existe en `products` lo dejamos
    // en NULL para que la orden se cree igual con el nombre_producto histórico.
    const ids       = items.map(i => i.producto_id).filter(Boolean)
    const validIds  = await Product.existingIds(ids, conn)
    const cleanItems = items.map(i => ({
      ...i,
      producto_id: i.producto_id && validIds.has(Number(i.producto_id)) ? Number(i.producto_id) : null,
    }))

    const orderId = await SalesOrder.create({
      fecha,
      canal:         meta.canal || 'E-commerce',
      cliente_id:    meta.cliente_id || null,
      operador_id:   null,
      estado:        'Pagada',
      metodo_pago:   'MercadoPago',
      mp_payment_id: String(mpPayment.id),
      total,
      items:         cleanItems,
    }, conn)

    // Ajustar stock + registrar movimientos solo para items con producto real
    for (const item of cleanItems) {
      if (item.producto_id) {
        await ProductStock.adjustStock(item.producto_id, -item.cantidad, conn)
        await StockMovement.create({
          fecha,
          producto_id: item.producto_id,
          tipo:        'Salida',
          cantidad:    item.cantidad,
          motivo:      `Venta #${orderId} (MP)`,
          usuario_id:  meta.usuario_id || null,
        }, conn)
      }
    }

    await conn.commit()
    logger.info(`${logTag} Orden #${orderId} creada (Pagada) desde pago MP ${mpPayment.id} ✓`)
    return orderId
  } catch (err) {
    await conn.rollback()
    logger.error(`${logTag} Error creando orden:`, err.message)
    throw err
  } finally {
    conn.release()
  }
}

/**
 * Consulta un pago en MP por su ID y reconcilia con la BD:
 *  · Si la orden ya existe (vinculada por external_reference o mp_payment_id) → actualiza estado.
 *  · Si NO existe y el pago está aprobado → crea la orden desde la metadata.
 *
 * Es idempotente: llamarlo dos veces con el mismo paymentId no duplica nada.
 * La idempotencia se garantiza por el UNIQUE INDEX sobre `mp_payment_id`.
 */
async function _syncFromMercadoPago(paymentId, logTag = '[Sync MP]') {
  const paymentAPI = new Payment(mpClient)
  const mpPayment  = await paymentAPI.get({ id: String(paymentId) })
  const { status, external_reference, id } = mpPayment

  logger.info(`${logTag} Pago ${id} | status=${status} | external_ref=${external_reference}`)

  const nuevoEstado = ESTADO_MAP[status]
  if (!nuevoEstado) {
    logger.warn(`${logTag} Estado MP desconocido: ${status}`)
    return { mpStatus: status, orderId: null, nuevoEstado: null, updated: false, created: false }
  }

  // 1) Buscar orden ya vinculada al payment_id (idempotencia)
  let existing = await SalesOrder.findByMpPaymentId(id)

  // 2) Fallback: buscar por external_reference (compatibilidad con el flujo viejo
  //    de checkout-mp donde la orden se creaba antes y external_reference=orderId)
  if (!existing && external_reference) {
    const refId = parseInt(external_reference, 10)
    if (!isNaN(refId)) {
      existing = await SalesOrder.findById(refId)
    }
  }

  // 3) Si existe, actualizar estado
  if (existing) {
    const updated = await SalesOrder.updateEstado(existing.id, nuevoEstado)
    if (updated) logger.info(`${logTag} Orden #${existing.id} → ${nuevoEstado} ✓`)
    return {
      mpStatus: status, orderId: existing.id, nuevoEstado,
      updated: Boolean(updated), created: false,
    }
  }

  // 4) No existe — solo creamos orden si el pago está aprobado.
  //    Para pagos rechazados/cancelados/pendientes NO creamos nada
  //    (la orden no debe nacer hasta que la plata esté).
  if (status !== 'approved') {
    logger.info(`${logTag} Pago no aprobado (${status}) — no se crea orden`)
    return { mpStatus: status, orderId: null, nuevoEstado, updated: false, created: false }
  }

  try {
    const orderId = await _createOrderFromMpMetadata(mpPayment, logTag)
    if (!orderId) {
      return { mpStatus: status, orderId: null, nuevoEstado, updated: false, created: false }
    }
    return { mpStatus: status, orderId, nuevoEstado, updated: true, created: true }
  } catch (err) {
    // Race condition: si dos requests crean la orden a la vez (webhook + sync),
    // el UNIQUE INDEX en mp_payment_id rechaza el segundo. Reintenta lookup.
    if (err.code === 'ER_DUP_ENTRY') {
      const winner = await SalesOrder.findByMpPaymentId(id)
      if (winner) {
        logger.info(`${logTag} Orden ya creada por otra request (race) → usando #${winner.id}`)
        return { mpStatus: status, orderId: winner.id, nuevoEstado, updated: true, created: false }
      }
    }
    throw err
  }
}

async function _processPaymentNotification(paymentId) {
  await _syncFromMercadoPago(paymentId, '[Webhook MP]')
}

// ─── GET /api/payments/sync?payment_id=XXX ───────────────────
// Llamado desde el frontend cuando el usuario vuelve de MP. Consulta MP y
// actualiza el estado de la orden vinculada. Es seguro: la fuente de verdad
// es MP (no los query params del navegador, que podrían ser falsificados).
async function sync(req, res) {
  const paymentId = req.query.payment_id || req.query.collection_id
  if (!paymentId) {
    return res.status(400).json({ ok: false, message: "'payment_id' es requerido" })
  }
  try {
    const result = await _syncFromMercadoPago(paymentId, '[Sync MP]')
    return res.json({ ok: true, ...result })
  } catch (err) {
    logger.error('[Sync MP] Error:', err.message)
    return res.status(500).json({
      ok: false,
      message: 'No se pudo verificar el pago con MercadoPago',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

module.exports = { createPreference, getPreference, webhook, sync, initMP }
