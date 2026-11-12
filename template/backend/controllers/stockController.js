const ProductStockRepository  = require('../repositories/ProductStockRepository')
const StockMovementRepository = require('../repositories/StockMovementRepository')

async function movements(req, res, next) {
  try {
    const { producto_id, tipo, page = 1, limit = 50 } = req.query
    res.json(await StockMovementRepository.list({
      producto_id: producto_id ? +producto_id : undefined,
      tipo, page: +page, limit: +limit,
    }))
  } catch (err) { next(err) }
}

async function addMovement(req, res, next) {
  try {
    const { fecha, producto_id, tipo, cantidad, motivo } = req.body
    if (!fecha || !producto_id || !tipo || cantidad === undefined) {
      return res.status(400).json({ message: 'fecha, producto_id, tipo y cantidad son requeridos' })
    }

    const id = await StockMovementRepository.create({
      fecha, producto_id, tipo, cantidad, motivo, usuario_id: req.user.id,
    })

    // Ajustar el stock según el tipo
    const delta = tipo === 'Entrada'
      ? +cantidad
      : tipo === 'Salida'
        ? -Math.abs(+cantidad)
        : +cantidad
    await ProductStockRepository.adjustStock(producto_id, delta)

    res.status(201).json({ id, message: 'Movimiento registrado' })
  } catch (err) { next(err) }
}

async function lowStock(_req, res, next) {
  try { res.json(await ProductStockRepository.lowStock()) }
  catch (err) { next(err) }
}

module.exports = { movements, addMovement, lowStock }
