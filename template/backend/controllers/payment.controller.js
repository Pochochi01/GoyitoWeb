/**
 * Payment controller — MercadoPago Checkout Pro.
 *
 * Endpoints:
 *   · POST /api/payments/init-mp    → crea SOLO la preference (no crea orden)
 *   · GET  /api/payments/sync       → reconcilia al volver el usuario
 *   · POST /api/payments/webhook    → notificación async de MP
 *   · POST /api/payments/create-preference (legacy)
 *   · GET  /api/payments/preference/:id
 */
'use strict'
const { Payment }             = require('mercadopago')
const paymentService          = require('../services/payment.service')
const mpClient                = require('../config/mp.config')
const SalesOrderRepository    = require('../repositories/SalesOrderRepository')
const ProductRepository       = require('../repositories/ProductRepository')
const ProductStockRepository  = require('../repositories/ProductStockRepository')
const StockMovementRepository = require('../repositories/StockMovementRepository')
const { withTransaction }     = require('../config/db')
const logger                  = require('../utils/logger')

// Mapeo MP status → estado de orden
const ESTADO_MAP = {
  approved:   'Pagada',
  rejected:   'Cancelada',
  cancelled:  'Cancelada',
  in_process: 'Pendiente',
  pending:    'Pendiente',
  authorized: 'Pendiente',
}

const MP_ERROR_STATUS_MAP = {
  invalid_access_token: 401,
  unauthorized:         403,
  not_found:            404,
  bad_request:          400,
}
const resolveMPStatus = (err) => MP_ERROR_STATUS_MAP[err?.cause?.[0]?.code] ?? 500

// ─── POST /api/payments/create-preference ────────────────────
async function createPreference(req, res) {
  const { items, payer, externalReference, backUrls,
          autoReturn, notificationUrl, statementDescriptor, expirationMinutes } = req.body

  if (!items) {
    return res.status(400).json({
      ok: false,
      message: "'items' es requerido",
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
    if (isValidation) return res.status(400).json({ ok: false, message: err.message })
    const code = resolveMPStatus(err)
    logger.error(`[PaymentController] Error MP (${code}):`, err.message)
    return res.status(code).json({
      ok: false, message: 'Error al crear la preferencia',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── POST /api/payments/init-mp ──────────────────────────────
// Crea SOLO la preference. La orden se creará cuando el pago se apruebe
// (via sync o webhook). Los items y datos del cliente van en metadata.
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
      items: mpItems, payer, metadata,
    })

    return res.status(201).json({
      ok: true,
      preferenceId:       preference.id,
      init_point:         preference.initPoint,
      sandbox_init_point: preference.sandboxInitPoint,
    })
  } catch (err) {
    logger.error('[InitMP] Error:', err.message)
    return res.status(500).json({
      ok: false, message: 'No se pudo iniciar el pago con MercadoPago',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── GET /api/payments/preference/:id ────────────────────────
async function getPreference(req, res) {
  if (!req.params.id) return res.status(400).json({ ok: false, message: "'id' es requerido" })
  try {
    const preference = await paymentService.getPreference(req.params.id)
    return res.status(200).json({ ok: true, data: preference })
  } catch (err) {
    const code = resolveMPStatus(err)
    return res.status(code).json({
      ok: false, message: 'Error al recuperar la preferencia',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── POST /api/payments/webhook ──────────────────────────────
async function webhook(req, res) {
  res.sendStatus(200)  // responder inmediato — MP reintenta si tarda > 5s

  const { type, data } = req.body
  if (!type || !data?.id) return
  logger.info(`[Webhook MP] type=${type} | id=${data.id}`)

  if (type === 'payment') {
    _syncFromMercadoPago(data.id, '[Webhook MP]').catch(err =>
      logger.error('[Webhook MP] Error:', err.message)
    )
  }
}

// ─── GET /api/payments/sync?payment_id=X ────────────────────
async function sync(req, res) {
  const paymentId = req.query.payment_id || req.query.collection_id
  if (!paymentId) return res.status(400).json({ ok: false, message: "'payment_id' es requerido" })

  try {
    const result = await _syncFromMercadoPago(paymentId, '[Sync MP]')
    return res.json({ ok: true, ...result })
  } catch (err) {
    logger.error('[Sync MP] Error:', err.message)
    return res.status(500).json({
      ok: false, message: 'No se pudo verificar el pago con MercadoPago',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── Core: reconciliación con MP + creación diferida ────────

/**
 * Crea la orden a partir de la metadata del pago (transacción atómica).
 * Reemplaza producto_id inexistentes por null.
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

  const orderId = await withTransaction(async (conn) => {
    // Sanear producto_id
    const ids       = items.map(i => i.producto_id).filter(Boolean)
    const validIds  = await ProductRepository.existingIds(ids, conn)
    const cleanItems = items.map(i => ({
      ...i,
      producto_id: i.producto_id && validIds.has(Number(i.producto_id)) ? Number(i.producto_id) : null,
    }))

    const id = await SalesOrderRepository.create({
      fecha,
      canal:         meta.canal || 'E-commerce',
      cliente_id:    meta.cliente_id || null,
      operador_id:   null,
      estado:        'Pagada',
      metodo_pago:   'MercadoPago',
      mp_payment_id: String(mpPayment.id),
      total, items: cleanItems,
    }, conn)

    for (const item of cleanItems) {
      if (item.producto_id) {
        await ProductStockRepository.adjustStock(item.producto_id, -item.cantidad, conn)
        await StockMovementRepository.create({
          fecha, producto_id: item.producto_id, tipo: 'Salida',
          cantidad: item.cantidad, motivo: `Venta #${id} (MP)`,
          usuario_id: meta.usuario_id || null,
        }, conn)
      }
    }
    return id
  })

  logger.info(`${logTag} Orden #${orderId} creada (Pagada) desde pago MP ${mpPayment.id} ✓`)
  return orderId
}

/**
 * Reconcilia el estado de un pago MP con la BD.
 * - Si existe orden vinculada → actualiza estado.
 * - Si no existe y pago aprobado → crea la orden.
 * Idempotente: garantizado por UNIQUE INDEX sobre mp_payment_id.
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

  // 1) Idempotencia por mp_payment_id
  let existing = await SalesOrderRepository.findByMpPaymentId(id)

  // 2) Fallback legacy: por external_reference = orderId
  if (!existing && external_reference) {
    const refId = parseInt(external_reference, 10)
    if (!isNaN(refId)) existing = await SalesOrderRepository.findById(refId)
  }

  // 3) Existe → solo actualizar estado
  if (existing) {
    const updated = await SalesOrderRepository.updateEstado(existing.id, nuevoEstado)
    if (updated) logger.info(`${logTag} Orden #${existing.id} → ${nuevoEstado} ✓`)
    return {
      mpStatus: status, orderId: existing.id, nuevoEstado,
      updated: Boolean(updated), created: false,
    }
  }

  // 4) No existe — solo crear si el pago está aprobado
  if (status !== 'approved') {
    logger.info(`${logTag} Pago no aprobado (${status}) — no se crea orden`)
    return { mpStatus: status, orderId: null, nuevoEstado, updated: false, created: false }
  }

  try {
    const orderId = await _createOrderFromMpMetadata(mpPayment, logTag)
    if (!orderId) return { mpStatus: status, orderId: null, nuevoEstado, updated: false, created: false }
    return { mpStatus: status, orderId, nuevoEstado, updated: true, created: true }
  } catch (err) {
    // Race condition: webhook + sync concurrentes. Segundo pierde por UNIQUE.
    // Adaptar el chequeo al driver:
    //   MySQL:    err.code === 'ER_DUP_ENTRY'
    //   Postgres: err.code === '23505'
    const isDup = err.code === 'ER_DUP_ENTRY' || err.code === '23505'
    if (isDup) {
      const winner = await SalesOrderRepository.findByMpPaymentId(id)
      if (winner) {
        logger.info(`${logTag} Orden ya creada por otra request (race) → usando #${winner.id}`)
        return { mpStatus: status, orderId: winner.id, nuevoEstado, updated: true, created: false }
      }
    }
    throw err
  }
}

module.exports = { createPreference, getPreference, webhook, sync, initMP }
