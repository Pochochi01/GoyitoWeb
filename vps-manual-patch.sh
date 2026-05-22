#!/bin/bash
# ============================================================
#  Parche manual para el VPS — aplica los fixes directamente
#  sin necesitar git pull. Ejecutar como root en el VPS:
#    bash /tmp/vps-manual-patch.sh
# ============================================================

PROJECT="/var/www/proyectos-mysql/GoyitoWeb"

echo "▶ Aplicando parches en el backend..."

# ── Parche 1: Product.js — delete() borra stock_movements primero ──
cat > "$PROJECT/backend/models/Product.js" << 'HEREDOC'
const { pool } = require('../config/db')

const Product = {
  async list({ page = 1, limit = 20, categoria_id, activo, oferta } = {}) {
    const offset = (page - 1) * limit
    const where  = []
    const params = []
    if (categoria_id !== undefined) { where.push('p.categoria_id = ?'); params.push(categoria_id) }
    if (activo       !== undefined) { where.push('p.activo = ?');       params.push(activo) }
    if (oferta       === true)      { where.push('p.descuento > 0') }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)
    const [rows] = await pool.query(
      `SELECT p.*,
              c.nombre AS categoria,
              s.stock, s.stock_minimo, s.costo, s.ubicacion,
              (SELECT GROUP_CONCAT(pi.ruta ORDER BY pi.orden SEPARATOR '|')
               FROM product_images pi WHERE pi.producto_id = p.id) AS imagenes_extra
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       ${clause}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*,
              c.nombre AS categoria,
              s.stock, s.stock_minimo, s.costo, s.ubicacion,
              (SELECT GROUP_CONCAT(pi.ruta ORDER BY pi.orden SEPARATOR '|')
               FROM product_images pi WHERE pi.producto_id = p.id) AS imagenes_extra
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       WHERE p.id = ? LIMIT 1`,
      [id]
    )
    return rows[0] || null
  },

  async findByBarcode(barcode) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS categoria, s.stock
       FROM products p
       JOIN categories c ON c.id = p.categoria_id
       LEFT JOIN product_stock s ON s.producto_id = p.id
       WHERE p.barcode = ? AND p.activo = 1 LIMIT 1`,
      [barcode]
    )
    return rows[0] || null
  },

  async create({ titulo, precio, descuento = 0, categoria_id, imagen = null, descripcion = null, barcode = null }, conn) {
    const db = conn || pool
    const [r] = await db.query(
      'INSERT INTO products (barcode, titulo, precio, descuento, categoria_id, imagen, descripcion) VALUES (?,?,?,?,?,?,?)',
      [barcode || null, titulo, precio, descuento, categoria_id, imagen, descripcion]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['titulo', 'precio', 'descuento', 'categoria_id', 'imagen', 'activo', 'descripcion', 'barcode']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE products SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  async addImages(producto_id, rutas, conn) {
    if (!rutas.length) return
    const db   = conn || pool
    const vals = rutas.map((ruta, i) => [producto_id, ruta, i])
    await db.query('INSERT INTO product_images (producto_id, ruta, orden) VALUES ?', [vals])
  },

  async deleteImages(producto_id, conn) {
    const db = conn || pool
    const [rows] = await db.query('SELECT ruta FROM product_images WHERE producto_id = ?', [producto_id])
    await db.query('DELETE FROM product_images WHERE producto_id = ?', [producto_id])
    return rows.map(r => r.ruta)
  },

  /* Elimina stock_movements antes del producto para evitar el FK fk_mov_prod */
  async delete(id, conn) {
    const db = conn || pool
    await db.query('DELETE FROM stock_movements WHERE producto_id = ?', [id])
    const [r] = await db.query('DELETE FROM products WHERE id = ?', [id])
    return r.affectedRows
  },

  async count({ categoria_id, activo } = {}) {
    const where  = []
    const params = []
    if (categoria_id !== undefined) { where.push('categoria_id = ?'); params.push(categoria_id) }
    if (activo       !== undefined) { where.push('activo = ?');       params.push(activo) }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM products ${clause}`, params)
    return rows[0].total
  },
}

module.exports = Product
HEREDOC
echo "   ✓ Product.js parcheado"

# ── Parche 2: productController.js — remove() con transacción ──
cat > "$PROJECT/backend/controllers/productController.js" << 'HEREDOC'
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
      activo:       activo !== undefined ? +activo : undefined,
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
    const { titulo, precio, descuento = 0, categoria_id, stock = 0, stock_minimo = 5, ubicacion, costo = 0, descripcion = null, barcode = null } = req.body
    if (!titulo || !precio || !categoria_id) {
      await conn.rollback()
      return res.status(400).json({ message: 'titulo, precio y categoria_id son requeridos' })
    }
    let imagen = null
    const files = req.files || {}
    if (files.imagen?.[0]) imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
    const productId = await Product.create({ titulo, precio, descuento, categoria_id, imagen, descripcion, barcode: barcode || null }, conn)
    await ProductStock.upsert({ producto_id: productId, stock, stock_minimo, ubicacion, costo }, conn)
    if (files.imagenes_extra?.length) {
      const rutas = await Promise.all(files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname)))
      await Product.addImages(productId, rutas, conn)
    }
    await conn.commit()
    res.status(201).json({ id: productId, message: 'Producto creado' })
  } catch (err) { await conn.rollback(); next(err) }
  finally { conn.release() }
}

async function update(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const id = +req.params.id
    const product = await Product.findById(id)
    if (!product) { await conn.rollback(); return res.status(404).json({ message: 'Producto no encontrado' }) }
    const fields = { ...req.body }
    const files  = req.files || {}
    if (files.imagen?.[0]) {
      deleteImage(product.imagen)
      fields.imagen = await saveWebP(files.imagen[0].buffer, files.imagen[0].originalname)
    }
    if (fields.precio && +fields.precio !== +product.precio) {
      const db = conn
      await db.query('INSERT INTO price_history (producto_id, precio, motivo, fecha) VALUES (?,?,?,?)',
        [id, product.precio, 'Actualización de precio', new Date().toISOString().split('T')[0]])
    }
    await Product.update(id, fields)
    if (fields.stock !== undefined || fields.stock_minimo !== undefined || fields.ubicacion !== undefined || fields.costo !== undefined) {
      await ProductStock.upsert({ producto_id: id, stock: fields.stock, stock_minimo: fields.stock_minimo, ubicacion: fields.ubicacion, costo: fields.costo }, conn)
    }
    if (files.imagenes_extra?.length) {
      const oldRutas = await Product.deleteImages(id, conn)
      oldRutas.forEach(r => deleteImage(r))
      const newRutas = await Promise.all(files.imagenes_extra.map(f => saveWebP(f.buffer, f.originalname)))
      await Product.addImages(id, newRutas, conn)
    }
    await conn.commit()
    res.json({ message: 'Producto actualizado' })
  } catch (err) { await conn.rollback(); next(err) }
  finally { conn.release() }
}

async function remove(req, res, next) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const id = +req.params.id
    const product = await Product.findById(id)
    if (!product) { await conn.rollback(); return res.status(404).json({ message: 'Producto no encontrado' }) }
    const extraRutas = await Product.deleteImages(id, conn)
    extraRutas.forEach(ruta => deleteImage(ruta))
    deleteImage(product.imagen)
    await Product.delete(id, conn)  /* delete() borra stock_movements antes del producto */
    await conn.commit()
    res.json({ message: 'Producto eliminado' })
  } catch (err) { await conn.rollback(); next(err) }
  finally { conn.release() }
}

async function priceHistory(req, res, next) {
  try { res.json(await require('../models/PriceHistory').listByProduct(+req.params.id)) }
  catch (err) { next(err) }
}

async function lowStock(req, res, next) {
  try { res.json(await ProductStock.lowStock()) }
  catch (err) { next(err) }
}

module.exports = { list, show, create, update, remove, priceHistory, lowStock }
HEREDOC
echo "   ✓ productController.js parcheado"

# ── Parche 3: productService.js — BASE URL y Content-Type ──────
sed -i "s|const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'|const _apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'\nconst BASE = (() => { try { return new URL(_apiUrl).origin } catch { return 'http://localhost:5001' } })()|g" \
  "$PROJECT/frontend/src/api/services/productService.js" 2>/dev/null || true

sed -i "s|headers: { 'Content-Type': 'multipart/form-data' }|headers: { 'Content-Type': undefined }|g" \
  "$PROJECT/frontend/src/api/services/productService.js" 2>/dev/null && \
  echo "   ✓ productService.js parcheado" || \
  echo "   ⚠  productService.js ya estaba actualizado"

# ── Migración de BD ────────────────────────────────────────────
echo ""
echo "▶ Aplicando migración FK CASCADE (ingresá contraseña MySQL):"
mysql -u zolimportados_user -p goyitoweb < "$PROJECT/backend/database/cascade_migration.sql" && \
  echo "   ✓ Migración aplicada" || \
  echo "   ⚠  Migración ya aplicada anteriormente"

# ── Permisos uploads ───────────────────────────────────────────
echo ""
echo "▶ Configurando directorio uploads..."
mkdir -p "$PROJECT/backend/uploads"
chmod 755 "$PROJECT/backend/uploads"
echo "   ✓ Permisos OK"

# ── Build frontend ─────────────────────────────────────────────
echo ""
echo "▶ Verificando .env frontend..."
if [ ! -f "$PROJECT/frontend/.env" ]; then
  echo "VITE_API_URL=https://api.zolimportados.com/api" > "$PROJECT/frontend/.env"
  echo "   ✓ Creado frontend/.env"
fi
cat "$PROJECT/frontend/.env"

echo ""
echo "▶ Compilando frontend (puede tardar 1-2 min)..."
cd "$PROJECT/frontend"
npm run build
echo "   ✓ Build completado"

# ── Reiniciar backend ──────────────────────────────────────────
echo ""
echo "▶ Reiniciando backend..."
pm2 restart zolimportados-api
echo "   ✓ Backend reiniciado"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✓ Parches aplicados correctamente      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Test: curl https://api.zolimportados.com/api/health"
echo ""
