const { pool } = require('../config/db')

const PriceHistory = {
  async listByProduct(producto_id) {
    const [rows] = await pool.query(
      'SELECT * FROM price_history WHERE producto_id = ? ORDER BY fecha DESC',
      [producto_id]
    )
    return rows
  },

  async create({ producto_id, precio, motivo, fecha }) {
    const [r] = await pool.query(
      'INSERT INTO price_history (producto_id, precio, motivo, fecha) VALUES (?,?,?,?)',
      [producto_id, precio, motivo || null, fecha]
    )
    return r.insertId
  },
}

module.exports = PriceHistory
