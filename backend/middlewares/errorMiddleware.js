const logger = require('../utils/logger')

/**
 * Middleware global de manejo de errores.
 * Debe registrarse ÚLTIMO en server.js.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  logger.error(err.stack || err.message)

  const status  = err.status || err.statusCode || 500
  const message = err.expose || process.env.NODE_ENV !== 'production'
    ? err.message
    : 'Error interno del servidor'

  res.status(status).json({ message })
}

module.exports = errorMiddleware
