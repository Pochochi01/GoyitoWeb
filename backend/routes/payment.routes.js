'use strict'
const router       = require('express').Router()
const ctrl         = require('../controllers/payment.controller')
const authMiddleware = require('../middlewares/authMiddleware')
const requireRole  = require('../middlewares/roleMiddleware')
const optionalAuth = require('../middlewares/optionalAuth')

// POST /api/payments/create-preference
router.post('/create-preference', optionalAuth, ctrl.createPreference)

// GET /api/payments/preference/:id  (admin / pos)
router.get(
  '/preference/:id',
  authMiddleware,
  requireRole('admin', 'admin_complejo', 'pos'),
  ctrl.getPreference
)

// POST /api/payments/webhook  (sin auth — llamada desde servidores de MP)
router.post('/webhook', ctrl.webhook)

// GET /api/payments/sync?payment_id=XXX  (sin auth — el usuario aún puede
// no estar logueado al volver de MP, y la verificación se hace contra MP
// con el access_token del backend, no contra la sesión).
router.get('/sync', ctrl.sync)

module.exports = router
