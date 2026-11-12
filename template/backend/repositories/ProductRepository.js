/**
 * ProductRepository
 * Modelo: { id, barcode, titulo, precio, descuento, categoria_id,
 *           imagen, descripcion, activo, created_at }
 * Tabla auxiliar: product_images (id, producto_id, ruta, orden)
 *
 * Los `list` y `findById` deberían enriquecer con:
 *   · categoria (JOIN con categories.nombre)
 *   · stock, stock_minimo, costo, ubicacion (JOIN con product_stock)
 *   · imagenes_extra (subquery/join con product_images)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const ProductRepository = {
  /**
   * @param {object} opts { page, limit, categoria_id, activo, oferta }
   * @returns {Promise<object[]>}  productos enriquecidos con stock y imágenes
   */
  async list({ page = 1, limit = 20, categoria_id, activo, oferta } = {}) { return NI() },

  /** @returns {Promise<object|null>} */
  async findById(id) { return NI() },

  /** @returns {Promise<object|null>} */
  async findByBarcode(barcode) { return NI() },

  /**
   * @param {object} data { titulo, precio, descuento, categoria_id, imagen, descripcion, barcode }
   * @param {*} conn  transacción opcional
   * @returns {Promise<number>} id
   */
  async create({ titulo, precio, descuento = 0, categoria_id, imagen = null, descripcion = null, barcode = null }, conn) {
    return NI()
  },

  /**
   * Campos permitidos: titulo, precio, descuento, categoria_id, imagen, activo, descripcion, barcode
   * @returns {Promise<number>} filas afectadas
   */
  async update(id, fields) { return NI() },

  /**
   * Agrega imágenes adicionales al producto.
   * @param {number} producto_id
   * @param {string[]} rutas  rutas relativas (ej. "uploads/foo.webp")
   * @param {*} conn  transacción opcional
   */
  async addImages(producto_id, rutas, conn) { return NI() },

  /**
   * Elimina TODAS las imágenes extras del producto y devuelve las rutas
   * que estaban registradas (para poder borrarlas del filesystem).
   * @returns {Promise<string[]>}
   */
  async deleteImages(producto_id, conn) { return NI() },

  /**
   * Elimina el producto + dependencias (stock_movements, product_images).
   * @returns {Promise<number>} filas afectadas
   */
  async delete(id, conn) { return NI() },

  /**
   * @param {object} opts { categoria_id, activo }
   * @returns {Promise<number>} total
   */
  async count({ categoria_id, activo } = {}) { return NI() },

  /**
   * Dado un array de IDs, devuelve un Set con los que existen.
   * Usado para sanear producto_id antes de INSERT en tablas con FK.
   * @returns {Promise<Set<number>>}
   */
  async existingIds(ids, conn) { return NI() },
}

module.exports = ProductRepository
