const { pool } = require('../config/db')

const VALID_ROLES = ['comprador', 'pos', 'admin_complejo', 'admin']

const User = {
  VALID_ROLES,

  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND activo = 1 LIMIT 1',
      [username]
    )
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, nombre, email, rol, activo, sucursal_id, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    )
    return rows[0] || null
  },

  async create({ username, password_hash, nombre, email, rol = 'comprador' }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, nombre, email, rol) VALUES (?,?,?,?,?)',
      [username, password_hash, nombre, email, rol]
    )
    return result.insertId
  },

  async update(id, fields) {
    const allowed = ['nombre', 'email', 'activo', 'rol', 'sucursal_id']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE users SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  async updatePassword(id, password_hash) {
    const [r] = await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id])
    return r.affectedRows
  },

  /**
   * Lista usuarios con filtros opcionales.
   * @param {string}  [opts.rol]     Filtrar por rol exacto
   * @param {string}  [opts.search]  Buscar en nombre, username o email
   * @param {boolean} [opts.activo]  Filtrar por estado activo
   */
  async list({ page = 1, limit = 20, rol, search, activo } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []

    if (rol !== undefined && rol !== '') {
      where.push('rol = ?')
      params.push(rol)
    }
    if (activo !== undefined) {
      where.push('activo = ?')
      params.push(activo ? 1 : 0)
    }
    if (search?.trim()) {
      where.push('(nombre LIKE ? OR username LIKE ? OR email LIKE ?)')
      const like = `%${search.trim()}%`
      params.push(like, like, like)
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)

    const [rows] = await pool.query(
      `SELECT id, username, nombre, email, rol, activo, sucursal_id, created_at
       FROM users
       ${clause}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    )

    // Total para paginación
    const countParams = params.slice(0, -2)
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${clause}`,
      countParams
    )

    return { rows, total }
  },
}

module.exports = User
