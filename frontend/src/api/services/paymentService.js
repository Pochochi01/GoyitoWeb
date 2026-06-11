import api from '../axios'

const paymentService = {
  /**
   * Sincroniza el estado de un pago de MercadoPago contra la orden vinculada.
   * El backend consulta MP (no confía en los query params del navegador), mapea
   * el estado y actualiza la orden si corresponde.
   *
   * Llamar al volver de MP (en /pago/exito o /pago/pendiente).
   *
   * @param {string|number} paymentId  payment_id o collection_id de los query params
   * @returns {Promise<{ ok: boolean, mpStatus?: string, orderId?: number,
   *                     nuevoEstado?: string, updated?: boolean }>}
   */
  async sync(paymentId) {
    if (!paymentId) return { ok: false }
    const { data } = await api.get('/payments/sync', { params: { payment_id: paymentId } })
    return data
  },
}

export default paymentService
