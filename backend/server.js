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
const paymentRoutes       = require('./routes/payment.routes')

const app  = express()
const PORT = process.env.PORT || 5001

// ─── Middlewares globales ──────────────────────────────────────
// CORS — orígenes permitidos. Se leen de CLIENT_ORIGIN (lista separada por comas).
//   Dev:  CLIENT_ORIGIN=http://localhost:5173
//   Prod: CLIENT_ORIGIN=https://zolimportados.com,https://www.zolimportados.com
// Sin `methods` ni `allowedHeaders`: la librería usa defaults sensatos
// (GET, HEAD, PUT, PATCH, POST, DELETE — y refleja los headers que pide el cliente).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean)

app.use(cors({
  origin:      allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// Passport — solo se usa para Google OAuth (modo stateless, sin sessions).
// La configuración de la estrategia vive en config/passport.js.
const passport = require('./config/passport')
app.use(passport.initialize())

// ─── Archivos estáticos — uploads ─────────────────────────────
// Sirve imágenes subidas por el admin. En producción nginx las sirve
// directo del disco (ver nginx/api.zolimportados.com.conf), pero este
// middleware actúa como fallback y para desarrollo local.
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=15552000')
  next()
}, express.static(path.join(__dirname, 'uploads'), { fallthrough: false }))

// Si el archivo no existe devuelve 404 explícito (no deja caer al SPA fallback)
app.use('/uploads', (_req, res) => res.status(404).json({ message: 'Imagen no encontrada' }))

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
app.use('/api/payments',       paymentRoutes)

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ─── Multer error handler ─────────────────────────────────────
// Captura LIMIT_FILE_SIZE / tipo de archivo no permitido antes del
// errorMiddleware genérico para devolver JSON con mensaje amigable.
const { multerErrorHandler } = require('./services/imageService')
app.use(multerErrorHandler)

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
  app.listen(PORT, () => logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`))
}

start()
