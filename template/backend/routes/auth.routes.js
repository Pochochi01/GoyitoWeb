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

// ── OAuth Google (stateless) ──────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/google/failure',
  }),
  oauth.googleCallback
)
router.get('/google/failure', oauth.googleFailure)

module.exports = router
