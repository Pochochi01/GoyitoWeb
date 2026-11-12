const SalesOrderRepository   = require('../repositories/SalesOrderRepository')
const ProductRepository      = require('../repositories/ProductRepository')
const ProductStockRepository = require('../repositories/ProductStockRepository')
const StockMovementRepository= require('../repositories/StockMovementRepository')
const CustomerRepository     = require('../repositories/CustomerRepository')
const { createPreference }   = require('../services/paymentService')
const { withTransaction }    = require('../config/db')

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Reemplaza producto_id inexistentes por null (permite crear la orden
 * con nombre_producto histórico si el producto fue eliminado del catálogo).
 */
async function _sanitizeItems(items, conn) {
  const ids       = items.map(i => i.producto_id).filter(Boolean)
  const validIds  = await ProductRepository.existingIds(ids, conn)
  return items.map(i => ({
    ...i,
    producto_id: i.producto_id && validIds.has(Number(i.producto_id)) ? Number(i.producto_id) : null,
  }))
}

async function _createOrderInTransaction(conn, {
  fecha, canal, cliente_id, operador_id, metodo_pago, total, items, usuario_id,
}) {
  const cleanItems = await _sanitizeItems(items, conn)

  const orderId = await SalesOrderRepository.create({
    fecha, canal,
    cliente_id:  cliente_id || null,
    operador_id: operador_id || null,
    estado:      'Pendiente',
    metodo_pago, total, items: cleanItems,
  }, conn)

  for (const item of cleanItems) {
    if (item.producto_id) {
      await ProductStockRepository.adjustStock(item.producto_id, -item.cantidad, conn)
      await StockMovementRepository.create({
        fecha, producto_id: item.producto_id, tipo: 'Salida',
        cantidad: item.cantidad, motivo: `Venta #${orderId}`,
        usuario_id: usuario_id || null,
      }, conn)
    }
  }
  return orderId
}

// ─── Handlers ────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { estado, canal, cliente_id, startDate, endDate, page = 1, limit = 50 } = req.query
    res.json(await SalesOrderRepository.list({
      estado, canal,
      cliente_id: cliente_id ? +cliente_id : undefined,
      startDate, endDate,
      page: +page, limit: +limit,
    }))
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await SalesOrderRepository.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(item)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { canal, cliente_id, metodo_pago, items } = req.body
    if (!canal || !metodo_pago || !items?.length) {
      return res.status(400).json({ message: 'canal, metodo_pago e items requeridos' })
    }

    const fecha    = new Date().toISOString().split('T')[0]
    const total    = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)
    const operador = req.user?.rol === 'pos' ? req.user.id : null

    const orderId = await withTransaction(async (conn) => {
      // Resolver cliente por usuario logueado
      let resolvedClienteId = cliente_id || null
      if (!resolvedClienteId && req.user?.id) {
        const cust = await CustomerRepository.findByUserId(req.user.id)
        if (cust) resolvedClienteId = cust.id
      }

      return await _createOrderInTransaction(conn, {
        fecha, canal, cliente_id: resolvedClienteId, operador_id: operador,
        metodo_pago, total, items, usuario_id: req.user?.id,
      })
    })

    const order = await SalesOrderRepository.findById(orderId)
    res.status(201).json({ ...order, message: 'Orden creada' })
  } catch (err) { next(err) }
}

/**
 * LEGACY: checkout MP que crea orden ANTES de MP. Se mantiene por compatibilidad.
 * El flujo NUEVO (recomendado) usa POST /api/payments/init-mp que difiere la
 * creación de la orden hasta que MP aprueba (payment.controller.initMP).
 */
async function checkoutMP(req, res, next) {
  try {
    const { items, canal = 'E-commerce', payer } = req.body
    if (!items?.length) return res.status(400).json({ message: 'items requeridos' })

    const fecha = new Date().toISOString().split('T')[0]
    const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)

    const orderId = await withTransaction(async (conn) => {
      let cliente_id = null
      if (req.user?.id) {
        const cust = await CustomerRepository.findByUserId(req.user.id)
        if (cust) cliente_id = cust.id
      }
      return await _createOrderInTransaction(conn, {
        fecha, canal, cliente_id, operador_id: null,
        metodo_pago: 'MercadoPago', total, items, usuario_id: req.user?.id,
      })
    })

    const preference = await createPreference({
      items: items.map(i => ({
        id:         String(i.producto_id || i.nombre_producto),
        title:      i.nombre_producto,
        quantity:   i.cantidad,
        unit_price: parseFloat(i.precio_unit),
        currency_id:'ARS',
      })),
      payer,
      external_reference: String(orderId),
    })

    res.status(201).json({
      orderId, total,
      id:                 preference.id,
      init_point:         preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    })
  } catch (err) { next(err) }
}

async function updateEstado(req, res, next) {
  try {
    const rows = await SalesOrderRepository.updateEstado(+req.params.id, req.body.estado)
    if (!rows) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json({ message: 'Estado actualizado' })
  } catch (err) { next(err) }
}

async function summary(req, res, next) {
  try {
    const { desde, hasta, startDate, endDate } = req.query
    res.json(await SalesOrderRepository.summary({ desde, hasta, startDate, endDate }))
  } catch (err) { next(err) }
}

module.exports = { list, show, create, checkoutMP, updateEstado, summary }
