const { pool } = require('../config/db')

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

const Category = {
  async findAll({ onlyActive = false } = {}) {
    const where = onlyActive ? 'WHERE activo = 1' : ''
    const [rows] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM products p WHERE p.categoria_id = c.id) AS productos_count
       FROM categories c
       ${where}
       ORDER BY c.orden ASC, c.nombre ASC`
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug])
    return rows[0] || null
  },

  async create({ nombre, descripcion = null, imagen = null, orden = 0, activo = 1 }) {
    const slug = await Category._uniqueSlug(slugify(nombre))
    const [r] = await pool.query(
      'INSERT INTO categories (nombre, slug, descripcion, imagen, orden, activo) VALUES (?,?,?,?,?,?)',
      [nombre, slug, descripcion, imagen, orden, activo ? 1 : 0]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['nombre', 'slug', 'descripcion', 'imagen', 'orden', 'activo']
    const data = { ...fields }
    if (data.nombre && !data.slug) data.slug = await Category._uniqueSlug(slugify(data.nombre), id)
    if (data.activo !== undefined) data.activo = data.activo ? 1 : 0

    const entries = Object.entries(data).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE categories SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  async delete(id) {
    const [r] = await pool.query('DELETE FROM categories WHERE id = ?', [id])
    return r.affectedRows
  },

  async productCount(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE categoria_id = ?', [id]
    )
    return rows[0].total
  },

  async _uniqueSlug(baseSlug, ignoreId = null) {
    let candidate = baseSlug || 'categoria'
    let i = 2
    while (true) {
      const [rows] = await pool.query(
        'SELECT id FROM categories WHERE slug = ? AND id <> ? LIMIT 1',
        [candidate, ignoreId || 0]
      )
      if (!rows.length) return candidate
      candidate = `${baseSlug}-${i++}`
    }
  },
}

module.exports = Category
