import api from '../axios'

const paymentService = {
  /**
   * Inicia un checkout con MercadoPago SIN crear orden en BD.
   * La orden se crea recién cuando el pago se aprueba (en el sync al volver).
   *
   * @param {Object} payload
   * @param {Array<{producto_id, nombre_producto, cantidad, precio_unit}>} payload.items
   * @param {Object} [payload.payer]      { email }
   * @param {string} [payload.canal]      default 'E-commerce'
   * @param {number} [payload.cliente_id] opcional
   * @returns {Promise<{ ok: boolean, preferenceId: string, init_point: string,
   *                     sandbox_init_point: string }>}
   */
  async initMP(payload) {
    const { data } = await api.post('/payments/init-mp', payload)
    return data
  },

  /**
   * Sincroniza el estado de un pago de MercadoPago contra la orden vinculada.
   * El backend consulta MP (no confía en los query params del navegador), mapea
   * el estado y:
   *   · Si la orden existe → actualiza su estado.
   *   · Si NO existe y el pago está aprobado → la crea desde la metadata.
   *
   * Llamar al volver de MP (en /pago/exito o /pago/pendiente).
   *
   * @param {string|number} paymentId  payment_id o collection_id de los query params
   * @returns {Promise<{ ok: boolean, mpStatus?: string, orderId?: number,
   *                     nuevoEstado?: string, updated?: boolean, created?: boolean }>}
   */
  async sync(paymentId) {
    if (!paymentId) return { ok: false }
    const { data } = await api.get('/payments/sync', { params: { payment_id: paymentId } })
    return data
  },
}

export default paymentService
