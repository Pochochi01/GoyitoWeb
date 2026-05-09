const { pool } = require('../config/db')

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
    const qty = Math.max(0, parseInt(stock ?? 0, 10))   // nunca negativo

    await db.query(
      `INSERT INTO product_stock (producto_id, stock, stock_minimo, ubicacion, costo)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         stock        = VALUES(stock),
         stock_minimo = VALUES(stock_minimo),
         ubicacion    = VALUES(ubicacion),
         costo        = VALUES(costo)`,
      [producto_id, qty, Math.max(0, parseInt(stock_minimo ?? 5, 10)), ubicacion ?? null, costo ?? 0]
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
