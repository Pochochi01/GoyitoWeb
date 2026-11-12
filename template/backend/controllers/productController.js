const ProductRepository      = require('../repositories/ProductRepository')
const ProductStockRepository = require('../repositories/ProductStockRepository')
const PriceHistoryRepository = require('../repositories/PriceHistoryRepository')
const { saveWebP, deleteImage } = require('../services/imageService')

// NOTA: este controller usa transacciones. Como la implementación depende
// del ORM/driver, el helper `withTransaction` debe existir en tu proyecto.
// Ejemplo genérico:
//   async function withTransaction(fn) {
//     const conn = await pool.getConnection()
//     try { await conn.beginTransaction(); const r = await fn(conn); await conn.commit(); return r }
//     catch (err) { await conn.rollback(); throw err }
//     finally { conn.release() }
//   }
// Si usás Sequelize: sequelize.transaction(async t => fn(t))
// Si usás Prisma:    prisma.$transaction(async tx => fn(tx))
const { withTransaction } = require('../config/db')

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, categoria_id, activo, oferta } = req.query
    const products = await ProductRepository.list({
      page: +page, limit: +limit,
      categoria_id: categoria_id ? +categoria_id : undefined,
      activo:       activo       !== undefined ? +activo : undefined,
      oferta:       oferta === 'true',
    })
    const total = await ProductRepository.count({
      categoria_id: categoria_id ? +categoria_id : undefined,
      activo:       activo !== undefined ? +activo : undefined,
    })
    res.json({ data: products, total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const p = await ProductRepository.findById(+req.params.id)
    if (!p) return res.status(404).json({ message: 'Producto no encontrado' })
    res.json(p)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const {
      titulo, precio, descuento = 0, categoria_id,
      stock = 0, stock_minimo = 5, ubicacion, costo = 0,
      descripcion = null, barcode = null,
    } = req.body

    if (!titulo || !precio || !categoria_id) {
      return res.status(400).json({ message: 'titulo, precio y categoria_id son requeridos' })
    }

    const productId = await withTransaction(async (conn) => {
      let imagen = null
      const files = req.files || {}
      if (files.imagen?.[0]) {
        imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
      }

      const id = await ProductRepository.create(
        { titulo, precio, descuento, categoria_id, imagen, descripcion, barcode: barcode || null },
        conn
      )
      await ProductStockRepository.upsert(
        { producto_id: id, stock, stock_minimo, ubicacion, costo }, conn
      )

      if (files.imagenes_extra?.length) {
        const rutas = await Promise.all(
          files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname))
        )
        await ProductRepository.addImages(id, rutas, conn)
      }
      return id
    })

    res.status(201).json({ id: productId, message: 'Producto creado' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const id = +req.params.id
    const product = await ProductRepository.findById(id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    await withTransaction(async (conn) => {
      const fields = { ...req.body }
      const files  = req.files || {}

      if (files.imagen?.[0]) {
        deleteImage(product.imagen)
        fields.imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
      }

      // Historial de precio (dentro de la TX)
      if (fields.precio && +fields.precio !== +product.precio) {
        await PriceHistoryRepository.create({
          producto_id: id,
          precio:      product.precio,
          motivo:      'Actualización de precio',
          fecha:       new Date().toISOString().split('T')[0],
        }, conn)
      }

      await ProductRepository.update(id, fields)

      if (
        fields.stock !== undefined || fields.stock_minimo !== undefined ||
        fields.ubicacion !== undefined || fields.costo !== undefined
      ) {
        await ProductStockRepository.upsert({
          producto_id:  id,
          stock:        fields.stock,
          stock_minimo: fields.stock_minimo,
          ubicacion:    fields.ubicacion,
          costo:        fields.costo,
        }, conn)
      }

      // Reemplazo de imágenes extras
      if (files.imagenes_extra?.length) {
        const oldRutas = await ProductRepository.deleteImages(id, conn)
        oldRutas.forEach(r => deleteImage(r))
        const newRutas = await Promise.all(
          files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname))
        )
        await ProductRepository.addImages(id, newRutas, conn)
      }
    })

    res.json({ message: 'Producto actualizado' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const id = +req.params.id
    const product = await ProductRepository.findById(id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    await withTransaction(async (conn) => {
      const extraRutas = await ProductRepository.deleteImages(id, conn)
      extraRutas.forEach(r => deleteImage(r))
      deleteImage(product.imagen)
      await ProductRepository.delete(id, conn)
    })

    res.json({ message: 'Producto eliminado' })
  } catch (err) { next(err) }
}

async function priceHistory(req, res, next) {
  try { res.json(await PriceHistoryRepository.listByProduct(+req.params.id)) }
  catch (err) { next(err) }
}

async function lowStock(_req, res, next) {
  try { res.json(await ProductStockRepository.lowStock()) }
  catch (err) { next(err) }
}

module.exports = { list, show, create, update, remove, priceHistory, lowStock }
