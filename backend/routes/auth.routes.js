const router   = require('express').Router()
const passport = require('../config/passport')
const ctrl     = require('../controllers/authController')
const oauth    = require('../controllers/oauthController')
const auth     = require('../middlewares/authMiddleware')

// ── Auth tradicional ──────────────────────────────────────────
router.post ('/register',         ctrl.register)
router.post ('/login',            ctrl.login)
router.post ('/logout',           ctrl.logout)
router.get  ('/me',        auth,  ctrl.me)
router.patch('/password',  auth,  ctrl.changePassword)

// ── OAuth con Google (sin sessions) ───────────────────────────
// 1) Inicio del flow — redirige al consent screen de Google
router.get('/google',
  passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
  })
)

// 2) Callback que Google llama tras el consentimiento
router.get('/google/callback',
  passport.authenticate('google', {
    session:        false,
    // Si passport falla (denegación, error), redirige al handler de fallo
    failureRedirect: '/api/auth/google/failure',
  }),
  oauth.googleCallback
)

// 3) Handler explícito de fallos del OAuth (redirige al frontend con error)
router.get('/google/failure', oauth.googleFailure)

module.exports = router
