const PurchaseOrder = require('../models/PurchaseOrder')
const ProductStock  = require('../models/ProductStock')
const StockMovement = require('../models/StockMovement')
const { pool } = require('../config/db')

async function list(req, res, next) {
  try {
    const { estado, proveedor_id, startDate, endDate, page = 1, limit = 50 } = req.query
    const items = await PurchaseOrder.list({
      estado,
      proveedor_id: proveedor_id ? +proveedor_id : undefined,
      startDate,    endDate,
      page: +page,  limit: +limit,
    })
    res.json(items)
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await PurchaseOrder.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(item)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { proveedor_id, items } = req.body
    if (!proveedor_id || !items?.length) return res.status(400).json({ message: 'proveedor_id e items requeridos' })
    const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)
    const fecha = new Date().toISOString().split('T')[0]
    const id = await PurchaseOrder.create({ ...req.body, fecha, total })
    res.status(201).json({ id, message: 'Orden creada' })
  } catch (err) { next(err) }
}

async function updateEstado(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { estado } = req.body
    const ESTADOS = ['Pendiente', 'En tránsito', 'Recibida', 'Cancelada']
    if (!ESTADOS.includes(estado)) {
      await conn.rollback()
      return res.status(400).json({ message: 'Estado inválido' })
    }
    const id = +req.params.id
    // FOR UPDATE: serializa peticiones concurrentes (doble click en "Recibida"
    // sumaba el stock dos veces porque ambas leían el estado anterior).
    const estadoActual = await PurchaseOrder.lockEstado(id, conn)
    if (estadoActual === null) {
      await conn.rollback()
      return res.status(404).json({ message: 'Orden no encontrada' })
    }
    if (estadoActual === 'Recibida' && estado !== 'Recibida') {
      await conn.rollback()
      return res.status(409).json({ message: 'La orden ya fue recibida; su stock ya se ingresó' })
    }
    const order = await PurchaseOrder.findById(id)

    await PurchaseOrder.updateEstado(id, estado, conn)

    // Cuando se recibe la orden, incrementar stock e registrar movimiento
    if (estado === 'Recibida' && estadoActual !== 'Recibida') {
      const fecha = new Date().toISOString().split('T')[0]
      for (const item of order.items) {
        if (item.producto_id) {
          await ProductStock.adjustStock(item.producto_id, item.cantidad, conn)
          await StockMovement.create(
            {
              fecha, producto_id: item.producto_id, tipo: 'Entrada',
              cantidad: item.cantidad, motivo: `Recepción OC #${id}`, usuario_id: req.user.id,
            },
            conn   // ← misma transacción para evitar lock wait timeout
          )
        }
      }
    }

    await conn.commit()
    res.json({ message: 'Estado actualizado' })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

module.exports = { list, show, create, updateEstado }
