const { verifyToken } = require('../services/tokenService')

/**
 * authMiddleware — verifica el JWT enviado en:
 *   1. Header `Authorization: Bearer <token>`
 *   2. Cookie `token`
 *
 * Si es válido, agrega `req.user = { id, username, rol, ... }` (el payload del JWT).
 * Si no, responde 401.
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
