const Supplier = require('../models/Supplier')

async function list(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query
    const items = await Supplier.findAll({ page: +page, limit: +limit })
    res.json(items)
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await Supplier.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json(item)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { nombre, cuit } = req.body
    if (!nombre || !cuit) return res.status(400).json({ message: 'nombre y cuit requeridos' })
    const id = await Supplier.create(req.body)
    res.status(201).json({ id, message: 'Proveedor creado' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const rows = await Supplier.update(+req.params.id, req.body)
    if (!rows) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor actualizado' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const rows = await Supplier.delete(+req.params.id)
    if (!rows) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor eliminado' })
  } catch (err) { next(err) }
}

module.exports = { list, show, create, update, remove }
