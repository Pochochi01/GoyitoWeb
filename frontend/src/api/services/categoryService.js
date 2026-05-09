import api from '../axios'

const categoryService = {
  async getAll() {
    const { data } = await api.get('/categories')
    return data // [{ id, nombre }]
  },

  async create(nombre) {
    const { data } = await api.post('/categories', { nombre })
    return data
  },

  async update(id, nombre) {
    const { data } = await api.patch(`/categories/${id}`, { nombre })
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/categories/${id}`)
    return data
  },
}

export default categoryService
