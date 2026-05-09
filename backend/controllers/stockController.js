const ProductStock  = require('../models/ProductStock')
const StockMovement = require('../models/StockMovement')

async function movements(req, res, next) {
  try {
    const { producto_id, tipo, page = 1, limit = 50 } = req.query
    const items = await StockMovement.list({
      producto_id: producto_id ? +producto_id : undefined,
      tipo,
      page: +page,
      limit: +limit,
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
}

async function addMovement(req, res, next) {
  try {
    const { fecha, producto_id, tipo, cantidad, motivo } = req.body
    if (!fecha || !producto_id || !tipo || cantidad === undefined) {
      return res.status(400).json({ message: 'fecha, producto_id, tipo y cantidad son requeridos' })
    }

    const id = await StockMovement.create({ fecha, producto_id, tipo, cantidad, motivo, usuario_id: req.user.id })

    // Ajustar el stock según el tipo
    const delta = ['Entrada'].includes(tipo) ? +cantidad : ['Salida'].includes(tipo) ? -Math.abs(+cantidad) : +cantidad
    await ProductStock.adjustStock(producto_id, delta)

    res.status(201).json({ id, message: 'Movimiento registrado' })
  } catch (err) {
    next(err)
  }
}

async function lowStock(req, res, next) {
  try {
    const items = await ProductStock.lowStock()
    res.json(items)
  } catch (err) {
    next(err)
  }
}

module.exports = { movements, addMovement, lowStock }
