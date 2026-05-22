const Product      = require('../models/Product')
const ProductStock = require('../models/ProductStock')
const PriceHistory = require('../models/PriceHistory')
const { saveWebP, deleteImage } = require('../services/imageService')
const { pool } = require('../config/db')

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, categoria_id, activo, oferta } = req.query
    const products = await Product.list({
      page: +page, limit: +limit,
      categoria_id: categoria_id ? +categoria_id : undefined,
      activo:       activo       !== undefined ? +activo : undefined,
      oferta:       oferta === 'true',
    })
    const total = await Product.count({
      categoria_id: categoria_id ? +categoria_id : undefined,
      activo:       activo !== undefined ? +activo : undefined,
    })
    res.json({ data: products, total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const product = await Product.findById(+req.params.id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })
    res.json(product)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const {
      titulo, precio, descuento = 0, categoria_id,
      stock = 0, stock_minimo = 5, ubicacion, costo = 0,
      descripcion = null, barcode = null,
    } = req.body

    if (!titulo || !precio || !categoria_id) {
      return res.status(400).json({ message: 'titulo, precio y categoria_id son requeridos' })
    }

    let imagen = null
    const files = req.files || {}
    if (files.imagen?.[0]) {
      imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
    }

    const productId = await Product.create({ titulo, precio, descuento, categoria_id, imagen, descripcion, barcode: barcode || null }, conn)
    await ProductStock.upsert({ producto_id: productId, stock, stock_minimo, ubicacion, costo }, conn)

    if (files.imagenes_extra?.length) {
      const rutas = await Promise.all(
        files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname))
      )
      await Product.addImages(productId, rutas, conn)
    }

    await conn.commit()
    res.status(201).json({ id: productId, message: 'Producto creado' })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

async function update(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const id = +req.params.id
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    const fields = { ...req.body }
    const files  = req.files || {}

    if (files.imagen?.[0]) {
      deleteImage(product.imagen)
      fields.imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
    }

    if (fields.precio && +fields.precio !== +product.precio) {
      await PriceHistory.create({
        producto_id: id,
        precio:      product.precio,
        motivo:      'Actualización de precio',
        fecha:       new Date().toISOString().split('T')[0],
      })
    }

    await Product.update(id, fields)

    if (fields.stock !== undefined || fields.stock_minimo !== undefined ||
        fields.ubicacion !== undefined || fields.costo !== undefined) {
      await ProductStock.upsert({
        producto_id:  id,
        stock:        fields.stock,
        stock_minimo: fields.stock_minimo,
        ubicacion:    fields.ubicacion,
        costo:        fields.costo,
      }, conn)
    }

    if (files.imagenes_extra?.length) {
      const oldRutas = await Product.deleteImages(id, conn)
      oldRutas.forEach(r => deleteImage(r))
      const newRutas = await Promise.all(
        files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname))
      )
      await Product.addImages(id, newRutas, conn)
    }

    await conn.commit()
    res.json({ message: 'Producto actualizado' })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

/**
 * Elimina un producto de forma definitiva.
 *
 * Cascada manejada desde el backend (ver Product.delete):
 *   · stock_movements   → DELETE explícito antes del producto
 *   · product_images    → archivos físicos + BD antes del producto
 *   · product_stock     → ON DELETE CASCADE en la BD
 *   · price_history     → ON DELETE CASCADE en la BD
 *   · cart_items        → ON DELETE CASCADE en la BD
 *   · sales_order_items / purchase_order_items → SET NULL en producto_id
 */
async function remove(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const id = +req.params.id
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    // Eliminar archivos físicos de imágenes adicionales
    const extraRutas = await Product.deleteImages(id, conn)
    extraRutas.forEach(ruta => deleteImage(ruta))

    // Eliminar imagen principal del sistema de archivos
    deleteImage(product.imagen)

    // Eliminar el producto y sus dependencias (Product.delete maneja stock_movements)
    await Product.delete(id, conn)

    await conn.commit()
    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

async function priceHistory(req, res, next) {
  try {
    const history = await PriceHistory.listByProduct(+req.params.id)
    res.json(history)
  } catch (err) { next(err) }
}

async function lowStock(req, res, next) {
  try {
    const items = await ProductStock.lowStock()
    res.json(items)
  } catch (err) { next(err) }
}

module.exports = { list, show, create, update, remove, priceHistory, lowStock }
