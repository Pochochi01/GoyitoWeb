/**
 * CategoryRepository
 * Modelo: { id, nombre, slug, descripcion, imagen, orden, activo, created_at }
 * Constraints: nombre UNIQUE, slug UNIQUE
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const CategoryRepository = {
  /** @param {object} opts { onlyActive } @returns {Promise<object[]>} — incluye productos_count */
  async findAll({ onlyActive = false } = {}) { return NI() },

  /** @returns {Promise<object|null>} */
  async findById(id) { return NI() },

  /** @returns {Promise<object|null>} */
  async findBySlug(slug) { return NI() },

  /**
   * @param {object} data { nombre, descripcion, imagen, orden, activo }
   * @returns {Promise<number>} id
   * NOTA: debe auto-generar `slug` único desde `nombre`.
   */
  async create({ nombre, descripcion = null, imagen = null, orden = 0, activo = 1 }) { return NI() },

  /**
   * Campos permitidos: nombre, slug, descripcion, imagen, orden, activo.
   * Si viene `nombre` sin `slug`, regenera slug único.
   * @returns {Promise<number>} filas afectadas
   */
  async update(id, fields) { return NI() },

  /** @returns {Promise<number>} filas afectadas */
  async delete(id) { return NI() },

  /** @returns {Promise<number>} cantidad de productos con esta categoría */
  async productCount(id) { return NI() },
}

module.exports = CategoryRepository
