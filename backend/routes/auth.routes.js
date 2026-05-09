const router = require('express').Router()
const ctrl   = require('../controllers/authController')
const auth   = require('../middlewares/authMiddleware')

router.post('/register',         ctrl.register)
router.post('/login',            ctrl.login)
router.post('/logout',           ctrl.logout)
router.get ('/me',        auth,  ctrl.me)
router.patch('/password', auth,  ctrl.changePassword)

module.exports = router
