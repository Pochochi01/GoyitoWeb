const SalesOrder    = require('../models/SalesOrder')
const ProductStock  = require('../models/ProductStock')
const StockMovement = require('../models/StockMovement')
const { createPreference } = require('../services/paymentService')
const { pool } = require('../config/db')

// ─── Helpers ─────────────────────────────────────────────────

/** Crea la orden y ajusta stock dentro de una transacción activa. */
async function _createOrderInTransaction(conn, { fecha, canal, cliente_id, operador_id, metodo_pago, total, items, usuario_id }) {
  const orderId = await SalesOrder.create(
    { fecha, canal, cliente_id: cliente_id || null, operador_id: operador_id || null,
      estado: 'Pendiente', metodo_pago, total, items },
    conn
  )
  for (const item of items) {
    if (item.producto_id) {
      await ProductStock.adjustStock(item.producto_id, -item.cantidad, conn)
      await StockMovement.create(
        { fecha, producto_id: item.producto_id, tipo: 'Salida',
          cantidad: item.cantidad, motivo: `Venta #${orderId}`, usuario_id: usuario_id || null },
        conn
      )
    }
  }
  return orderId
}

// ─── list ─────────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const { estado, canal, cliente_id, startDate, endDate, page = 1, limit = 50 } = req.query
    const items = await SalesOrder.list({
      estado, canal,
      cliente_id: cliente_id ? +cliente_id : undefined,
      startDate,  endDate,
      page: +page, limit: +limit,
    })
    res.json(items)
  } catch (err) { next(err) }
}

// ─── show ─────────────────────────────────────────────────────
async function show(req, res, next) {
  try {
    const item = await SalesOrder.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(item)
  } catch (err) { next(err) }
}

// ─── create (Efectivo / POS) ──────────────────────────────────
async function create(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const { canal, cliente_id, metodo_pago, items } = req.body
    if (!canal || !metodo_pago || !items?.length) {
      conn.release()
      return res.status(400).json({ message: 'canal, metodo_pago e items requeridos' })
    }

    const fecha    = new Date().toISOString().split('T')[0]
    const total    = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)
    const operador = req.user?.rol === 'pos' ? req.user.id : null

    // Lookup cliente por usuario logueado
    let resolvedClienteId = cliente_id || null
    if (!resolvedClienteId && req.user?.id) {
      const [[cust]] = await conn.query('SELECT id FROM customers WHERE usuario_id = ? LIMIT 1', [req.user.id])
      if (cust) resolvedClienteId = cust.id
    }

    const orderId = await _createOrderInTransaction(conn, {
      fecha, canal, cliente_id: resolvedClienteId, operador_id: operador,
      metodo_pago, total, items, usuario_id: req.user?.id,
    })

    await conn.commit()

    // Devolver detalles completos
    const [[order]]  = await pool.query(
      `SELECT so.*, c.nombre AS cliente_nombre, c.email AS cliente_email, u.username AS operador_nombre
       FROM sales_orders so
       LEFT JOIN customers c ON c.id = so.cliente_id
       LEFT JOIN users     u ON u.id = so.operador_id
       WHERE so.id = ?`, [orderId]
    )
    const [orderItems] = await pool.query('SELECT * FROM sales_order_items WHERE orden_id = ?', [orderId])

    res.status(201).json({ id: orderId, total, fecha, canal, estado: 'Pendiente',
      metodo_pago, cliente_nombre: order?.cliente_nombre || null,
      cliente_email: order?.cliente_email || null, items: orderItems, message: 'Orden creada' })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

// ─── checkoutMP ───────────────────────────────────────────────
/**
 * POST /api/sales-orders/checkout-mp
 *
 * Crea la orden de venta (Pendiente) y la Preference de MercadoPago
 * en una sola operación atómica.
 *
 * Flujo completo:
 *  1. Validar items
 *  2. Crear sales_order (estado=Pendiente, metodo_pago=MercadoPago) dentro de TX
 *  3. Ajustar stock + registrar movimientos dentro de TX
 *  4. COMMIT de la transacción
 *  5. Crear MP Preference con external_reference=orderId
 *  6. Devolver { orderId, initPoint, sandboxInitPoint }
 *
 * El webhook de MP actualiza el estado a 'Pagada' cuando el pago se confirma.
 * Si el pago falla, la orden queda en 'Pendiente'; el admin puede cancelarla.
 */
async function checkoutMP(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const { items, canal = 'E-commerce', payer } = req.body

    if (!items?.length) {
      conn.release()
      return res.status(400).json({ message: 'items es requerido y no puede estar vacío' })
    }

    const fecha = new Date().toISOString().split('T')[0]
    const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)

    // Lookup cliente
    let cliente_id = null
    if (req.user?.id) {
      const [[cust]] = await conn.query('SELECT id FROM customers WHERE usuario_id = ? LIMIT 1', [req.user.id])
      if (cust) cliente_id = cust.id
    }

    // ── 1. Crear orden en BD ──────────────────────────────────
    const orderId = await _createOrderInTransaction(conn, {
      fecha, canal, cliente_id, operador_id: null,
      metodo_pago: 'MercadoPago', total, items, usuario_id: req.user?.id,
    })

    await conn.commit()

    // ── 2. Crear Preference en MP (fuera de la TX de BD) ──────
    const mpItems = items.map(i => ({
      id:         String(i.producto_id || i.nombre_producto),
      title:      i.nombre_producto,
      quantity:   i.cantidad,
      unit_price: parseFloat(i.precio_unit),
      currency_id:'ARS',
    }))

    const preference = await createPreference({
      items:              mpItems,
      payer,
      external_reference: String(orderId),   // ← vincula MP con nuestra orden
    })

    console.info(`[checkoutMP] Orden #${orderId} creada | MP pref: ${preference.id}`)

    res.status(201).json({
      orderId,
      total,
      id:                preference.id,
      init_point:        preference.init_point,
      sandbox_init_point:preference.sandbox_init_point,
      message:           'Preferencia MP creada',
    })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

// ─── updateEstado ─────────────────────────────────────────────
async function updateEstado(req, res, next) {
  try {
    const rows = await SalesOrder.updateEstado(+req.params.id, req.body.estado)
    if (!rows) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json({ message: 'Estado actualizado' })
  } catch (err) { next(err) }
}

// ─── summary ─────────────────────────────────────────────────
async function summary(req, res, next) {
  try {
    const { desde, hasta, startDate, endDate } = req.query
    const data = await SalesOrder.summary({ desde, hasta, startDate, endDate })
    res.json(data)
  } catch (err) { next(err) }
}

// ─── initPayment (legacy) ─────────────────────────────────────
async function initPayment(req, res, next) {
  try {
    const order = await SalesOrder.findById(+req.params.id)
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })
    const preference = await createPreference({
      items: order.items.map(i => ({
        title: i.nombre_producto, quantity: i.cantidad, unit_price: +i.precio_unit, currency_id: 'ARS',
      })),
      payer: { email: req.user?.email || 'comprador@goyito.com' },
      external_reference: String(order.id),
    })
    res.json(preference)
  } catch (err) { next(err) }
}

module.exports = { list, show, create, checkoutMP, updateEstado, summary, initPayment }
