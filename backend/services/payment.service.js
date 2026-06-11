'use strict'
const { Preference } = require('mercadopago')
const mpClient       = require('../config/mp.config')
const { mpEnvironment, mpAccountHint } = require('../config/mp.config')

// CLIENT_ORIGIN puede ser lista coma-separada (ej. "https://x.com,https://www.x.com").
// Para construir back_urls necesitamos UNA URL canónica → tomamos la primera.
// Sin trailing slash para evitar "//" en URLs concatenadas.
const FRONTEND_URL = (process.env.PUBLIC_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')[0].trim().replace(/\/$/, '')

// URL pública del backend (para que MP llegue al webhook).
// En dev local se omite (MP no puede llegar a localhost). En prod debe apuntar a
// la API expuesta a internet (ej. https://api.zolimportados.com).
const API_PUBLIC_URL = (process.env.PUBLIC_API_URL || '').trim().replace(/\/$/, '')

const DEFAULT_CURRENCY = process.env.MP_CURRENCY || 'ARS'

const DEFAULT_BACK_URLS = {
  success: `${FRONTEND_URL}/pago/exito`,
  failure: `${FRONTEND_URL}/pago/error`,
  pending: `${FRONTEND_URL}/pago/pendiente`,
}

const DEFAULT_NOTIFICATION_URL = API_PUBLIC_URL
  ? `${API_PUBLIC_URL}/api/payments/webhook`
  : undefined

function validateItem(item, index) {
  if (!item.title || typeof item.title !== 'string')
    throw new Error(`Item[${index}]: 'title' es obligatorio y debe ser string`)
  if (!item.quantity || item.quantity < 1)
    throw new Error(`Item[${index}]: 'quantity' debe ser un entero >= 1`)
  if (!item.unit_price || item.unit_price <= 0)
    throw new Error(`Item[${index}]: 'unit_price' debe ser un número > 0`)
}

class PaymentService {
  #preferenceAPI

  constructor(client) {
    this.#preferenceAPI = new Preference(client)
    console.info(
      `[PaymentService] Inicializado → ambiente: ${mpEnvironment} | cuenta: ${mpAccountHint}`
    )
  }

  async createPreference({
    items,
    payer             = undefined,
    externalReference = undefined,
    backUrls          = DEFAULT_BACK_URLS,
    autoReturn        = 'approved',
    notificationUrl   = DEFAULT_NOTIFICATION_URL,
    statementDescriptor = 'ZOLIMPORTADOS',
    expirationMinutes = 0,
    metadata          = undefined,
  }) {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("'items' debe ser un array con al menos un elemento")
    items.forEach((item, i) => validateItem(item, i))

    const normalizedItems = items.map(item => ({
      id:           item.id          ?? String(item.title).toLowerCase().replace(/\s+/g, '-'),
      title:        String(item.title),
      description:  item.description ?? '',
      quantity:     parseInt(item.quantity, 10),
      unit_price:   parseFloat(item.unit_price),
      currency_id:  item.currency_id ?? DEFAULT_CURRENCY,
      picture_url:  item.picture_url ?? undefined,
      category_id:  item.category_id ?? 'others',
    }))

    const preferenceBody = {
      items: normalizedItems,
      ...(payer             && { payer }),
      ...(externalReference && { external_reference: externalReference }),
      back_urls: {
        success: backUrls?.success ?? DEFAULT_BACK_URLS.success,
        failure: backUrls?.failure ?? DEFAULT_BACK_URLS.failure,
        pending: backUrls?.pending ?? DEFAULT_BACK_URLS.pending,
      },
      auto_return: autoReturn,
      ...(notificationUrl && { notification_url: notificationUrl }),
      statement_descriptor: statementDescriptor,
      ...(metadata && { metadata }),
      ...(expirationMinutes > 0 && {
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to:   new Date(Date.now() + expirationMinutes * 60_000).toISOString(),
      }),
    }

    console.info(
      `[PaymentService] Creando preference | items: ${items.length} | ` +
      `ref: ${externalReference ?? 'sin referencia'} | ambiente: ${mpEnvironment}`
    )

    const response = await this.#preferenceAPI.create({ body: preferenceBody })

    console.info(`[PaymentService] Preference creada OK | id: ${response.id}`)

    return {
      id:               response.id,
      initPoint:        response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      publicKey:        process.env.MP_PUBLIC_KEY ?? '',
      environment:      mpEnvironment,
    }
  }

  async getPreference(preferenceId) {
    if (!preferenceId) throw new Error("'preferenceId' es requerido")
    console.info(`[PaymentService] Buscando preference | id: ${preferenceId}`)
    const response = await this.#preferenceAPI.get({ preferenceId })
    return {
      id:          response.id,
      status:      response.status ?? 'active',
      items:       response.items,
      initPoint:   response.init_point,
      externalRef: response.external_reference,
      createdAt:   response.date_created,
    }
  }
}

const paymentService = new PaymentService(mpClient)

module.exports = paymentService
module.exports.PaymentService = PaymentService
