/**
 * ReviewRepository
 * Tabla: reviews { id, orden_id, usuario_id, rating (1..5), reseña, created_at }
 * UNIQUE(orden_id, usuario_id) — un usuario reseña una orden solo una vez.
 *
 * Reglas:
 *   - Solo se puede reseñar órdenes con estado 'Entregada'.
 *   - Solo el dueño de la orden puede reseñarla.
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const ReviewRepository = {
  /**
   * Chequeos previos al create — devuelve datos para validar en el controller:
   *   { existsOrder, estadoOrden, usuarioIdOrden, existsReview }
   */
  async validateBeforeCreate(orden_id, usuario_id) { return NI() },

  /** @returns {Promise<number>} id de la nueva review */
  async create({ orden_id, usuario_id, rating, reseña }) { return NI() },

  /** @returns {Promise<object|null>} */
  async findByOrderAndUser(orden_id, usuario_id) { return NI() },

  /**
   * Resumen estadístico.
   * @returns {Promise<{total, promedio, negativas, neutrales, positivas, r1..r5}>}
   */
  async getSummary() { return NI() },

  /**
   * Lista con filtros. Enriquece con usuario_nombre, orden_fecha, productos.
   * @param {object} opts { grupo: 'negativas'|'neutrales'|'positivas', search, page, limit }
   * @returns {Promise<{data, total, page, limit}>}
   */
  async listAll({ grupo, search, page = 1, limit = 20 } = {}) { return NI() },

  /**
   * Órdenes 'Entregada' que aún NO tienen reseña.
   * @returns {Promise<{data, total, page, limit}>}
   */
  async listPendingOrders({ search, page = 1, limit = 20 } = {}) { return NI() },
}

module.exports = ReviewRepository
