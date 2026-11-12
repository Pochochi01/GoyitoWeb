/**
 * SupplierRepository
 * Modelo: { id, nombre, cuit, contacto, email, tel, cond_pago, puntaje, created_at }
 * cuit UNIQUE.
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const SupplierRepository = {
  async findAll({ page = 1, limit = 50 } = {}) { return NI() },
  async findById(id) { return NI() },

  /** @returns {Promise<number>} id */
  async create({ nombre, cuit, contacto, email, tel, cond_pago, puntaje = 0 }) {
    return NI()
  },

  /** Campos permitidos: nombre, cuit, contacto, email, tel, cond_pago, puntaje */
  async update(id, fields) { return NI() },

  /**
   * Elimina proveedor + purchase_orders relacionadas.
   * Usar transacción atómica.
   */
  async delete(id) { return NI() },
}

module.exports = SupplierRepository
