const { pool } = require('../config/db')

const Customer = {
  /**
   * Lista clientes con filtros opcionales.
   * @param {string} [opts.segmento]
   * @param {string} [opts.startDate]  YYYY-MM-DD — filtra clientes con última compra >= esta fecha
   * @param {string} [opts.endDate]    YYYY-MM-DD — filtra clientes con última compra <= esta fecha
   */
  async findAll({ segmento, startDate, endDate, page = 1, limit = 50 } = {}) {
    const offset  = (page - 1) * limit
    const where   = []
    const having  = []
    const params  = []

    if (segmento)  { where.push('c.segmento = ?'); params.push(segmento) }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // Filtro por rango de última compra (HAVING porque es un agregado)
    const havingParams = []
    if (startDate) { having.push('MAX(so.fecha) >= ?'); havingParams.push(startDate) }
    if (endDate)   { having.push('MAX(so.fecha) <= ?'); havingParams.push(endDate) }
    const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(so.id)             AS total_compras,
              IFNULL(SUM(so.total), 0) AS total_gastado,
              IFNULL(AVG(so.total), 0) AS ticket_promedio,
              MAX(so.fecha)            AS ultima_compra
       FROM customers c
       LEFT JOIN sales_orders so ON so.cliente_id = c.id AND so.estado != 'Cancelada'
       ${clause}
       GROUP BY c.id
       ${havingClause}
       ORDER BY total_gastado DESC LIMIT ? OFFSET ?`,
      [...params, ...havingParams, limit, offset]
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email])
    return rows[0] || null
  },

  async create({ nombre, email, segmento = 'Nuevo', telefono, usuario_id }) {
    const [r] = await pool.query(
      'INSERT INTO customers (nombre, email, segmento, telefono, usuario_id) VALUES (?,?,?,?,?)',
      [nombre, email, segmento, telefono || null, usuario_id || null]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['nombre', 'email', 'segmento', 'telefono']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE customers SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },
}

module.exports = Customer
