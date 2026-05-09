const { pool } = require('../config/db')

const SalesOrder = {
  /**
   * Lista órdenes con filtros opcionales.
   * @param {Object} opts
   * @param {string} [opts.estado]
   * @param {string} [opts.canal]
   * @param {number} [opts.cliente_id]
   * @param {string} [opts.startDate]  YYYY-MM-DD — fecha mínima
   * @param {string} [opts.endDate]    YYYY-MM-DD — fecha máxima
   */
  async list({ estado, canal, cliente_id, startDate, endDate, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []

    if (estado)     { where.push('so.estado = ?');     params.push(estado) }
    if (canal)      { where.push('so.canal = ?');      params.push(canal) }
    if (cliente_id) { where.push('so.cliente_id = ?'); params.push(cliente_id) }
    if (startDate)  { where.push('so.fecha >= ?');     params.push(startDate) }
    if (endDate)    { where.push('so.fecha <= ?');     params.push(endDate) }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)

    const [rows] = await pool.query(
      `SELECT so.*, c.nombre AS cliente_nombre, u.username AS operador_nombre
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       LEFT JOIN users     u ON u.id = so.operador_id
       ${clause}
       ORDER BY so.fecha DESC, so.id DESC LIMIT ? OFFSET ?`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT so.*, c.nombre AS cliente_nombre, u.username AS operador_nombre
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       LEFT JOIN users     u ON u.id = so.operador_id
       WHERE so.id = ? LIMIT 1`,
      [id]
    )
    if (!rows[0]) return null
    const [items] = await pool.query(
      'SELECT * FROM sales_order_items WHERE orden_id = ?', [id]
    )
    return { ...rows[0], items }
  },

  async create({ fecha, canal, cliente_id, operador_id, estado, metodo_pago, total, items }, conn) {
    const db = conn || pool
    const [r] = await db.query(
      `INSERT INTO sales_orders (fecha, canal, cliente_id, operador_id, estado, metodo_pago, total)
       VALUES (?,?,?,?,?,?,?)`,
      [fecha, canal, cliente_id || null, operador_id || null, estado || 'Pendiente', metodo_pago, total]
    )
    const orderId = r.insertId
    if (items?.length) {
      const vals = items.map(i => [orderId, i.producto_id || null, i.nombre_producto, i.cantidad, i.precio_unit])
      await db.query(
        'INSERT INTO sales_order_items (orden_id, producto_id, nombre_producto, cantidad, precio_unit) VALUES ?',
        [vals]
      )
    }
    return orderId
  },

  async updateEstado(id, estado) {
    const [r] = await pool.query('UPDATE sales_orders SET estado = ? WHERE id = ?', [estado, id])
    return r.affectedRows
  },

  async summary({ desde, hasta, startDate, endDate } = {}) {
    const where  = []
    const params = []
    const sd = startDate || desde
    const ed = endDate   || hasta
    if (sd) { where.push('fecha >= ?'); params.push(sd) }
    if (ed) { where.push('fecha <= ?'); params.push(ed) }
    const clause = where.length
      ? `WHERE ${where.join(' AND ')} AND estado != 'Cancelada'`
      : "WHERE estado != 'Cancelada'"
    const [rows] = await pool.query(
      `SELECT COUNT(*)              AS total_ordenes,
              SUM(total)            AS ingresos,
              AVG(total)            AS ticket_promedio,
              SUM(canal='E-commerce') AS ecom,
              SUM(canal='POS')        AS pos
       FROM sales_orders ${clause}`,
      params
    )
    return rows[0]
  },
}

module.exports = SalesOrder
