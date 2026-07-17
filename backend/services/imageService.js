const multer = require('multer')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')

const UPLOADS_DIR = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// ─── Config Multer ────────────────────────────────────────────
// Almacenamos en memoria para que Sharp procese el buffer antes de escribirlo.
const storage = multer.memoryStorage()

// Solo aceptamos imágenes. El navegador manda el mimetype real del archivo.
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true)
  cb(new Error(`Tipo de archivo no permitido (${file.mimetype}). Solo imágenes.`))
}

// Límite de 10 MB por archivo. Los productos suelen subir fotos hasta 8-9 MB
// desde el celular. Coordinado con `client_max_body_size` de nginx (ver nota
// al final del servicio).
const MAX_FILE_SIZE_MB = 10

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,  // 10 MB
    files:    5,                               // máx. 5 archivos por request
  },
})

// ─── Config Sharp ─────────────────────────────────────────────
// Dimensiones máximas del lado más largo. Sharp mantiene el ratio original.
// 1200px cubre bien pantallas retina (2x en cards de ~600px).
const MAX_DIMENSION = 1200
// Calidad WebP. 82 es el sweet spot: peso chico + calidad casi indistinguible.
const WEBP_QUALITY  = 82

/**
 * Procesa un buffer de imagen: redimensiona si es más grande que MAX_DIMENSION,
 * convierte a WebP y guarda en /uploads.
 *
 * · `resize` con `fit: 'inside'` mantiene el aspect ratio y NO recorta.
 *   El `object-fit: cover` del CSS es quien recorta al ancho del card.
 * · `withoutEnlargement: true` evita agrandar imágenes ya chicas
 *   (una foto de 400x400 no se estira a 1200x1200).
 * · `rotate()` sin argumentos aplica orientación EXIF (fotos verticales
 *   del celular no quedan "acostadas").
 *
 * @param {Buffer} buffer         del archivo Multer
 * @param {string} originalName   para derivar el nombre del archivo
 * @returns {Promise<string>}     ruta relativa (ej. "uploads/foto-1234.webp")
 */
async function saveWebP(buffer, originalName) {
  const baseName = path.parse(originalName).name
    .replace(/\s+/g, '-').toLowerCase().slice(0, 60) || 'imagen'
  const fileName = `${baseName}-${Date.now()}.webp`
  const filePath = path.join(UPLOADS_DIR, fileName)

  await sharp(buffer)
    .rotate()  // aplica orientación EXIF (previene fotos "de costado")
    .resize({
      width:              MAX_DIMENSION,
      height:             MAX_DIMENSION,
      fit:                'inside',           // no recorta, mantiene ratio
      withoutEnlargement: true,               // no agranda originales chicas
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(filePath)

  return `uploads/${fileName}`
}

/**
 * Elimina el archivo físico si existe. Ignora errores para que un
 * archivo ya borrado no rompa el flujo.
 */
function deleteImage(relativePath) {
  if (!relativePath) return
  const abs = path.join(__dirname, '..', relativePath)
  try { fs.unlinkSync(abs) } catch (err) {
    if (err.code !== 'ENOENT') console.warn('[imageService] deleteImage:', err.message)
  }
}

/**
 * Middleware Express para capturar errores de Multer y devolver JSON con
 * mensaje amigable en vez del stack trace del framework.
 * Registralo DESPUÉS de las rutas que usan `upload.single()` / `.fields()`.
 */
function multerErrorHandler(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: `El archivo excede el límite de ${MAX_FILE_SIZE_MB} MB. Reducí el tamaño o comprimí la imagen.`,
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ message: 'Superaste el número máximo de archivos permitidos.' })
    }
    return res.status(400).json({ message: err.message })
  }
  if (err?.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(415).json({ message: err.message })
  }
  next(err)
}

module.exports = { upload, saveWebP, deleteImage, multerErrorHandler, MAX_FILE_SIZE_MB }
