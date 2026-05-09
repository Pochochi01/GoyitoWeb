const { pool } = require('../config/db')

const PurchaseOrder = {
  /**
   * Lista órdenes de compra con filtros opcionales.
   * @param {string} [opts.startDate]  YYYY-MM-DD
   * @param {string} [opts.endDate]    YYYY-MM-DD
   */
  async list({ estado, proveedor_id, startDate, endDate, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []

    if (estado)       { where.push('po.estado = ?');       params.push(estado) }
    if (proveedor_id) { where.push('po.proveedor_id = ?'); params.push(proveedor_id) }
    if (startDate)    { where.push('po.fecha >= ?');       params.push(startDate) }
    if (endDate)      { where.push('po.fecha <= ?');       params.push(endDate) }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)

    const [rows] = await pool.query(
      `SELECT po.*, s.nombre AS proveedor_nombre
       FROM purchase_orders po
       JOIN suppliers s ON s.id = po.proveedor_id
       ${clause}
       ORDER BY po.fecha DESC LIMIT ? OFFSET ?`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT po.*, s.nombre AS proveedor_nombre
       FROM purchase_orders po
       JOIN suppliers s ON s.id = po.proveedor_id
       WHERE po.id = ? LIMIT 1`,
      [id]
    )
    if (!rows[0]) return null
    const [items] = await pool.query(
      'SELECT * FROM purchase_order_items WHERE orden_id = ?', [id]
    )
    return { ...rows[0], items }
  },

  async create({ fecha, proveedor_id, estado, comprobante, dias_entrega, total, items }, conn) {
    const db = conn || pool
    const [r] = await db.query(
      'INSERT INTO purchase_orders (fecha, proveedor_id, estado, comprobante, dias_entrega, total) VALUES (?,?,?,?,?,?)',
      [fecha, proveedor_id, estado || 'Pendiente', comprobante || null, dias_entrega || null, total]
    )
    const orderId = r.insertId
    if (items?.length) {
      const vals = items.map(i => [orderId, i.producto_id || null, i.nombre_producto, i.cantidad, i.precio_unit])
      await db.query(
        'INSERT INTO purchase_order_items (orden_id, producto_id, nombre_producto, cantidad, precio_unit) VALUES ?',
        [vals]
      )
    }
    return orderId
  },

  async updateEstado(id, estado) {
    const [r] = await pool.query('UPDATE purchase_orders SET estado = ? WHERE id = ?', [estado, id])
    return r.affectedRows
  },
}

module.exports = PurchaseOrder
