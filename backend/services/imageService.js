const multer = require('multer')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')

const UPLOADS_DIR = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Multer almacena en memoria para que sharp procese antes de guardar
const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipo de imagen no permitido'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

/**
 * Convierte el buffer de la imagen a WebP con sharp y la guarda en /uploads.
 * @returns {string} ruta relativa  (ej. "uploads/producto-1234567890.webp")
 */
async function saveWebP(buffer, originalName) {
  const baseName  = path.parse(originalName).name.replace(/\s+/g, '-').toLowerCase()
  const fileName  = `${baseName}-${Date.now()}.webp`
  const filePath  = path.join(UPLOADS_DIR, fileName)

  await sharp(buffer)
    .webp({ quality: 82 })
    .toFile(filePath)

  return `uploads/${fileName}`
}

/**
 * Elimina la imagen anterior si existe.
 */
function deleteImage(relativePath) {
  if (!relativePath) return
  const abs = path.join(__dirname, '..', relativePath)
  if (fs.existsSync(abs)) fs.unlinkSync(abs)
}

module.exports = { upload, saveWebP, deleteImage }
