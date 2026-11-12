/**
 * CustomerRepository
 * Modelo: { id, nombre, email, segmento, telefono, usuario_id, created_at }
 * segmento: enum ('VIP' | 'Premium' | 'Regular' | 'Nuevo')
 * email UNIQUE, usuario_id UNIQUE nullable (link a users si tiene cuenta).
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const CustomerRepository = {
  /**
   * @param {object} opts { segmento, startDate, endDate, page, limit }
   * @returns {Promise<object[]>}  enriquece con total_compras, total_gastado,
   *   ticket_promedio, ultima_compra (JOIN + GROUP BY sales_orders).
   *   startDate/endDate filtran por MAX(sales_orders.fecha) via HAVING.
   */
  async findAll({ segmento, startDate, endDate, page = 1, limit = 50 } = {}) { return NI() },

  async findById(id) { return NI() },
  async findByEmail(email) { return NI() },
  /**
   * @returns {Promise<object|null>}  customer JOIN users (username, email)
   *   { id, nombre, email, segmento, telefono, usuario_id, username, user_email }
   */
  async findByUserId(usuario_id) { return NI() },

  async create({ nombre, email, segmento = 'Nuevo', telefono, usuario_id }) { return NI() },

  /** Campos permitidos: nombre, email, segmento, telefono */
  async update(id, fields) { return NI() },
}

module.exports = CustomerRepository
