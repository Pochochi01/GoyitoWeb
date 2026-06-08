const Category = require('../models/Category')
const { saveWebP, deleteImage } = require('../services/imageService')

async function list(_req, res, next) {
  try {
    const cats = await Category.findAll()
    res.json(cats)
  } catch (err) {
    next(err)
  }
}

async function show(req, res, next) {
  try {
    const cat = await Category.findById(+req.params.id)
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' })
    res.json(cat)
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { nombre, descripcion = null, orden = 0, activo = 1 } = req.body
    if (!nombre) return res.status(400).json({ message: 'nombre requerido' })

    let imagen = null
    if (req.file) {
      imagen = await saveWebP(req.file.buffer, req.file.originalname)
    }

    const id = await Category.create({
      nombre, descripcion, imagen,
      orden:  +orden,
      activo: activo === '0' || activo === 0 || activo === false ? 0 : 1,
    })
    const created = await Category.findById(id)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const id = +req.params.id
    const cat = await Category.findById(id)
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' })

    const fields = { ...req.body }
    if (fields.orden !== undefined)  fields.orden  = +fields.orden
    if (fields.activo !== undefined) fields.activo = fields.activo === '0' || fields.activo === 0 || fields.activo === false ? 0 : 1

    if (req.file) {
      deleteImage(cat.imagen)
      fields.imagen = await saveWebP(req.file.buffer, req.file.originalname)
    }

    await Category.update(id, fields)
    const updated = await Category.findById(id)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = +req.params.id
    const cat = await Category.findById(id)
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' })

    const productCount = await Category.productCount(id)
    if (productCount > 0) {
      return res.status(409).json({
        message: `No se puede eliminar: la categoría tiene ${productCount} producto(s) asociado(s)`,
      })
    }

    deleteImage(cat.imagen)
    await Category.delete(id)
    res.json({ message: 'Categoría eliminada' })
  } catch (err) {
    next(err)
  }
}

module.exports = { list, show, create, update, remove }
