/**
 * Passport en modo STATELESS (sin sessions).
 *
 * Política de cuentas del verify callback:
 *   1. Buscar por google_id → login recurrente.
 *   2. Buscar por email     → linkear cuenta existente.
 *   3. Crear nueva          → registro automático (rol default: comprador).
 *
 * NO se usa serializeUser ni deserializeUser porque no hay sessions.
 * El controller recibe `req.user` directo del verify callback y emite un JWT.
 */
'use strict'
const passport               = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const UserRepository         = require('../repositories/UserRepository')
const logger                 = require('../utils/logger')

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback'

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    '[Passport] ⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET no configurados. ' +
    'El login con Google no va a funcionar hasta que los agregues al .env.'
  )
}

passport.use(new GoogleStrategy(
  {
    clientID:     GOOGLE_CLIENT_ID     || 'placeholder',
    clientSecret: GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL:  CALLBACK_URL,
    scope:        ['profile', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId   = profile.id
      const email      = profile.emails?.[0]?.value?.toLowerCase()
      const nombre     = profile.displayName || email || 'Usuario Google'
      const avatarUrl  = profile.photos?.[0]?.value || null
      const isVerified = profile.emails?.[0]?.verified !== false

      if (!email) {
        return done(null, false, { message: 'Google no devolvió un email' })
      }
      if (!isVerified) {
        return done(null, false, { message: 'Tu email de Google no está verificado' })
      }

      // 1) Login recurrente
      let user = await UserRepository.findByGoogleId(googleId)
      if (user) {
        if (user.activo === 0 || user.activo === false) {
          return done(null, false, { message: 'Usuario inactivo' })
        }
        return done(null, user)
      }

      // 2) Linkear cuenta existente por email
      const existing = await UserRepository.findByEmail(email)
      if (existing) {
        if (existing.activo === 0 || existing.activo === false) {
          return done(null, false, { message: 'Usuario inactivo' })
        }
        await UserRepository.linkGoogleAccount(existing.id, { googleId, avatarUrl })
        logger.info(`[Passport] Cuenta linkeada: ${email} → google_id=${googleId}`)
        const refreshed = await UserRepository.findById(existing.id)
        return done(null, refreshed)
      }

      // 3) Registro nuevo
      const newId = await UserRepository.createFromGoogle({
        googleId, email, nombre, avatarUrl, rol: 'comprador',
      })
      logger.info(`[Passport] Usuario nuevo creado vía Google: ${email} (#${newId})`)
      const created = await UserRepository.findById(newId)
      return done(null, created)
    } catch (err) {
      logger.error('[Passport] Error en verify callback:', err.message)
      return done(err, null)
    }
  }
))

module.exports = passport
