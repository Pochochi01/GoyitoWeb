const { verifyToken } = require('../services/tokenService')

/**
 * optionalAuth — igual que authMiddleware pero NO falla si no hay token.
 * Úsalo en rutas que deben funcionar tanto para usuarios anónimos como autenticados.
 * req.user estará disponible solo si el token es válido.
 */
function optionalAuth(req, _res, next) {
  const fromHeader = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null
  const token = fromHeader || req.cookies?.token

  if (token) {
    try { req.user = verifyToken(token) } catch { /* token inválido → req.user queda undefined */ }
  }

  next()
}

module.exports = optionalAuth
