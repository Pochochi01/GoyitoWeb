const router       = require('express').Router()
const ctrl         = require('../controllers/salesOrderController')
const auth         = require('../middlewares/authMiddleware')
const optionalAuth = require('../middlewares/optionalAuth')
const requireRole  = require('../middlewares/roleMiddleware')

const adminRoles = ['admin', 'admin_complejo']

// ── Checkout Efectivo / POS ───────────────────────────────────
router.post('/',            optionalAuth, ctrl.create)

// ── Checkout MercadoPago legacy (crea orden ANTES de MP) ──────
// Preferí POST /api/payments/init-mp que difiere la creación.
router.post('/checkout-mp', optionalAuth, ctrl.checkoutMP)

// ── Admin / POS ───────────────────────────────────────────────
router.get  ('/',            auth, requireRole(...adminRoles, 'pos'), ctrl.list)
router.get  ('/summary',     auth, requireRole(...adminRoles),        ctrl.summary)
router.get  ('/:id',         auth, requireRole(...adminRoles, 'pos'), ctrl.show)
router.patch('/:id/estado',  auth, requireRole(...adminRoles, 'pos'), ctrl.updateEstado)

module.exports = router
