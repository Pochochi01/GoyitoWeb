const { pool } = require('../config/db')

const Supplier = {
  async findAll({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit
    const [rows] = await pool.query(
      'SELECT * FROM suppliers ORDER BY nombre LIMIT ? OFFSET ?',
      [limit, offset]
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async create({ nombre, cuit, contacto, email, tel, cond_pago, puntaje = 0 }) {
    const [r] = await pool.query(
      'INSERT INTO suppliers (nombre, cuit, contacto, email, tel, cond_pago, puntaje) VALUES (?,?,?,?,?,?,?)',
      [nombre, cuit, contacto || null, email || null, tel || null, cond_pago || null, puntaje]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['nombre', 'cuit', 'contacto', 'email', 'tel', 'cond_pago', 'puntaje']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE suppliers SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  async delete(id) {
    const [r] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id])
    return r.affectedRows
  },
}

module.exports = Supplier
