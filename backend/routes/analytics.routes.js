const router      = require('express').Router()
const ctrl        = require('../controllers/analyticsController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

router.get('/products',  auth, requireRole('admin'), ctrl.products)
router.get('/sales',     auth, requireRole('admin'), ctrl.sales)
router.get('/purchases', auth, requireRole('admin'), ctrl.purchases)

module.exports = router
