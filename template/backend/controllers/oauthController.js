/**
 * OAuth Google — callback handler.
 * Passport (config/passport.js) puebla req.user, este controller:
 *   1. Firma un JWT con el payload estándar.
 *   2. Setea cookie httpOnly (igual que authController.login).
 *   3. Redirige al frontend con el token en el query.
 */
'use strict'
const { signToken } = require('../services/tokenService')
const logger        = require('../utils/logger')

const FRONTEND_URL = (process.env.PUBLIC_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')[0].trim().replace(/\/$/, '')

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure:   process.env.NODE_ENV === 'production',
})

function googleCallback(req, res) {
  const user = req.user
  if (!user) return res.redirect(`${FRONTEND_URL}/login?oauth_error=no_user`)

  const token = signToken({
    id:          user.id,
    username:    user.username,
    rol:         user.rol,
    sucursal_id: user.sucursal_id || null,
  })

  res.cookie('token', token, cookieOpts())
  logger.info(`[OAuth] Login exitoso vía Google: ${user.email} (#${user.id})`)
  return res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`)
}

function googleFailure(req, res) {
  const message = req.query.message || 'auth_failed'
  logger.warn(`[OAuth] Fallo: ${message}`)
  return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent(message)}`)
}

module.exports = { googleCallback, googleFailure }
