import api from '../axios'

const customerService = {
  async getAll(params = {}) {
    const { data } = await api.get('/customers', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/customers/${id}`)
    return data
  },

  async getOrders(id) {
    const { data } = await api.get(`/customers/${id}/orders`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/customers', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/customers/${id}`, payload)
    return data
  },
}

export default customerService
