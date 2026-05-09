import api from '../axios'

const salesOrderService = {
  async getAll(params = {}) {
    const { data } = await api.get('/sales-orders', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/sales-orders/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/sales-orders', payload)
    return data
  },

  /**
   * Checkout con MercadoPago.
   * Crea la orden (Pendiente) y la Preference de MP en una sola llamada.
   * @returns {{ orderId, id, init_point, sandbox_init_point }}
   */
  async checkoutWithMP(payload) {
    const { data } = await api.post('/sales-orders/checkout-mp', payload)
    return data
  },

  async updateEstado(id, estado) {
    const { data } = await api.patch(`/sales-orders/${id}/estado`, { estado })
    return data
  },

  async getSummary(params = {}) {
    const { data } = await api.get('/sales-orders/summary', { params })
    return data
  },

  async initPayment(id) {
    const { data } = await api.get(`/sales-orders/${id}/payment`)
    return data
  },
}

export default salesOrderService
