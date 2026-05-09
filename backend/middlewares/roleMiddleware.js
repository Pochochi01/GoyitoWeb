/**
 * Genera un middleware que solo permite los roles indicados.
 * Debe usarse DESPUÉS de authMiddleware.
 * Ejemplo: router.get('/admin', authMiddleware, requireRole('admin'), handler)
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
