const CartRepository = require('../repositories/CartRepository')

async function get(req, res, next) {
  try { res.json(await CartRepository.findByUser(req.user.id)) }
  catch (err) { next(err) }
}

async function add(req, res, next) {
  try {
    const { producto_id, cantidad = 1 } = req.body
    if (!producto_id) return res.status(400).json({ message: 'producto_id requerido' })
    await CartRepository.upsert(req.user.id, +producto_id, +cantidad)
    res.json({ message: 'Agregado al carrito' })
  } catch (err) { next(err) }
}

async function updateItem(req, res, next) {
  try {
    const { cantidad } = req.body
    if (cantidad === undefined) return res.status(400).json({ message: 'cantidad requerida' })
    await CartRepository.updateQuantity(req.user.id, +req.params.productoId, +cantidad)
    res.json({ message: 'Carrito actualizado' })
  } catch (err) { next(err) }
}

async function removeItem(req, res, next) {
  try {
    await CartRepository.remove(req.user.id, +req.params.productoId)
    res.json({ message: 'Item eliminado' })
  } catch (err) { next(err) }
}

async function clear(req, res, next) {
  try {
    await CartRepository.clear(req.user.id)
    res.json({ message: 'Carrito vaciado' })
  } catch (err) { next(err) }
}

module.exports = { get, add, updateItem, removeItem, clear }
