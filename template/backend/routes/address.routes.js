const router = require('express').Router()
const ctrl   = require('../controllers/addressController')
const auth   = require('../middlewares/authMiddleware')

router.get   ('/',                auth, ctrl.list)
router.post  ('/',                auth, ctrl.create)
router.patch ('/:id',             auth, ctrl.update)
router.delete('/:id',             auth, ctrl.remove)
router.patch ('/:id/principal',   auth, ctrl.setPrincipal)

module.exports = router
