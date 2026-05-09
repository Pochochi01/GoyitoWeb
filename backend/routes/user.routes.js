const router      = require('express').Router()
const ctrl        = require('../controllers/userController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

// Solo el admin general puede gestionar usuarios
const adminOnly = [auth, requireRole('admin')]

router.get   ('/',              ...adminOnly, ctrl.list)
router.get   ('/:id',          ...adminOnly, ctrl.show)
router.patch ('/:id/rol',      ...adminOnly, ctrl.updateRol)
router.patch ('/:id/activo',   ...adminOnly, ctrl.toggleActivo)

module.exports = router
