const router      = require('express').Router()
const ctrl        = require('../controllers/productController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')
const { upload }  = require('../services/imageService')

// Multer: imagen principal (1) + hasta 4 imágenes extras
const uploadFields = upload.fields([
  { name: 'imagen',         maxCount: 1 },
  { name: 'imagenes_extra', maxCount: 4 },
])

// Admin + admin_complejo pueden gestionar productos
const writeRoles = ['admin', 'admin_complejo']

// Público
router.get ('/',           ctrl.list)
router.get ('/low-stock',  auth, requireRole(...writeRoles), ctrl.lowStock)
router.get ('/:id',        ctrl.show)
router.get ('/:id/prices', ctrl.priceHistory)

// Protegido — admin o admin_complejo
router.post  ('/',    auth, requireRole(...writeRoles), uploadFields, ctrl.create)
router.patch ('/:id', auth, requireRole(...writeRoles), uploadFields, ctrl.update)
router.delete('/:id', auth, requireRole(...writeRoles), ctrl.remove)

module.exports = router
