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

module.exports = router
