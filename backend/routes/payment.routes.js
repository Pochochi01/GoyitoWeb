/**
 * payment.routes.js — Endpoints de Pagos MercadoPago
 * ====================================================
 * Monta los siguientes endpoints bajo el prefijo /api/payments:
 *
 *  POST   /api/payments/create-preference   Crea una Preference de MP
 *  GET    /api/payments/preference/:id      Recupera una Preference existente
 *  POST   /api/payments/webhook             IPN / notificaciones de MP
 *
 * Autenticación:
 *  - create-preference: optionalAuth → funciona con o sin token
 *  - preference/:id:    requiere JWT con rol admin/admin_complejo/pos
 *  - webhook:           sin auth (MercadoPago llama desde sus servidores)
 *
 * NOTA DE INTEGRACIÓN ESM ↔ CJS:
 *  Los middlewares del proyecto aún son CommonJS. Los importamos con
 *  createRequire() para mantener ESM puro en este módulo sin depender de
 *  import() dinámico a nivel de módulo (no soportado en todos los entornos).
 */

import { Router }        from 'express'
import { createRequire } from 'module'
import {
  createPreference,
  getPreference,
  webhook,
} from '../controllers/payment.controller.js'

// Puente CJS → ESM: permite usar require() dentro de un módulo ESM
const require = createRequire(import.meta.url)

const authMiddleware = require('../middlewares/authMiddleware')
const requireRole    = require('../middlewares/roleMiddleware')
const optionalAuth   = require('../middlewares/optionalAuth')

const router = Router()

// ── POST /api/payments/create-preference ─────────────────────
/**
 * Crea una Preference de MercadoPago.
 * Acepta usuarios anónimos (guest checkout) y logueados.
 *
 * Body:
 *  { items, payer, externalReference, backUrls, autoReturn, notificationUrl }
 */
router.post('/create-preference', optionalAuth, createPreference)

// ── GET /api/payments/preference/:id ─────────────────────────
/**
 * Recupera una Preference existente por su ID.
 * Solo accessible por roles administrativos / POS.
 */
router.get(
  '/preference/:id',
  authMiddleware,
  requireRole('admin', 'admin_complejo', 'pos'),
  getPreference
)

// ── POST /api/payments/webhook ────────────────────────────────
/**
 * Recibe notificaciones IPN de MercadoPago.
 * Sin autenticación — MercadoPago llama desde sus IPs.
 * En producción: validar HMAC-SHA256 con MP_WEBHOOK_SECRET.
 */
router.post('/webhook', webhook)

export default router
