const { pool } = require('../config/db')

// ─── POST /api/reviews ─── (comprador) ───────────────────────
async function create(req, res, next) {
  try {
    const { orden_id, rating, reseña } = req.body
    if (!orden_id || !rating) return res.status(400).json({ message: 'orden_id y rating son requeridos' })
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating debe ser entre 1 y 5' })

    const [[order]] = await pool.query(
      `SELECT so.id, so.estado, c.usuario_id
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       WHERE so.id = ?`,
      [orden_id]
    )
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })
    if (order.estado !== 'Entregada') {
      return res.status(400).json({ message: 'Solo se pueden reseñar órdenes con estado Entregada' })
    }
    if (order.usuario_id !== req.user.id) {
      return res.status(403).json({ message: 'No podés reseñar esta orden' })
    }

    const [[existing]] = await pool.query(
      'SELECT id FROM reviews WHERE orden_id = ? AND usuario_id = ?',
      [orden_id, req.user.id]
    )
    if (existing) return res.status(409).json({ message: 'Ya calificaste esta orden' })

    const [r] = await pool.query(
      'INSERT INTO reviews (orden_id, usuario_id, rating, reseña) VALUES (?,?,?,?)',
      [orden_id, req.user.id, rating, reseña || null]
    )
    res.status(201).json({ id: r.insertId, message: 'Reseña publicada. ¡Gracias!' })
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/order/:ordenId ─── (comprador) ─────────
async function getByOrder(req, res, next) {
  try {
    const [[review]] = await pool.query(
      'SELECT * FROM reviews WHERE orden_id = ? AND usuario_id = ? LIMIT 1',
      [+req.params.ordenId, req.user.id]
    )
    res.json(review || null)
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/summary ─── (admin) ────────────────────
/**
 * Resumen estadístico de todas las calificaciones.
 * Retorna totales por grupo (<3, =3, >3) y distribución por estrella.
 */
async function getSummary(req, res, next) {
  try {
    const [[summary]] = await pool.query(`
      SELECT
        COUNT(*)                                                    AS total,
        ROUND(AVG(rating), 2)                                      AS promedio,
        SUM(CASE WHEN rating < 3 THEN 1 ELSE 0 END)               AS negativas,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)               AS neutrales,
        SUM(CASE WHEN rating > 3 THEN 1 ELSE 0 END)               AS positivas,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)               AS r1,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)               AS r2,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)               AS r3,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)               AS r4,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)               AS r5
      FROM reviews
    `)
    res.json(summary)
  } catch (err) { next(err) }
}

// ─── GET /api/reviews ─── (admin) ────────────────────────────
/**
 * Lista todas las reseñas con detalle completo.
 * Filtros: grupo (negativas | neutrales | positivas), search, page, limit.
 */
async function listAll(req, res, next) {
  try {
    const { grupo, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const where  = []
    const params = []

    if (grupo === 'negativas') { where.push('r.rating < 3') }
    if (grupo === 'neutrales') { where.push('r.rating = 3') }
    if (grupo === 'positivas') { where.push('r.rating > 3') }
    if (search?.trim()) {
      where.push('(u.nombre LIKE ? OR r.reseña LIKE ?)')
      const like = `%${search.trim()}%`
      params.push(like, like)
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(+limit, +offset)

    const [rows] = await pool.query(
      `SELECT
         r.id, r.rating, r.reseña, r.created_at,
         u.nombre   AS usuario_nombre,
         u.email    AS usuario_email,
         so.id      AS orden_id,
         so.fecha   AS orden_fecha,
         so.canal,
         so.total   AS orden_total,
         (SELECT GROUP_CONCAT(soi.nombre_producto ORDER BY soi.id SEPARATOR ' · ')
          FROM sales_order_items soi
          WHERE soi.orden_id = so.id)           AS productos
       FROM reviews r
       JOIN users        u  ON u.id  = r.usuario_id
       JOIN sales_orders so ON so.id = r.orden_id
       ${clause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    )

    // Total para paginación
    const countParams = params.slice(0, -2)
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM reviews r
       JOIN users        u  ON u.id  = r.usuario_id
       JOIN sales_orders so ON so.id = r.orden_id
       ${clause}`,
      countParams
    )

    res.json({ data: rows, total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/pending ─── (admin) ────────────────────
/**
 * Órdenes con estado 'Entregada' que aún no tienen reseña.
 */
async function listPending(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const where  = ["so.estado = 'Entregada'", 'r.id IS NULL']
    const params = []

    if (search?.trim()) {
      where.push('(u.nombre LIKE ? OR u.email LIKE ?)')
      const like = `%${search.trim()}%`
      params.push(like, like)
    }

    const clause = `WHERE ${where.join(' AND ')}`
    params.push(+limit, +offset)

    const [rows] = await pool.query(
      `SELECT
         so.id, so.fecha, so.total, so.canal, so.estado,
         u.nombre  AS usuario_nombre,
         u.email   AS usuario_email,
         (SELECT GROUP_CONCAT(soi.nombre_producto ORDER BY soi.id SEPARATOR ' · ')
          FROM sales_order_items soi
          WHERE soi.orden_id = so.id)  AS productos
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       LEFT JOIN users     u ON u.id = c.usuario_id
       LEFT JOIN reviews   r ON r.orden_id = so.id
       ${clause}
       ORDER BY so.fecha DESC
       LIMIT ? OFFSET ?`,
      params
    )

    const countParams = params.slice(0, -2)
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       LEFT JOIN users     u ON u.id = c.usuario_id
       LEFT JOIN reviews   r ON r.orden_id = so.id
       ${clause}`,
      countParams
    )

    res.json({ data: rows, total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

module.exports = { create, getByOrder, getSummary, listAll, listPending }
