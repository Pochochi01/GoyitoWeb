/**
 * ProductStockRepository
 * Modelo: { id, producto_id, stock, stock_minimo, ubicacion, costo }
 * FK: producto_id → products.id (ON DELETE CASCADE)
 * UNIQUE(producto_id)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

// Helper de saneo — cubre "", null, undefined, "abc", negativos.
function toNonNegativeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback
  const n = Number(val)
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

const ProductStockRepository = {
  /** @returns {Promise<object|null>} */
  async findByProductId(producto_id) { return NI() },

  /**
   * Insert-or-update del stock del producto.
   * Además: setea products.activo = (stock > 0 ? 1 : 0).
   *
   * IMPORTANTE — antes de escribir, sanear con toNonNegativeNumber:
   *   · stock/stock_minimo son INT (no aceptan "")
   *   · costo es DECIMAL (no acepta "")
   */
  async upsert({ producto_id, stock, stock_minimo, ubicacion, costo }, conn) {
    return NI()
  },

  /**
   * Ajusta stock (+/-). GREATEST(0, stock + delta) previene negativos.
   * Sincroniza products.activo según el stock resultante.
   * @returns {Promise<number>} stock resultante
   */
  async adjustStock(producto_id, delta, conn) { return NI() },

  /** @returns {Promise<object[]>}  productos con stock <= stock_minimo */
  async lowStock() { return NI() },
}

module.exports = ProductStockRepository
module.exports.toNonNegativeNumber = toNonNegativeNumber
