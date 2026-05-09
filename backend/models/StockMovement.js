const { pool } = require('../config/db')

const StockMovement = {
  async list({ producto_id, tipo, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []
    if (producto_id) { where.push('m.producto_id = ?'); params.push(producto_id) }
    if (tipo)        { where.push('m.tipo = ?');        params.push(tipo) }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)
    const [rows] = await pool.query(
      `SELECT m.*, p.titulo AS producto, u.username AS usuario_nombre
       FROM stock_movements m
       JOIN products p ON p.id = m.producto_id
       LEFT JOIN users u ON u.id = m.usuario_id
       ${clause}
       ORDER BY m.fecha DESC, m.id DESC LIMIT ? OFFSET ?`,
      params
    )
    return rows
  },

  /**
   * Registra un movimiento de stock.
   * IMPORTANTE: siempre pasar `conn` cuando se llama dentro de una transacción
   * para evitar lock wait timeout por verificación de FK sobre conexión distinta.
   */
  async create({ fecha, producto_id, tipo, cantidad, motivo, usuario_id }, conn) {
    const db = conn || pool
    const [r] = await db.query(
      'INSERT INTO stock_movements (fecha, producto_id, tipo, cantidad, motivo, usuario_id) VALUES (?,?,?,?,?,?)',
      [fecha, producto_id, tipo, cantidad, motivo || null, usuario_id || null]
    )
    return r.insertId
  },
}

module.exports = StockMovement
