'use strict'
// Adaptador mantenido por compatibilidad con salesOrderController.
// Ahora que payment.service.js es CJS, solo re-exporta.
const paymentService = require('./payment.service')

async function createPreference(orderData) {
  const result = await paymentService.createPreference({
    items:             orderData.items,
    payer:             orderData.payer,
    externalReference: orderData.external_reference,
    backUrls:          orderData.back_urls,
    notificationUrl:   orderData.notification_url,
    metadata:          orderData.metadata,
  })
  return {
    id:                 result.id,
    init_point:         result.initPoint,
    sandbox_init_point: result.sandboxInitPoint,
  }
}

module.exports = { createPreference }
