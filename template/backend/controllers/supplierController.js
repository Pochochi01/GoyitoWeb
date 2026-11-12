const SupplierRepository = require('../repositories/SupplierRepository')

async function list(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query
    res.json(await SupplierRepository.findAll({ page: +page, limit: +limit }))
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await SupplierRepository.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json(item)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { nombre, cuit } = req.body
    if (!nombre || !cuit) return res.status(400).json({ message: 'nombre y cuit requeridos' })
    const id = await SupplierRepository.create(req.body)
    res.status(201).json({ id, message: 'Proveedor creado' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const rows = await SupplierRepository.update(+req.params.id, req.body)
    if (!rows) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor actualizado' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const rows = await SupplierRepository.delete(+req.params.id)
    if (!rows) return res.status(404).json({ message: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor eliminado' })
  } catch (err) { next(err) }
}

module.exports = { list, show, create, update, remove }
