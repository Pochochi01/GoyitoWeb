import api from '../axios'

// Origen del backend para componer URLs de imagen (mismo patrón que productService).
const _apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const BASE = (() => {
  try { return new URL(_apiUrl).origin } catch { return 'http://localhost:5001' }
})()

const toUrl = (ruta) => ruta ? `${BASE}/${ruta}` : null

export const adaptCategory = (c) => ({
  id:              c.id,
  nombre:          c.nombre,
  slug:            c.slug || '',
  descripcion:     c.descripcion || '',
  imagen:          c.imagen || null,
  imagenUrl:       toUrl(c.imagen),
  orden:           Number(c.orden ?? 0),
  activo:          c.activo === 1 || c.activo === true,
  productosCount:  Number(c.productos_count ?? 0),
  createdAt:       c.created_at || null,
})

const categoryService = {
  async getAll() {
    const { data } = await api.get('/categories')
    return data.map(adaptCategory)
  },

  async getById(id) {
    const { data } = await api.get(`/categories/${id}`)
    return adaptCategory(data)
  },

  async create(formData) {
    const { data } = await api.post('/categories', formData, {
      headers: { 'Content-Type': undefined },
    })
    return adaptCategory(data)
  },

  async update(id, formData) {
    const { data } = await api.patch(`/categories/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return adaptCategory(data)
  },

  async remove(id) {
    const { data } = await api.delete(`/categories/${id}`)
    return data
  },
}

export default categoryService
