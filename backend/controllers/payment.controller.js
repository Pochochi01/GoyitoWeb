/**
 * payment.controller.js — Controlador HTTP de Pagos MercadoPago
 * ==============================================================
 * Endpoints:
 *  POST /api/payments/create-preference  → crea Preference (uso genérico)
 *  GET  /api/payments/preference/:id     → recupera una Preference
 *  POST /api/payments/webhook            → IPN de MercadoPago
 *
 * El checkout completo (orden + preference) vive en:
 *  POST /api/sales-orders/checkout-mp   → salesOrderController.checkoutMP()
 */

import { Payment } from 'mercadopago'
import { createRequire } from 'module'
import paymentService     from '../services/payment.service.js'
import mpClient           from '../config/mp.config.js'

// Puente CJS → ESM para acceder al modelo de SalesOrder
const require    = createRequire(import.meta.url)
const SalesOrder = require('../models/SalesOrder')
const logger     = require('../utils/logger')

// ─── Mapeo de errores MP → HTTP ───────────────────────────────
const MP_ERROR_STATUS_MAP = {
  'invalid_access_token': 401,
  'unauthorized':         403,
  'not_found':            404,
  'bad_request':          400,
}
const resolveMPStatus = (err) => MP_ERROR_STATUS_MAP[err?.cause?.[0]?.code] ?? 500

// ─── POST /api/payments/create-preference ────────────────────
export async function createPreference(req, res) {
  const { items, payer, externalReference, backUrls,
          autoReturn, notificationUrl, statementDescriptor, expirationMinutes } = req.body

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
    const isValidation = err.message.startsWith("Item[") || err.message.startsWith("'items'")
    if (isValidation) {
      return res.status(400).json({ ok: false, message: err.message })
    }
    const code = resolveMPStatus(err)
    logger.error(`[PaymentController] Error MP (${code}):`, err.message)
    return res.status(code).json({
      ok: false, message: 'Error al crear la preferencia',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── GET /api/payments/preference/:id ────────────────────────
export async function getPreference(req, res) {
  if (!req.params.id) {
    return res.status(400).json({ ok: false, message: "'id' es requerido" })
  }
  try {
    const preference = await paymentService.getPreference(req.params.id)
    return res.status(200).json({ ok: true, data: preference })
  } catch (err) {
    const code = resolveMPStatus(err)
    logger.error(`[PaymentController] Error preference (${code}):`, err.message)
    return res.status(code).json({
      ok: false, message: 'Error al recuperar la preferencia',
      detail: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}

// ─── POST /api/payments/webhook ───────────────────────────────
/**
 * Recibe notificaciones IPN de MercadoPago.
 * Responde 200 INMEDIATAMENTE — si tarda más de 5 s, MP reintenta.
 *
 * Cuando type='payment' y status='approved':
 *  → busca el external_reference (= orderId en nuestra BD)
 *  → actualiza la orden a estado 'Pagada'
 *
 * Producción: validar HMAC-SHA256 con MP_WEBHOOK_SECRET antes de procesar.
 */
export async function webhook(req, res) {
  // ── Respuesta inmediata (siempre 200) ─────────────────────
  res.sendStatus(200)

  const { type, data } = req.body
  if (!type || !data?.id) return

  logger.info(`[Webhook MP] type=${type} | id=${data.id}`)

  // ── Procesar pago confirmado ──────────────────────────────
  if (type === 'payment') {
    _processPaymentNotification(data.id).catch(err =>
      logger.error('[Webhook MP] Error al procesar notificación:', err.message)
    )
  }
}

/**
 * Consulta el pago en MP y actualiza el estado de la orden en nuestra BD.
 * Se ejecuta de forma asíncrona después de responder 200 a MP.
 *
 * @param {string|number} paymentId  — ID del pago en MercadoPago
 */
async function _processPaymentNotification(paymentId) {
  const paymentAPI = new Payment(mpClient)
  const mpPayment  = await paymentAPI.get({ id: String(paymentId) })

  const { status, external_reference, id } = mpPayment

  logger.info(`[Webhook MP] Pago ${id} | status=${status} | orderId=${external_reference}`)

  if (!external_reference) {
    logger.warn('[Webhook MP] Sin external_reference — no se puede vincular con ninguna orden')
    return
  }

  const orderId = parseInt(external_reference, 10)
  if (isNaN(orderId)) {
    logger.warn(`[Webhook MP] external_reference no es un número válido: ${external_reference}`)
    return
  }

  // ── Mapa de estado MP → estado de nuestra orden ──────────
  const estadoMap = {
    approved:    'Pagada',
    rejected:    'Cancelada',
    cancelled:   'Cancelada',
    in_process:  'Pendiente',
    pending:     'Pendiente',
    authorized:  'Pendiente',
  }

  const nuevoEstado = estadoMap[status]
  if (!nuevoEstado) {
    logger.warn(`[Webhook MP] Estado MP desconocido: ${status}`)
    return
  }

  const updated = await SalesOrder.updateEstado(orderId, nuevoEstado)

  if (updated) {
    logger.info(`[Webhook MP] Orden #${orderId} → ${nuevoEstado} ✓`)
  } else {
    logger.warn(`[Webhook MP] Orden #${orderId} no encontrada en la BD`)
  }
}
