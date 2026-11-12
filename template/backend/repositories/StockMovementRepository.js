/**
 * StockMovementRepository
 * Modelo: { id, fecha, producto_id, tipo, cantidad, motivo, usuario_id, created_at }
 * tipo: enum ('Entrada' | 'Salida' | 'Ajuste' | 'Transferencia')
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const StockMovementRepository = {
  /**
   * @param {object} opts { producto_id, tipo, page, limit }
   * @returns {Promise<object[]>}  incluye producto (titulo) y usuario_nombre
   */
  async list({ producto_id, tipo, page = 1, limit = 50 } = {}) { return NI() },

  /**
   * Registra un movimiento de stock.
   * IMPORTANTE: SIEMPRE pasar `conn` cuando se llama dentro de una TX
   * (evita lock timeout por FK check sobre conexión distinta).
   * @returns {Promise<number>} id
   */
  async create({ fecha, producto_id, tipo, cantidad, motivo, usuario_id }, conn) {
    return NI()
  },
}

module.exports = StockMovementRepository
