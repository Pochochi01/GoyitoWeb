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

async function _processPaymentNotification(paymentId) {
  const paymentAPI = new Payment(mpClient)
  const mpPayment  = await paymentAPI.get({ id: String(paymentId) })
  const { status, external_reference, id } = mpPayment

  logger.info(`[Webhook MP] Pago ${id} | status=${status} | orderId=${external_reference}`)

  if (!external_reference) {
    logger.warn('[Webhook MP] Sin external_reference')
    return
  }
  const orderId = parseInt(external_reference, 10)
  if (isNaN(orderId)) {
    logger.warn(`[Webhook MP] external_reference inválido: ${external_reference}`)
    return
  }

  const estadoMap = {
    approved:   'Pagada',
    rejected:   'Cancelada',
    cancelled:  'Cancelada',
    in_process: 'Pendiente',
    pending:    'Pendiente',
    authorized: 'Pendiente',
  }

  const nuevoEstado = estadoMap[status]
  if (!nuevoEstado) {
    logger.warn(`[Webhook MP] Estado MP desconocido: ${status}`)
    return
  }

  const updated = await SalesOrder.updateEstado(orderId, nuevoEstado)
  if (updated) logger.info(`[Webhook MP] Orden #${orderId} → ${nuevoEstado} ✓`)
  else         logger.warn(`[Webhook MP] Orden #${orderId} no encontrada en BD`)
}

module.exports = { createPreference, getPreference, webhook }
