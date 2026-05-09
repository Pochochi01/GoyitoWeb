require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const path         = require('path')

const { testConnection } = require('./config/db')
const logger             = require('./utils/logger')
const errorMiddleware    = require('./middlewares/errorMiddleware')

// ─── Rutas ────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes')
const productRoutes       = require('./routes/product.routes')
const categoryRoutes      = require('./routes/category.routes')
const stockRoutes         = require('./routes/stock.routes')
const supplierRoutes      = require('./routes/supplier.routes')
const purchaseOrderRoutes = require('./routes/purchaseOrder.routes')
const salesOrderRoutes    = require('./routes/salesOrder.routes')
const customerRoutes      = require('./routes/customer.routes')
const cartRoutes          = require('./routes/cart.routes')
const analyticsRoutes     = require('./routes/analytics.routes')
const posRoutes           = require('./routes/pos.routes')
const userRoutes          = require('./routes/user.routes')
const addressRoutes       = require('./routes/address.routes')
const reviewRoutes        = require('./routes/review.routes')
const settingsRoutes      = require('./routes/settings.routes')

const app  = express()
const PORT = process.env.PORT || 4000

// ─── Middlewares globales ──────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// ─── Archivos estáticos ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// En producción Nginx sirve el frontend directamente.
// Este bloque es un fallback por si el backend corre sin Nginx.
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(frontendDist))
}

// ─── API ───────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes)
app.use('/api/products',       productRoutes)
app.use('/api/categories',     categoryRoutes)
app.use('/api/stock',          stockRoutes)
app.use('/api/suppliers',      supplierRoutes)
app.use('/api/purchase-orders',purchaseOrderRoutes)
app.use('/api/sales-orders',   salesOrderRoutes)
app.use('/api/customers',      customerRoutes)
app.use('/api/cart',           cartRoutes)
app.use('/api/analytics',      analyticsRoutes)
app.use('/api/pos',            posRoutes)
app.use('/api/users',          userRoutes)
app.use('/api/addresses',      addressRoutes)
app.use('/api/reviews',        reviewRoutes)
app.use('/api/settings',       settingsRoutes)

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ─── SPA fallback (producción sin Nginx) ──────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')))
} else {
  app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }))
}

// ─── Error handler ────────────────────────────────────────────
app.use(errorMiddleware)

// ─── Start ────────────────────────────────────────────────────
async function start() {
  await testConnection()

  // Los módulos de pago usan ESM (import/export).
  // import() dinámico permite cargarlos desde un entorno CommonJS.
  // Si el proyecto migra a "type":"module", reemplazar por import estático.
  try {
    const { default: paymentRoutes } = await import('./routes/payment.routes.js')
    app.use('/api/payments', paymentRoutes)
    logger.info('💳 Módulo de pagos MercadoPago registrado en /api/payments')
  } catch (err) {
    logger.error('❌ Error al cargar el módulo de pagos:', err.message)
    // No detener el servidor; el resto de la app funciona igual
  }

  app.listen(PORT, () => logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`))
}

start()
