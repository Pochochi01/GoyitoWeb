const router      = require('express').Router()
const ctrl        = require('../controllers/purchaseOrderController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

// Ambos roles de administrador pueden gestionar compras
const adminRoles = ['admin', 'admin_complejo']

router.get   ('/',           auth, requireRole(...adminRoles), ctrl.list)
router.get   ('/:id',        auth, requireRole(...adminRoles), ctrl.show)
router.post  ('/',           auth, requireRole(...adminRoles), ctrl.create)
router.patch ('/:id/estado', auth, requireRole(...adminRoles), ctrl.updateEstado)

module.exports = router
