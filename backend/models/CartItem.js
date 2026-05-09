const { pool } = require('../config/db')

const CartItem = {
  async findByUser(usuario_id) {
    const [rows] = await pool.query(
      `SELECT ci.*, p.titulo, p.precio, p.descuento, p.imagen, c.nombre AS categoria
       FROM cart_items ci
       JOIN products p ON p.id = ci.producto_id
       JOIN categories c ON c.id = p.categoria_id
       WHERE ci.usuario_id = ?
       ORDER BY ci.created_at ASC`,
      [usuario_id]
    )
    return rows
  },

  async upsert(usuario_id, producto_id, cantidad) {
    await pool.query(
      `INSERT INTO cart_items (usuario_id, producto_id, cantidad)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [usuario_id, producto_id, cantidad]
    )
  },

  async updateQuantity(usuario_id, producto_id, cantidad) {
    if (cantidad <= 0) return CartItem.remove(usuario_id, producto_id)
    const [r] = await pool.query(
      'UPDATE cart_items SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?',
      [cantidad, usuario_id, producto_id]
    )
    return r.affectedRows
  },

  async remove(usuario_id, producto_id) {
    const [r] = await pool.query(
      'DELETE FROM cart_items WHERE usuario_id = ? AND producto_id = ?',
      [usuario_id, producto_id]
    )
    return r.affectedRows
  },

  async clear(usuario_id) {
    const [r] = await pool.query('DELETE FROM cart_items WHERE usuario_id = ?', [usuario_id])
    return r.affectedRows
  },
}

module.exports = CartItem
