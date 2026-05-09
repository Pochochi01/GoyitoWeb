const { verifyToken } = require('../services/tokenService')

/**
 * Verifica el JWT enviado en el header Authorization o en cookie 'token'.
 * Agrega req.user = { id, username, rol } si es válido.
 */
function authMiddleware(req, res, next) {
  const fromHeader = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null
  const token = fromHeader || req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' })
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

module.exports = authMiddleware
