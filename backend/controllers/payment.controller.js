'use strict'
const { Payment }    = require('mercadopago')
const paymentService = require('../services/payment.service')
const mpClient       = require('../config/mp.config')
const SalesOrder     = require('../models/SalesOrder')
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
 * Consulta un pago en MP por su ID, mapea su estado y actualiza la orden vinculada.
 * Devuelve { mpStatus, orderId, nuevoEstado, updated } o null si no es válido.
 */
async function _syncFromMercadoPago(paymentId, logTag = '[Sync MP]') {
  const paymentAPI = new Payment(mpClient)
  const mpPayment  = await paymentAPI.get({ id: String(paymentId) })
  const { status, external_reference, id } = mpPayment

  logger.info(`${logTag} Pago ${id} | status=${status} | orderId=${external_reference}`)

  if (!external_reference) {
    logger.warn(`${logTag} Sin external_reference`)
    return { mpStatus: status, orderId: null, nuevoEstado: null, updated: false }
  }
  const orderId = parseInt(external_reference, 10)
  if (isNaN(orderId)) {
    logger.warn(`${logTag} external_reference inválido: ${external_reference}`)
    return { mpStatus: status, orderId: null, nuevoEstado: null, updated: false }
  }

  const nuevoEstado = ESTADO_MAP[status]
  if (!nuevoEstado) {
    logger.warn(`${logTag} Estado MP desconocido: ${status}`)
    return { mpStatus: status, orderId, nuevoEstado: null, updated: false }
  }

  const updated = await SalesOrder.updateEstado(orderId, nuevoEstado)
  if (updated) logger.info(`${logTag} Orden #${orderId} → ${nuevoEstado} ✓`)
  else         logger.warn(`${logTag} Orden #${orderId} no encontrada en BD`)

  return { mpStatus: status, orderId, nuevoEstado, updated: Boolean(updated) }
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

module.exports = { createPreference, getPreference, webhook, sync }
