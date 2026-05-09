import api from '../axios'

const supplierService = {
  async getAll(params = {}) {
    const { data } = await api.get('/suppliers', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/suppliers/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/suppliers', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/suppliers/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/suppliers/${id}`)
    return data
  },
}

export default supplierService
