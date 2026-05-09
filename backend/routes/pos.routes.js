const router      = require('express').Router()
const ctrl        = require('../controllers/posController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

const posOrAdmin = requireRole('pos', 'admin')

router.get ('/products',  auth, posOrAdmin, ctrl.searchProducts)
router.get ('/customers', auth, posOrAdmin, ctrl.searchCustomers)
router.get ('/branches',  auth, posOrAdmin, ctrl.getBranches)
router.get ('/sales',     auth, posOrAdmin, ctrl.listSales)
router.get ('/sales/:id', auth, posOrAdmin, ctrl.getSaleById)
router.get ('/reports',   auth, posOrAdmin, ctrl.getReports)
router.post('/sales',     auth, posOrAdmin, ctrl.createSale)

module.exports = router
