/**
 * oauthController — manejo del callback de Google OAuth.
 *
 * Cuando Google redirige a /api/auth/google/callback, passport ejecuta el
 * verify callback (config/passport.js) y deja el usuario en `req.user`.
 * Este controller:
 *   1. Firma un JWT con el mismo payload que el login tradicional.
 *   2. Setea la cookie httpOnly `token` (igual que authController.login).
 *   3. Redirige al frontend a /auth/callback?token=JWT con el token también
 *      en el query para que el frontend lo guarde en localStorage.
 *
 * El doble mecanismo (cookie + query) replica el comportamiento del login
 * tradicional: la cookie es la fuente de verdad para llamadas server-side,
 * el localStorage permite que axios mande Authorization Bearer.
 */
'use strict'
const { signToken } = require('../services/tokenService')
const logger        = require('../utils/logger')

// URL canónica del frontend (igual lógica que payment.service.js)
const FRONTEND_URL = (process.env.PUBLIC_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')[0].trim().replace(/\/$/, '')

/**
 * Handler del callback exitoso. passport ya pobló req.user.
 */
function googleCallback(req, res) {
  const user = req.user
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=no_user`)
  }

  const token = signToken({
    id:          user.id,
    username:    user.username,
    rol:         user.rol,
    sucursal_id: user.sucursal_id || null,
  })

  // Cookie httpOnly (server-side auth) — mismas flags que authController.login
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  logger.info(`[OAuth] Login exitoso vía Google: ${user.email} (#${user.id})`)

  // Redirige al frontend con el token en el query.
  // El frontend lo extrae, lo guarda en localStorage y limpia la URL.
  return res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`)
}

/**
 * Handler de fallo del OAuth (denegación, error de Google, email no verificado).
 */
function googleFailure(req, res) {
  const message = req.query.message || 'auth_failed'
  logger.warn(`[OAuth] Fallo: ${message}`)
  return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent(message)}`)
}

module.exports = { googleCallback, googleFailure }
