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

  /**
   * Elimina un producto y TODOS sus registros dependientes de forma definitiva.
   *
   * Orden de eliminación (cascada manejada desde el backend):
   *   1. stock_movements  — FK fk_mov_prod no tiene ON DELETE en versiones antiguas de la BD
   *   2. product_images   — se eliminan en el controlador (archivos físicos) + aquí en BD
   *   3. products         — la BD hace CASCADE en: product_stock, price_history, cart_items
   *
   * Nota: purchase_order_items y sales_order_items usan SET NULL en producto_id,
   *       por lo que conservan el historial con producto_id = NULL.
   */
  async delete(id, conn) {
    const db = conn || pool
    // Paso 1 — eliminar movimientos de stock (FK sin CASCADE en la BD original)
    await db.query('DELETE FROM stock_movements WHERE producto_id = ?', [id])
    // Paso 2 — eliminar el producto (el resto cae por ON DELETE CASCADE en la BD)
    const [r] = await db.query('DELETE FROM products WHERE id = ?', [id])
    return r.affectedRows
  },

  /**
   * Dado un array de IDs, devuelve un Set con los que existen en la tabla products.
   * Útil para sanitizar `producto_id` antes de insertar en tablas que tienen FK
   * (sales_order_items, stock_movements). Items con producto_id inexistente se
   * pueden insertar con NULL gracias a ON DELETE SET NULL.
   */
  async existingIds(ids, conn) {
    const valid = (Array.isArray(ids) ? ids : [])
      .filter(id => id !== null && id !== undefined)
      .map(Number)
      .filter(n => Number.isInteger(n) && n > 0)
    if (!valid.length) return new Set()
    const db = conn || pool
    const [rows] = await db.query('SELECT id FROM products WHERE id IN (?)', [valid])
    return new Set(rows.map(r => r.id))
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
