import api from '../axios'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const toUrl = (ruta) => ruta ? `${BASE}/${ruta}` : null

// Adapta producto backend → estructura esperada por el frontend
export const adaptProduct = (p) => {
  const mainImg  = p.imagen ? [toUrl(p.imagen)] : []
  const extraImg = p.imagenes_extra
    ? p.imagenes_extra.split('|').filter(Boolean).map(toUrl)
    : []

  return {
    id:           p.id,
    title:        p.titulo,
    price:        Number(p.precio),
    discount:     Number(p.descuento ?? 0),
    category:     p.categoria     || '',
    categoria_id: p.categoria_id,
    descripcion:  p.descripcion   || '',
    barcode:      p.barcode       || '',
    images:       [...mainImg, ...extraImg],  // array completo de URLs
    imagen:       p.imagen,                  // ruta relativa original
    imagenes_extra: extraImg,                // URLs de extras
    stock:        p.stock         ?? 0,
    stock_minimo: p.stock_minimo  ?? 5,
    costo:        Number(p.costo  ?? 0),
    ubicacion:    p.ubicacion     || '',
    activo:       p.activo === 1 || p.activo === true,
    aosDelay:     '0',
  }
}

const productService = {
  async getAll(params = {}) {
    const { data } = await api.get('/products', { params })
    return { ...data, data: data.data.map(adaptProduct) }
  },

  async getById(id) {
    const { data } = await api.get(`/products/${id}`)
    return adaptProduct(data)
  },

  async create(formData) {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(id, formData) {
    const { data } = await api.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },

  async getPriceHistory(id) {
    const { data } = await api.get(`/products/${id}/prices`)
    return data
  },

  async getLowStock() {
    const { data } = await api.get('/products/low-stock')
    return data
  },
}

export default productService
