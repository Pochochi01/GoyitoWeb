/**
 * stockService
 * ------------
 * Consume GET /api/stock (movimientos) y GET /api/stock/low-stock.
 *
 * getMovements(params)  → array de movimientos con producto + usuario
 * getLowStock()         → array de productos con stock ≤ mínimo
 * addMovement(payload)  → registra un movimiento y ajusta stock
 */
import api from '../axios'

const stockService = {
  async getMovements(params = {}) {
    const { data } = await api.get('/stock', { params })
    return data
  },
  async getLowStock() {
    const { data } = await api.get('/stock/low-stock')
    return data
  },
  async addMovement(payload) {
    const { data } = await api.post('/stock', payload)
    return data
  },
}

export default stockService
