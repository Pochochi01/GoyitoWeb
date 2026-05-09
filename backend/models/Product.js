const { pool } = require('../config/db')

const Product = {
  async list({ page = 1, limit = 20, categoria_id, activo, oferta } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []

    if (categoria_id !== undefined) { where.push('p.categoria_id = ?'); params.push(categoria_id) }
    if (activo       !== undefined) { where.push('p.activo = ?');       params.push(activo) }
    if (oferta       === true)      { where.push('p.descuento > 0') }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)

    const [rows] = await pool.query(
      `SELECT p.*,
              c.nombre AS categoria,
              s.stock, s.stock_minimo, s.costo, s.ubicacion,
              (SELECT GROUP_CONCAT(pi.ruta ORDER BY pi.orden SEPARATOR '|')
               FROM product_images pi WHERE pi.producto_id = p.id) AS imagenes_extra
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       ${clause}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*,
              c.nombre AS categoria,
              s.stock, s.stock_minimo, s.costo, s.ubicacion,
              (SELECT GROUP_CONCAT(pi.ruta ORDER BY pi.orden SEPARATOR '|')
               FROM product_images pi WHERE pi.producto_id = p.id) AS imagenes_extra
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       WHERE p.id = ? LIMIT 1`,
      [id]
    )
    return rows[0] || null
  },

  async findByBarcode(barcode) {
    const [rows] = await pool.query(
      `SELECT p.*,
              c.nombre AS categoria,
              s.stock
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       WHERE p.barcode = ? AND p.activo = 1 LIMIT 1`,
      [barcode]
    )
    return rows[0] || null
  },

  async create({ titulo, precio, descuento = 0, categoria_id, imagen = null, descripcion = null, barcode = null }, conn) {
    const db = conn || pool
    const [r] = await db.query(
      'INSERT INTO products (barcode, titulo, precio, descuento, categoria_id, imagen, descripcion) VALUES (?,?,?,?,?,?,?)',
      [barcode || null, titulo, precio, descuento, categoria_id, imagen, descripcion]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['titulo', 'precio', 'descuento', 'categoria_id', 'imagen', 'activo', 'descripcion', 'barcode']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE products SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  async addImages(producto_id, rutas, conn) {
    if (!rutas.length) return
    const db   = conn || pool
    const vals = rutas.map((ruta, i) => [producto_id, ruta, i])
    await db.query(
      'INSERT INTO product_images (producto_id, ruta, orden) VALUES ?',
      [vals]
    )
  },

  async deleteImages(producto_id, conn) {
    const db = conn || pool
    const [rows] = await db.query(
      'SELECT ruta FROM product_images WHERE producto_id = ?',
      [producto_id]
    )
    await db.query('DELETE FROM product_images WHERE producto_id = ?', [producto_id])
    return rows.map(r => r.ruta)
  },

  async delete(id) {
    const [r] = await pool.query('DELETE FROM products WHERE id = ?', [id])
    return r.affectedRows
  },

  async count({ categoria_id, activo } = {}) {
    const where  = []
    const params = []
    if (categoria_id !== undefined) { where.push('categoria_id = ?'); params.push(categoria_id) }
    if (activo       !== undefined) { where.push('activo = ?');       params.push(activo) }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM products ${clause}`, params)
    return rows[0].total
  },
}

module.exports = Product
