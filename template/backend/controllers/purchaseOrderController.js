const PurchaseOrderRepository = require('../repositories/PurchaseOrderRepository')
const ProductStockRepository  = require('../repositories/ProductStockRepository')
const StockMovementRepository = require('../repositories/StockMovementRepository')
const { withTransaction }     = require('../config/db')

async function list(req, res, next) {
  try {
    const { estado, proveedor_id, startDate, endDate, page = 1, limit = 50 } = req.query
    res.json(await PurchaseOrderRepository.list({
      estado,
      proveedor_id: proveedor_id ? +proveedor_id : undefined,
      startDate, endDate,
      page: +page, limit: +limit,
    }))
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await PurchaseOrderRepository.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(item)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { proveedor_id, items } = req.body
    if (!proveedor_id || !items?.length) {
      return res.status(400).json({ message: 'proveedor_id e items requeridos' })
    }
    const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)
    const fecha = new Date().toISOString().split('T')[0]
    const id    = await PurchaseOrderRepository.create({ ...req.body, fecha, total })
    res.status(201).json({ id, message: 'Orden creada' })
  } catch (err) { next(err) }
}

async function updateEstado(req, res, next) {
  try {
    const id = +req.params.id
    const { estado } = req.body

    const order = await PurchaseOrderRepository.findById(id)
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })

    await withTransaction(async (conn) => {
      await PurchaseOrderRepository.updateEstado(id, estado, conn)

      // Al recibir la orden: incrementar stock + registrar movimientos
      if (estado === 'Recibida' && order.estado !== 'Recibida') {
        const fecha = new Date().toISOString().split('T')[0]
        for (const item of order.items) {
          if (item.producto_id) {
            await ProductStockRepository.adjustStock(item.producto_id, item.cantidad, conn)
            await StockMovementRepository.create({
              fecha, producto_id: item.producto_id, tipo: 'Entrada',
              cantidad: item.cantidad, motivo: `Recepción OC #${id}`,
              usuario_id: req.user.id,
            }, conn)
          }
        }
      }
    })

    res.json({ message: 'Estado actualizado' })
  } catch (err) { next(err) }
}

module.exports = { list, show, create, updateEstado }
