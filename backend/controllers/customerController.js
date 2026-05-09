const Customer   = require('../models/Customer')
const SalesOrder = require('../models/SalesOrder')
const { pool }   = require('../config/db')

// ─── Admin: list / show / create / update ────────────────────

async function list(req, res, next) {
  try {
    const { segmento, startDate, endDate, page = 1, limit = 50 } = req.query
    const items = await Customer.findAll({ segmento, startDate, endDate, page: +page, limit: +limit })
    res.json(items)
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await Customer.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json(item)
  } catch (err) { next(err) }
}

async function orders(req, res, next) {
  try {
    const items = await SalesOrder.list({ cliente_id: +req.params.id, limit: 100 })
    res.json(items)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { nombre, email } = req.body
    if (!nombre || !email) return res.status(400).json({ message: 'nombre y email requeridos' })
    const exists = await Customer.findByEmail(email)
    if (exists) return res.status(409).json({ message: 'Email ya registrado' })
    const id = await Customer.create(req.body)
    res.status(201).json({ id, message: 'Cliente creado' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const rows = await Customer.update(+req.params.id, req.body)
    if (!rows) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json({ message: 'Cliente actualizado' })
  } catch (err) { next(err) }
}

// ─── Buyer: perfil propio ─────────────────────────────────────

/**
 * GET /api/customers/me
 * Devuelve el perfil del comprador logueado (via usuario_id → customer).
 */
async function myProfile(req, res, next) {
  try {
    const [[cust]] = await pool.query(
      `SELECT c.*, u.username, u.email AS user_email
       FROM customers c
       JOIN users u ON u.id = c.usuario_id
       WHERE c.usuario_id = ? LIMIT 1`,
      [req.user.id]
    )
    if (!cust) {
      // El usuario no tiene registro de customer aún → devolver datos del user
      const [[u]] = await pool.query(
        'SELECT id, username, nombre, email, rol FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      )
      return res.json({ fromUser: true, nombre: u?.nombre, email: u?.email, telefono: null, segmento: null })
    }
    res.json(cust)
  } catch (err) { next(err) }
}

/**
 * PATCH /api/customers/me
 * Actualiza nombre, email y teléfono del perfil del comprador.
 */
async function updateMyProfile(req, res, next) {
  try {
    const { nombre, email, telefono } = req.body
    const [[cust]] = await pool.query(
      'SELECT id FROM customers WHERE usuario_id = ? LIMIT 1', [req.user.id]
    )

    if (cust) {
      await Customer.update(cust.id, { nombre, email, telefono })
    }

    // Actualizar también el nombre/email en users
    const userFields = {}
    if (nombre) userFields.nombre = nombre
    if (email)  userFields.email  = email
    if (Object.keys(userFields).length) {
      const set  = Object.keys(userFields).map(k => `${k} = ?`).join(', ')
      const vals = [...Object.values(userFields), req.user.id]
      await pool.query(`UPDATE users SET ${set} WHERE id = ?`, vals)
    }

    res.json({ message: 'Perfil actualizado' })
  } catch (err) { next(err) }
}

/**
 * GET /api/customers/me/orders
 * Lista los pedidos del comprador logueado.
 */
async function myOrders(req, res, next) {
  try {
    const [[cust]] = await pool.query(
      'SELECT id FROM customers WHERE usuario_id = ? LIMIT 1', [req.user.id]
    )
    if (!cust) return res.json([])

    const items = await SalesOrder.list({ cliente_id: cust.id, limit: 100 })

    // Para cada orden, verificar si ya tiene reseña
    const orderIds = items.map(o => o.id)
    let reviewedIds = new Set()
    if (orderIds.length) {
      const [reviews] = await pool.query(
        `SELECT orden_id FROM reviews WHERE usuario_id = ? AND orden_id IN (${orderIds.map(() => '?').join(',')})`,
        [req.user.id, ...orderIds]
      )
      reviewedIds = new Set(reviews.map(r => r.orden_id))
    }

    // Inyectar items de la orden y flag de reseña
    const enriched = await Promise.all(items.map(async o => {
      const [orderItems] = await pool.query(
        'SELECT soi.*, p.titulo, p.imagen FROM sales_order_items soi LEFT JOIN products p ON p.id = soi.producto_id WHERE soi.orden_id = ?',
        [o.id]
      )
      return { ...o, items: orderItems, ya_reseñado: reviewedIds.has(o.id) }
    }))

    res.json(enriched)
  } catch (err) { next(err) }
}

module.exports = { list, show, orders, create, update, myProfile, updateMyProfile, myOrders }
