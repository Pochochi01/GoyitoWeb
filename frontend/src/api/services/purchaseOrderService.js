import api from '../axios'

const purchaseOrderService = {
  async getAll(params = {}) {
    const { data } = await api.get('/purchase-orders', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/purchase-orders/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/purchase-orders', payload)
    return data
  },

  async updateEstado(id, estado) {
    const { data } = await api.patch(`/purchase-orders/${id}/estado`, { estado })
    return data
  },
}

export default purchaseOrderService
