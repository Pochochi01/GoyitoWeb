/**
 * PriceHistoryRepository
 * Modelo: { id, producto_id, precio, motivo, fecha }
 * Se registra cada vez que cambia el precio de un producto.
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const PriceHistoryRepository = {
  /** @returns {Promise<object[]>}  ordenado por fecha DESC */
  async listByProduct(producto_id) { return NI() },

  /** @param {*} conn  transacción opcional */
  async create({ producto_id, precio, motivo, fecha }, conn) { return NI() },
}

module.exports = PriceHistoryRepository
