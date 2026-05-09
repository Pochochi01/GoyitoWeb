const Category = require('../models/Category')

async function list(_req, res, next) {
  try {
    const cats = await Category.findAll()
    res.json(cats)
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body
    if (!nombre) return res.status(400).json({ message: 'nombre requerido' })
    const id = await Category.create(nombre)
    res.status(201).json({ id, nombre })
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const { nombre } = req.body
    if (!nombre) return res.status(400).json({ message: 'nombre requerido' })
    const rows = await Category.update(+req.params.id, nombre)
    if (!rows) return res.status(404).json({ message: 'Categoría no encontrada' })
    res.json({ message: 'Categoría actualizada' })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const rows = await Category.delete(+req.params.id)
    if (!rows) return res.status(404).json({ message: 'Categoría no encontrada' })
    res.json({ message: 'Categoría eliminada' })
  } catch (err) {
    next(err)
  }
}

module.exports = { list, create, update, remove }
