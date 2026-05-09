/**
 * analyticsService — consume GET /api/analytics/{products,sales,purchases}
 * Todos los métodos aceptan { startDate, endDate } (YYYY-MM-DD) para filtrar.
 *
 * Ejemplo:
 *   analyticsService.getSales({ startDate:'2026-04-01', endDate:'2026-04-30' })
 */
import api from '../axios'

const analyticsService = {
  async getProducts(params = {}) {
    const { data } = await api.get('/analytics/products', { params })
    return data
  },

  async getSales(params = {}) {
    const { data } = await api.get('/analytics/sales', { params })
    return data
  },

  async getPurchases(params = {}) {
    const { data } = await api.get('/analytics/purchases', { params })
    return data
  },
}

export default analyticsService
