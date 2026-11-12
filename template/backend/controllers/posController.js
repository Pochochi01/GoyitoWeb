const PosRepository     = require('../repositories/PosRepository')
const ProductRepository = require('../repositories/ProductRepository')

// ─── GET /api/pos/products?q=&limit=&barcode= ────────────────
async function searchProducts(req, res, next) {
  try {
    const { q = '', limit = 48, barcode } = req.query
    if (barcode) {
      const product = await ProductRepository.findByBarcode(barcode)
      return res.json(product ? [product] : [])
    }
    res.json(await PosRepository.searchProducts({ q, limit: +limit }))
  } catch (err) { next(err) }
}

// ─── GET /api/pos/customers?q= ───────────────────────────────
async function searchCustomers(req, res, next) {
  try { res.json(await PosRepository.searchCustomers({ q: req.query.q || '' })) }
  catch (err) { next(err) }
}

// ─── GET /api/pos/branches ────────────────────────────────────
async function getBranches(_req, res, next) {
  try { res.json(await PosRepository.listBranches()) }
  catch (err) { next(err) }
}

// ─── POST /api/pos/sales ─────────────────────────────────────
async function createSale(req, res, next) {
  try {
    const { items, metodo_pago, cliente_id, descuento = 0, sucursal_id } = req.body
    if (!items?.length || !metodo_pago) {
      return res.status(400).json({ message: 'items y metodo_pago requeridos' })
    }
    const sale = await PosRepository.createSale({
      items, metodo_pago, cliente_id, descuento,
      sucursal_id: sucursal_id || req.user.sucursal_id || null,
      operador_id: req.user.id,
    })
    res.status(201).json({ ...sale, descuento })
  } catch (err) { next(err) }
}

// ─── GET /api/pos/sales ──────────────────────────────────────
async function listSales(req, res, next) {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0]
    const sucursal_id = req.query.sucursal_id
      ? +req.query.sucursal_id
      : (req.user.rol === 'pos' ? req.user.sucursal_id : null)
    res.json(await PosRepository.listSales({
      fecha, sucursal_id,
      operador_sucursal_id: req.user.sucursal_id,
    }))
  } catch (err) { next(err) }
}

// ─── GET /api/pos/sales/:id ──────────────────────────────────
async function getSaleById(req, res, next) {
  try {
    const sale = await PosRepository.getSaleById(+req.params.id)
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' })
    res.json(sale)
  } catch (err) { next(err) }
}

// ─── GET /api/pos/reports ────────────────────────────────────
async function getReports(req, res, next) {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0]
    const sucursal_id = req.query.sucursal_id
      ? +req.query.sucursal_id
      : (req.user.rol === 'pos' ? req.user.sucursal_id : null)
    res.json(await PosRepository.getReports({ fecha, sucursal_id }))
  } catch (err) { next(err) }
}

module.exports = {
  searchProducts, searchCustomers, getBranches,
  createSale, listSales, getSaleById, getReports,
}
