/**
 * paymentService.js — Adaptador CJS → ESM
 * =========================================
 * Este archivo permite que el código CJS existente (salesOrderController)
 * siga usando `require('./services/paymentService')` sin cambios,
 * mientras la implementación real vive en el módulo ESM payment.service.js.
 *
 * Patrón: Wrapper / Adapter
 * Cuando el proyecto migre completamente a ESM, eliminar este archivo
 * y actualizar los require() existentes a import statements.
 */

let _service = null

async function getService() {
  if (!_service) {
    const mod = await import('./payment.service.js')
    _service  = mod.default
  }
  return _service
}

/**
 * Crea una preferencia de MercadoPago.
 * Interfaz compatible con el código CJS existente.
 *
 * @param {Object} orderData  { items, payer, external_reference, back_urls }
 * @returns {Promise<{id, init_point, sandbox_init_point}>}
 */
async function createPreference(orderData) {
  const service = await getService()

  const result = await service.createPreference({
    items:             orderData.items,
    payer:             orderData.payer,
    externalReference: orderData.external_reference,
    backUrls:          orderData.back_urls,
    notificationUrl:   orderData.notification_url,
  })

  // Mantiene la interfaz de retorno del código anterior
  return {
    id:                 result.id,
    init_point:         result.initPoint,
    sandbox_init_point: result.sandboxInitPoint,
  }
}

module.exports = { createPreference }
