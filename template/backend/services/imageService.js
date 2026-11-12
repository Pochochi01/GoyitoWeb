const multer = require('multer')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')

const UPLOADS_DIR = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// ─── Config Multer ────────────────────────────────────────────
const storage = multer.memoryStorage()

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true)
  cb(new Error(`Tipo de archivo no permitido (${file.mimetype}). Solo imágenes.`))
}

const MAX_FILE_SIZE_MB = 10

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files:    5,
  },
})

// ─── Config Sharp ─────────────────────────────────────────────
const MAX_DIMENSION = 1200
const WEBP_QUALITY  = 82

/**
 * Procesa un buffer de imagen: redimensiona, aplica orientación EXIF,
 * convierte a WebP y guarda en /uploads. Devuelve la ruta relativa.
 */
async function saveWebP(buffer, originalName) {
  const baseName = path.parse(originalName).name
    .replace(/\s+/g, '-').toLowerCase().slice(0, 60) || 'imagen'
  const fileName = `${baseName}-${Date.now()}.webp`
  const filePath = path.join(UPLOADS_DIR, fileName)

  await sharp(buffer)
    .rotate()
    .resize({
      width:              MAX_DIMENSION,
      height:             MAX_DIMENSION,
      fit:                'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(filePath)

  return `uploads/${fileName}`
}

function deleteImage(relativePath) {
  if (!relativePath) return
  const abs = path.join(__dirname, '..', relativePath)
  try { fs.unlinkSync(abs) } catch (err) {
    if (err.code !== 'ENOENT') console.warn('[imageService] deleteImage:', err.message)
  }
}

/**
 * Middleware para capturar errores de Multer y devolver JSON amigable.
 * Registralo DESPUÉS de las rutas y ANTES del errorMiddleware genérico.
 */
function multerErrorHandler(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: `El archivo excede el límite de ${MAX_FILE_SIZE_MB} MB.`,
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ message: 'Superaste el número máximo de archivos.' })
    }
    return res.status(400).json({ message: err.message })
  }
  if (err?.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(415).json({ message: err.message })
  }
  next(err)
}

module.exports = { upload, saveWebP, deleteImage, multerErrorHandler, MAX_FILE_SIZE_MB }
