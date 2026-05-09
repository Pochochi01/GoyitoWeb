const router        = require('express').Router()
const ctrl          = require('../controllers/salesOrderController')
const auth          = require('../middlewares/authMiddleware')
const optionalAuth  = require('../middlewares/optionalAuth')
const requireRole   = require('../middlewares/roleMiddleware')

const adminRoles = ['admin', 'admin_complejo']

// ── Checkout Efectivo / POS ───────────────────────────────────
router.post('/',            optionalAuth, ctrl.create)

// ── Checkout MercadoPago ──────────────────────────────────────
// Crea la orden (Pendiente) + Preference de MP en una sola llamada.
// optionalAuth: funciona para usuarios logueados y guest.
router.post('/checkout-mp', optionalAuth, ctrl.checkoutMP)

// ── Pago legacy (genera preference para orden existente) ──────
router.get ('/:id/payment', auth, ctrl.initPayment)

// ── Rutas admin / POS ─────────────────────────────────────────
router.get ('/',            auth, requireRole(...adminRoles, 'pos'), ctrl.list)
router.get ('/summary',     auth, requireRole(...adminRoles),        ctrl.summary)
router.get ('/:id',         auth, requireRole(...adminRoles, 'pos'), ctrl.show)
router.patch('/:id/estado', auth, requireRole(...adminRoles, 'pos'), ctrl.updateEstado)

module.exports = router
