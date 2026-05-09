const CartItem = require('../models/CartItem')

async function get(req, res, next) {
  try {
    const items = await CartItem.findByUser(req.user.id)
    res.json(items)
  } catch (err) { next(err) }
}

async function add(req, res, next) {
  try {
    const { producto_id, cantidad = 1 } = req.body
    if (!producto_id) return res.status(400).json({ message: 'producto_id requerido' })
    await CartItem.upsert(req.user.id, +producto_id, +cantidad)
    res.json({ message: 'Agregado al carrito' })
  } catch (err) { next(err) }
}

async function updateItem(req, res, next) {
  try {
    const { cantidad } = req.body
    if (cantidad === undefined) return res.status(400).json({ message: 'cantidad requerida' })
    await CartItem.updateQuantity(req.user.id, +req.params.productoId, +cantidad)
    res.json({ message: 'Carrito actualizado' })
  } catch (err) { next(err) }
}

async function removeItem(req, res, next) {
  try {
    await CartItem.remove(req.user.id, +req.params.productoId)
    res.json({ message: 'Item eliminado' })
  } catch (err) { next(err) }
}

async function clear(req, res, next) {
  try {
    await CartItem.clear(req.user.id)
    res.json({ message: 'Carrito vaciado' })
  } catch (err) { next(err) }
}

module.exports = { get, add, updateItem, removeItem, clear }
