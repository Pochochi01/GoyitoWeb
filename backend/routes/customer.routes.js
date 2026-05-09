const router      = require('express').Router()
const ctrl        = require('../controllers/customerController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

// ── Buyer: rutas propias (cualquier usuario logueado) ─────────
// Deben ir ANTES de /:id para que no sean interpretadas como IDs
router.get  ('/me',        auth, ctrl.myProfile)
router.patch('/me',        auth, ctrl.updateMyProfile)
router.get  ('/me/orders', auth, ctrl.myOrders)

// ── Admin: gestión de clientes ────────────────────────────────
router.get  ('/',          auth, requireRole('admin'), ctrl.list)
router.get  ('/:id',       auth, requireRole('admin'), ctrl.show)
router.get  ('/:id/orders',auth, requireRole('admin'), ctrl.orders)
router.post ('/',          auth, requireRole('admin'), ctrl.create)
router.patch('/:id',       auth, requireRole('admin'), ctrl.update)

module.exports = router
