/**
 * requireRole — genera un middleware que solo permite ciertos roles.
 * DEBE usarse DESPUÉS de authMiddleware.
 *
 * Ejemplo:
 *   router.get('/admin', authMiddleware, requireRole('admin'), handler)
 *   router.get('/staff', authMiddleware, requireRole('admin', 'pos'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    next()
  }
}

module.exports = requireRole
