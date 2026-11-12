'use strict'
const router         = require('express').Router()
const ctrl           = require('../controllers/payment.controller')
const authMiddleware = require('../middlewares/authMiddleware')
const requireRole    = require('../middlewares/roleMiddleware')
const optionalAuth   = require('../middlewares/optionalAuth')

// Legacy — crear preference genérica
router.post('/create-preference', optionalAuth, ctrl.createPreference)

// Nuevo — crea SOLO preference (no crea orden hasta que MP aprueba)
router.post('/init-mp', optionalAuth, ctrl.initMP)

// Consulta de preference — admin/pos
router.get('/preference/:id',
  authMiddleware,
  requireRole('admin', 'admin_complejo', 'pos'),
  ctrl.getPreference
)

// Webhook de MP (pública, sin auth — MP la llama)
router.post('/webhook', ctrl.webhook)

// Sync desde el frontend al volver de MP (pública — auth real es contra MP)
router.get('/sync', ctrl.sync)

module.exports = router
