const router      = require('express').Router()
const ctrl        = require('../controllers/settingsController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

// Público — para que el botón de WA cargue el número sin login
router.get('/', ctrl.getAll)

// Solo admin
router.put('/', auth, requireRole('admin'), ctrl.update)

module.exports = router
