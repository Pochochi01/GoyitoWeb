const router      = require('express').Router()
const ctrl        = require('../controllers/stockController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

router.get ('/',          auth, requireRole('admin'), ctrl.movements)
router.post('/',          auth, requireRole('admin'), ctrl.addMovement)
router.get ('/low-stock', auth, requireRole('admin'), ctrl.lowStock)

module.exports = router
