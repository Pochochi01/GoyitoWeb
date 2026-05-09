const router      = require('express').Router()
const ctrl        = require('../controllers/reviewController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

const adminRoles = ['admin', 'admin_complejo']

// ── Comprador ─────────────────────────────────────────────────
router.post('/',               auth, ctrl.create)
router.get ('/order/:ordenId', auth, ctrl.getByOrder)

// ── Admin: resumen + listado completo ─────────────────────────
// rutas específicas ANTES de la raíz para evitar conflictos
router.get('/summary', auth, requireRole(...adminRoles), ctrl.getSummary)
router.get('/pending', auth, requireRole(...adminRoles), ctrl.listPending)
router.get('/',        auth, requireRole(...adminRoles), ctrl.listAll)

module.exports = router
