/**
 * Configuración de Passport en modo STATELESS (sin sessions).
 *
 * Usamos passport-google-oauth20 solo para:
 *   1. Iniciar el flow OAuth con Google (redirige al consent screen)
 *   2. Recibir el callback y verificar el token de Google
 *   3. Devolver el `profile` al controller para que decida qué hacer
 *
 * Política de cuentas (lookup en orden):
 *   a. Buscar por google_id → si existe, es login recurrente
 *   b. Buscar por email     → si existe, linkear la cuenta (set google_id)
 *   c. Si no existe         → crear nueva cuenta con provider='google'
 *
 * NO se usa serializeUser ni deserializeUser porque no hay sessions.
 * El controller recibe el `req.user` directo del callback y emite un JWT.
 */
'use strict'
const passport               = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const User                   = require('../models/User')
const logger                 = require('../utils/logger')

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
// URL absoluta del callback. Debe coincidir EXACTAMENTE con la registrada
// en Google Cloud Console (en "Authorized redirect URIs").
//   Dev:  http://localhost:5001/api/auth/google/callback
//   Prod: https://api.zolimportados.com/api/auth/google/callback
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
    // Confiamos en los emails verificados por Google
    scope:        ['profile', 'email'],
  },
  /**
   * verify callback — invocado tras el consentimiento del usuario.
   * @param {string} accessToken    token de Google (no lo persistimos)
   * @param {string} refreshToken   no se solicita (no usamos APIs de Google)
   * @param {object} profile        perfil estandarizado de passport
   * @param {function} done         callback(err, user)
   */
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

      // 1) Match exacto por google_id (login recurrente)
      let user = await User.findByGoogleId(googleId)
      if (user) {
        if (user.activo === 0) {
          return done(null, false, { message: 'Usuario inactivo' })
        }
        return done(null, user)
      }

      // 2) Match por email (linkeo de cuentas existentes)
      const existing = await User.findByEmail(email)
      if (existing) {
        if (existing.activo === 0) {
          return done(null, false, { message: 'Usuario inactivo' })
        }
        await User.linkGoogleAccount(existing.id, { googleId, avatarUrl })
        logger.info(`[Passport] Cuenta linkeada: ${email} → google_id=${googleId}`)
        // Re-fetch para devolver el user actualizado
        const refreshed = await User.findById(existing.id)
        return done(null, refreshed)
      }

      // 3) Usuario nuevo — registro automático con rol comprador
      const newId = await User.createFromGoogle({
        googleId, email, nombre, avatarUrl, rol: 'comprador',
      })
      logger.info(`[Passport] Usuario nuevo creado vía Google: ${email} (#${newId})`)
      const created = await User.findById(newId)
      return done(null, created)
    } catch (err) {
      logger.error('[Passport] Error en verify callback:', err.message)
      return done(err, null)
    }
  }
))

// NO usamos serializeUser/deserializeUser porque corre en modo `session: false`.
// El controller toma `req.user` directamente del verify callback y firma un JWT.

module.exports = passport
