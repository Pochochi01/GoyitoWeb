/**
 * CartRepository — carrito persistente por usuario.
 * Modelo: cart_items { id, usuario_id, producto_id, cantidad, created_at }
 * UNIQUE(usuario_id, producto_id)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const CartRepository = {
  /**
   * @returns {Promise<object[]>}  items enriquecidos con datos del producto
   *   (titulo, precio, descuento, imagen, categoria)
   */
  async findByUser(usuario_id) { return NI() },

  /**
   * Insert-or-update. Si el (usuario_id, producto_id) ya existe,
   * SUMA la cantidad (comportamiento "agregar al carrito").
   */
  async upsert(usuario_id, producto_id, cantidad) { return NI() },

  /**
   * Setea la cantidad exacta. Si cantidad <= 0 → elimina el item.
   * @returns {Promise<number>} filas afectadas
   */
  async updateQuantity(usuario_id, producto_id, cantidad) { return NI() },

  async remove(usuario_id, producto_id) { return NI() },

  async clear(usuario_id) { return NI() },
}

module.exports = CartRepository
