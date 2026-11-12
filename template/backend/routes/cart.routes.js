const router = require('express').Router()
const ctrl   = require('../controllers/cartController')
const auth   = require('../middlewares/authMiddleware')

router.get   ('/',                auth, ctrl.get)
router.post  ('/',                auth, ctrl.add)
router.patch ('/:productoId',     auth, ctrl.updateItem)
router.delete('/:productoId',     auth, ctrl.removeItem)
router.delete('/',                auth, ctrl.clear)

module.exports = router
