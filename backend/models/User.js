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
      `SELECT id, username, nombre, email, rol, activo, sucursal_id,
              google_id, avatar_url, provider, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    )
    return rows[0] || null
  },

  async findByEmail(email) {
    if (!email) return null
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    return rows[0] || null
  },

  async findByGoogleId(googleId) {
    if (!googleId) return null
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE google_id = ? LIMIT 1',
      [String(googleId)]
    )
    return rows[0] || null
  },

  /**
   * Vincula una cuenta existente (login tradicional) con un perfil Google.
   * Actualiza google_id, avatar_url y provider. No toca password ni email.
   */
  async linkGoogleAccount(userId, { googleId, avatarUrl }) {
    const [r] = await pool.query(
      `UPDATE users
       SET google_id = ?, avatar_url = COALESCE(?, avatar_url), provider = 'google'
       WHERE id = ?`,
      [String(googleId), avatarUrl || null, userId]
    )
    return r.affectedRows
  },

  /**
   * Crea un usuario desde el perfil Google.
   * El username se deriva del email (parte antes del @) + sufijo numérico si colisiona.
   * password_hash queda NULL — el usuario solo puede entrar vía Google.
   */
  async createFromGoogle({ googleId, email, nombre, avatarUrl, rol = 'comprador' }) {
    const baseUsername = String(email).split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
    const username     = await User._uniqueUsername(baseUsername || `user${Date.now()}`)

    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, nombre, email, google_id, avatar_url, provider, rol)
       VALUES (?, NULL, ?, ?, ?, ?, 'google', ?)`,
      [username, nombre, email, String(googleId), avatarUrl || null, rol]
    )
    return result.insertId
  },

  async _uniqueUsername(base) {
    let candidate = base
    let i = 2
    while (true) {
      const [rows] = await pool.query(
        'SELECT id FROM users WHERE username = ? LIMIT 1', [candidate]
      )
      if (!rows.length) return candidate
      candidate = `${base}${i++}`
    }
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
