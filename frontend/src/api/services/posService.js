/**
 * posService
 * ----------
 * Servicios para el módulo POS. Todos los endpoints requieren
 * rol 'pos' o 'admin' (JWT en header Authorization).
 *
 * searchProducts(q)  → array de productos con stock
 * searchCustomers(q) → array de clientes
 * getBranches()      → array de sucursales activas
 * createSale(data)   → venta creada con items (para comprobante)
 * getSales(params)   → listado de ventas POS del día
 * getSaleById(id)    → detalle de venta con items
 * getReports(params) → KPIs + métodos de pago + top productos
 */
import api from '../axios'

const posService = {
  async searchProducts(q = '') {
    const { data } = await api.get('/pos/products', { params: { q, limit: 48 } })
    return data
  },

  /** Busca un producto por código de barras exacto (para lectores de barras) */
  async searchByBarcode(barcode) {
    const { data } = await api.get('/pos/products', { params: { barcode } })
    return data[0] || null
  },

  async searchCustomers(q = '') {
    const { data } = await api.get('/pos/customers', { params: { q } })
    return data
  },

  async getBranches() {
    const { data } = await api.get('/pos/branches')
    return data
  },

  async createSale(payload) {
    const { data } = await api.post('/pos/sales', payload)
    return data
  },

  async getSales(params = {}) {
    const { data } = await api.get('/pos/sales', { params })
    return data
  },

  async getSaleById(id) {
    const { data } = await api.get(`/pos/sales/${id}`)
    return data
  },

  async getReports(params = {}) {
    const { data } = await api.get('/pos/reports', { params })
    return data
  },
}

export default posService
