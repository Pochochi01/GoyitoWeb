const { pool }   = require('../config/db')
const ProductStock = require('../models/ProductStock')

// ─── GET /api/pos/products?q=&limit=&barcode= ────────────────
// Devuelve productos activos (activo=1 = tienen stock).
// Si se pasa ?barcode=xxx busca por código de barras exacto.
async function searchProducts(req, res, next) {
  try {
    const { q = '', limit = 48, barcode } = req.query

    if (barcode) {
      // Búsqueda exacta por código de barras (para lectores)
      const Product = require('../models/Product')
      const product = await Product.findByBarcode(barcode)
      return res.json(product ? [product] : [])
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.titulo AS title, p.precio AS price, p.descuento AS discount,
              p.imagen AS image, p.barcode, c.nombre AS category,
              COALESCE(ps.stock, 0) AS stock, ps.costo
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock ps ON ps.producto_id = p.id
       WHERE p.activo = 1
         AND p.titulo LIKE ?
       ORDER BY p.titulo
       LIMIT ?`,
      [`%${q}%`, +limit]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

// ─── GET /api/pos/customers?q= ───────────────────────────────
async function searchCustomers(req, res, next) {
  try {
    const { q = '' } = req.query
    const like = `%${q}%`
    const [rows] = await pool.query(
      `SELECT id, nombre, email, telefono, segmento
       FROM customers
       WHERE nombre LIKE ? OR email LIKE ? OR telefono LIKE ?
       ORDER BY nombre LIMIT 10`,
      [like, like, like]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

// ─── GET /api/pos/branches ────────────────────────────────────
async function getBranches(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM pos_branches WHERE activa = 1 ORDER BY nombre`
    )
    res.json(rows)
  } catch (err) { next(err) }
}

// ─── POST /api/pos/sales ─────────────────────────────────────
async function createSale(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const { items, metodo_pago, cliente_id, descuento = 0, sucursal_id } = req.body
    if (!items?.length || !metodo_pago) {
      return res.status(400).json({ message: 'items y metodo_pago requeridos' })
    }

    const fecha    = new Date().toISOString().split('T')[0]
    const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)
    const total    = +(subtotal * (1 - descuento / 100)).toFixed(2)

    // Insertar en la tabla unificada sales_orders
    const [result] = await conn.query(
      `INSERT INTO sales_orders
         (fecha, canal, cliente_id, operador_id, estado, metodo_pago, total, sucursal_id)
       VALUES (?, 'POS', ?, ?, 'Pagada', ?, ?, ?)`,
      [fecha, cliente_id || null, req.user.id, metodo_pago, total,
       sucursal_id || req.user.sucursal_id || null]
    )
    const orderId = result.insertId

    for (const item of items) {
      await conn.query(
        `INSERT INTO sales_order_items
           (orden_id, producto_id, nombre_producto, cantidad, precio_unit)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.producto_id, item.nombre_producto, item.cantidad, item.precio_unit]
      )
      // Descontar stock (GREATEST 0, auto-inhabilita si llega a 0)
      await ProductStock.adjustStock(item.producto_id, -item.cantidad, conn)
      // Movimiento de stock — usar conn para evitar lock wait timeout por FK
      await StockMovement.create(
        {
          fecha,
          producto_id: item.producto_id,
          tipo:        'Salida',
          cantidad:    item.cantidad,
          motivo:      `Venta POS #${orderId}`,
          usuario_id:  req.user.id,
        },
        conn
      )
    }

    await conn.commit()

    // Devolver venta completa para el comprobante
    const [[sale]] = await pool.query(
      `SELECT so.*,
              u.nombre  AS operador_nombre,
              c.nombre  AS cliente_nombre,
              c.email   AS cliente_email,
              pb.nombre AS sucursal_nombre,
              pb.direccion AS sucursal_direccion,
              pb.telefono  AS sucursal_telefono
       FROM sales_orders so
       LEFT JOIN users        u  ON u.id  = so.operador_id
       LEFT JOIN customers    c  ON c.id  = so.cliente_id
       LEFT JOIN pos_branches pb ON pb.id = so.sucursal_id
       WHERE so.id = ?`,
      [orderId]
    )
    const [saleItems] = await pool.query(
      `SELECT soi.*, p.titulo
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       WHERE soi.orden_id = ?`,
      [orderId]
    )

    res.status(201).json({ ...sale, items: saleItems, descuento })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

// ─── GET /api/pos/sales?fecha=&sucursal_id= ──────────────────
async function listSales(req, res, next) {
  try {
    const today  = req.query.fecha || new Date().toISOString().split('T')[0]
    const params = [today]
    let extra    = ''

    if (req.query.sucursal_id) {
      extra = 'AND so.sucursal_id = ?'
      params.push(+req.query.sucursal_id)
    } else if (req.user.rol === 'pos' && req.user.sucursal_id) {
      extra = 'AND so.sucursal_id = ?'
      params.push(req.user.sucursal_id)
    }

    const [rows] = await pool.query(
      `SELECT so.id, so.fecha, so.total, so.metodo_pago, so.estado,
              u.nombre  AS operador_nombre,
              c.nombre  AS cliente_nombre,
              pb.nombre AS sucursal_nombre,
              (SELECT COUNT(*) FROM sales_order_items WHERE orden_id = so.id) AS items_count
       FROM sales_orders so
       LEFT JOIN users        u  ON u.id  = so.operador_id
       LEFT JOIN customers    c  ON c.id  = so.cliente_id
       LEFT JOIN pos_branches pb ON pb.id = so.sucursal_id
       WHERE so.canal = 'POS' AND so.fecha = ? ${extra}
       ORDER BY so.id DESC`,
      params
    )
    res.json(rows)
  } catch (err) { next(err) }
}

// ─── GET /api/pos/sales/:id ───────────────────────────────────
async function getSaleById(req, res, next) {
  try {
    const [[sale]] = await pool.query(
      `SELECT so.*,
              u.nombre     AS operador_nombre,
              c.nombre     AS cliente_nombre,
              c.email      AS cliente_email,
              pb.nombre    AS sucursal_nombre,
              pb.direccion AS sucursal_direccion,
              pb.telefono  AS sucursal_telefono
       FROM sales_orders so
       LEFT JOIN users        u  ON u.id  = so.operador_id
       LEFT JOIN customers    c  ON c.id  = so.cliente_id
       LEFT JOIN pos_branches pb ON pb.id = so.sucursal_id
       WHERE so.id = ?`,
      [+req.params.id]
    )
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' })

    const [items] = await pool.query(
      `SELECT soi.*, p.titulo FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       WHERE soi.orden_id = ?`,
      [sale.id]
    )
    res.json({ ...sale, items })
  } catch (err) { next(err) }
}

// ─── GET /api/pos/reports?fecha=&sucursal_id= ────────────────
async function getReports(req, res, next) {
  try {
    const today  = req.query.fecha || new Date().toISOString().split('T')[0]
    const params = [today]
    let extra    = ''

    const sid = req.query.sucursal_id ||
      (req.user.rol === 'pos' ? req.user.sucursal_id : null)
    if (sid) { extra = 'AND so.sucursal_id = ?'; params.push(+sid) }

    const [[kpis]] = await pool.query(
      `SELECT COUNT(*)        AS total_ventas,
              SUM(total)      AS ingresos,
              ROUND(AVG(total),2) AS ticket_promedio,
              SUM(CASE WHEN estado='Cancelada' THEN 1 ELSE 0 END) AS canceladas
       FROM sales_orders so
       WHERE canal = 'POS' AND fecha = ? ${extra}`,
      params
    )
    const [byPayment] = await pool.query(
      `SELECT metodo_pago, COUNT(*) AS cantidad, SUM(total) AS total
       FROM sales_orders so
       WHERE canal='POS' AND fecha=? AND estado!='Cancelada' ${extra}
       GROUP BY metodo_pago ORDER BY total DESC`,
      params
    )
    const [topProducts] = await pool.query(
      `SELECT p.titulo, SUM(soi.cantidad) AS unidades, SUM(soi.subtotal) AS ingresos
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       JOIN sales_orders so ON so.id = soi.orden_id
       WHERE so.canal='POS' AND so.fecha=? AND so.estado!='Cancelada' ${extra}
       GROUP BY soi.producto_id, p.titulo
       ORDER BY unidades DESC LIMIT 8`,
      params
    )
    const [hourly] = await pool.query(
      `SELECT HOUR(created_at) AS hora, COUNT(*) AS ventas, SUM(total) AS total
       FROM sales_orders so
       WHERE canal='POS' AND fecha=? AND estado!='Cancelada' ${extra}
       GROUP BY HOUR(created_at) ORDER BY hora`,
      params
    )

    res.json({ fecha: today, kpis, byPayment, topProducts, hourly })
  } catch (err) { next(err) }
}

module.exports = {
  searchProducts, searchCustomers, getBranches,
  createSale, listSales, getSaleById, getReports,
}
