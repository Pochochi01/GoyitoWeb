const { pool } = require('../config/db')

/**
 * Castea a Number de forma robusta. Cubre los 3 casos "vacíos" que llegan
 * desde el frontend y romperían una columna DECIMAL/INT en MySQL:
 *   · null / undefined            → fallback
 *   · "" (string vacío)           → fallback
 *   · "abc" u otro no-numérico    → fallback
 * También corta valores negativos.
 */
function toNonNegativeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback
  const n = Number(val)
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

const ProductStock = {
  async findByProductId(producto_id) {
    const [rows] = await pool.query(
      'SELECT * FROM product_stock WHERE producto_id = ? LIMIT 1',
      [producto_id]
    )
    return rows[0] || null
  },

  async upsert({ producto_id, stock, stock_minimo, ubicacion, costo }, conn) {
    const db  = conn || pool

    // Saneamiento defensivo — el frontend puede mandar "" en cualquiera.
    // Los DECIMAL/INT de MySQL no aceptan string vacío ni "abc".
    const qty         = Math.floor(toNonNegativeNumber(stock,        0))
    const minStock    = Math.floor(toNonNegativeNumber(stock_minimo, 5))
    const cost        = toNonNegativeNumber(costo, 0)
    const location    = (ubicacion === '' || ubicacion === undefined) ? null : ubicacion

    await db.query(
      `INSERT INTO product_stock (producto_id, stock, stock_minimo, ubicacion, costo)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         stock        = VALUES(stock),
         stock_minimo = VALUES(stock_minimo),
         ubicacion    = VALUES(ubicacion),
         costo        = VALUES(costo)`,
      [producto_id, qty, minStock, location, cost]
    )

    // Auto-habilitar / inhabilitar según stock
    await db.query(
      'UPDATE products SET activo = ? WHERE id = ?',
      [qty > 0 ? 1 : 0, producto_id]
    )
  },

  async adjustStock(producto_id, delta, conn) {
    const db = conn || pool

    // GREATEST(0, stock + delta) previene valores negativos
    await db.query(
      `UPDATE product_stock
       SET stock = GREATEST(0, stock + ?)
       WHERE producto_id = ?`,
      [delta, producto_id]
    )

    // Leer stock resultante y sincronizar activo en products
    const [[row]] = await db.query(
      'SELECT stock FROM product_stock WHERE producto_id = ?',
      [producto_id]
    )
    if (row !== undefined) {
      await db.query(
        'UPDATE products SET activo = ? WHERE id = ?',
        [row.stock > 0 ? 1 : 0, producto_id]
      )
    }

    return row?.stock ?? 0
  },

  async lowStock() {
    const [rows] = await pool.query(
      `SELECT p.id, p.titulo, p.activo, s.stock, s.stock_minimo, s.ubicacion
       FROM product_stock s
       JOIN products p ON p.id = s.producto_id
       WHERE s.stock <= s.stock_minimo
       ORDER BY s.stock ASC`
    )
    return rows
  },
}

module.exports = ProductStock
