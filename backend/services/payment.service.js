/**
 * payment.service.js — Servicio de Pagos MercadoPago
 * ====================================================
 * RESPONSABILIDAD ÚNICA: Gestionar la creación de Preferences.
 *
 * INVERSIÓN DE DEPENDENCIA (DIP):
 *   El constructor recibe `mpClient` como parámetro → no depende
 *   de ninguna variable global ni del módulo de configuración
 *   directamente. Esto facilita el testing con mocks.
 *
 * USO:
 *   import paymentService from './payment.service.js'
 *   const result = await paymentService.createPreference({ items, payer, ... })
 */

import { Preference } from 'mercadopago'
import mpClient, { mpEnvironment, mpAccountHint } from '../config/mp.config.js'

// ─── Defaults configurables via .env ─────────────────────────
const BASE_URL      = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const DEFAULT_CURRENCY = process.env.MP_CURRENCY || 'ARS'

const DEFAULT_BACK_URLS = {
  success: `${BASE_URL}/pago/exito`,
  failure: `${BASE_URL}/pago/error`,
  pending: `${BASE_URL}/pago/pendiente`,
}

// ─── Validadores internos ─────────────────────────────────────

/**
 * Valida que un ítem tenga los campos obligatorios para MercadoPago.
 * @param {Object} item
 * @param {number} index
 * @throws {Error}
 */
function validateItem(item, index) {
  if (!item.title || typeof item.title !== 'string') {
    throw new Error(`Item[${index}]: 'title' es obligatorio y debe ser string`)
  }
  if (!item.quantity || item.quantity < 1) {
    throw new Error(`Item[${index}]: 'quantity' debe ser un entero >= 1`)
  }
  if (!item.unit_price || item.unit_price <= 0) {
    throw new Error(`Item[${index}]: 'unit_price' debe ser un número > 0`)
  }
}

// ─── Clase PaymentService ─────────────────────────────────────

class PaymentService {
  /** @type {Preference} */
  #preferenceAPI

  /**
   * @param {import('mercadopago').MercadoPagoConfig} client
   *   Instancia de MercadoPagoConfig inyectada desde fuera.
   *   Para tests: pasar un mock; en producción: la instancia del Singleton.
   */
  constructor(client) {
    this.#preferenceAPI = new Preference(client)

    console.info(
      `[PaymentService] Inicializado → ambiente: ${mpEnvironment} | cuenta: ${mpAccountHint}`
    )
  }

  /**
   * Crea una Preference de pago en MercadoPago.
   *
   * @param {Object}   params
   * @param {Array}    params.items               Productos a pagar (obligatorio)
   * @param {Object}   [params.payer]             Datos del comprador
   * @param {string}   [params.externalReference] ID externo (ej: ID de la orden en nuestra DB)
   * @param {Object}   [params.backUrls]          URLs de retorno (success / failure / pending)
   * @param {string}   [params.autoReturn]        'approved' | 'all' | undefined
   * @param {string}   [params.notificationUrl]   Webhook para notificaciones IPN
   * @param {string}   [params.statementDescriptor] Texto en resumen de tarjeta
   * @param {number}   [params.expirationMinutes] Minutos hasta que expira la preferencia (0 = sin límite)
   *
   * @returns {Promise<{id, initPoint, sandboxInitPoint, publicKey}>}
   */
  async createPreference({
    items,
    payer            = undefined,
    externalReference= undefined,
    backUrls         = DEFAULT_BACK_URLS,
    autoReturn       = 'approved',
    notificationUrl  = undefined,
    statementDescriptor = 'GOYITO\'S DIGITAL',
    expirationMinutes= 0,
  }) {
    // ── 1. Validación de entrada ─────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("'items' debe ser un array con al menos un elemento")
    }
    items.forEach((item, i) => validateItem(item, i))

    // ── 2. Normalizar ítems al formato de MP ─────────────────
    const normalizedItems = items.map(item => ({
      id:           item.id           ?? String(item.title).toLowerCase().replace(/\s+/g, '-'),
      title:        String(item.title),
      description:  item.description  ?? '',
      quantity:     parseInt(item.quantity, 10),
      unit_price:   parseFloat(item.unit_price),
      currency_id:  item.currency_id  ?? DEFAULT_CURRENCY,
      picture_url:  item.picture_url  ?? undefined,
      category_id:  item.category_id  ?? 'others',
    }))

    // ── 3. Construir cuerpo de la Preference ─────────────────
    const preferenceBody = {
      items: normalizedItems,
      ...(payer && { payer }),
      ...(externalReference && { external_reference: externalReference }),
      back_urls: {
        success: backUrls.success ?? DEFAULT_BACK_URLS.success,
        failure: backUrls.failure ?? DEFAULT_BACK_URLS.failure,
        pending: backUrls.pending ?? DEFAULT_BACK_URLS.pending,
      },
      auto_return: autoReturn,
      ...(notificationUrl && { notification_url: notificationUrl }),
      statement_descriptor: statementDescriptor,
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

    // ── 4. Llamada al SDK ────────────────────────────────────
    const response = await this.#preferenceAPI.create({ body: preferenceBody })

    console.info(
      `[PaymentService] Preference creada OK | id: ${response.id} | ` +
      `ambiente: ${mpEnvironment}`
    )

    return {
      id:                response.id,
      initPoint:         response.init_point,         // URL de pago (producción)
      sandboxInitPoint:  response.sandbox_init_point, // URL de pago (sandbox)
      publicKey:         process.env.MP_PUBLIC_KEY ?? '',
      environment:       mpEnvironment,
    }
  }

  /**
   * Busca una Preference existente por su ID.
   * Útil para verificar estado o reenviar al usuario.
   *
   * @param {string} preferenceId
   * @returns {Promise<Object>}
   */
  async getPreference(preferenceId) {
    if (!preferenceId) throw new Error("'preferenceId' es requerido")

    console.info(`[PaymentService] Buscando preference | id: ${preferenceId}`)
    const response = await this.#preferenceAPI.get({ preferenceId })

    return {
      id:           response.id,
      status:       response.status ?? 'active',
      items:        response.items,
      initPoint:    response.init_point,
      externalRef:  response.external_reference,
      createdAt:    response.date_created,
    }
  }
}

// ─── Exportar instancia Singleton ────────────────────────────
// Se crea UNA vez al importar este módulo; mpClient ya es Singleton,
// por lo que la cadena de Singletons garantiza cohesión total.
const paymentService = new PaymentService(mpClient)

export default paymentService
export { PaymentService } // export de la clase para testing con mock
