const router      = require('express').Router()
const ctrl        = require('../controllers/categoryController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')
const { upload }  = require('../services/imageService')

const writeRoles  = ['admin', 'admin_complejo']
const uploadImage = upload.single('imagen')

router.get   ('/',    ctrl.list)
router.get   ('/:id', ctrl.show)

router.post  ('/',    auth, requireRole(...writeRoles), uploadImage, ctrl.create)
router.patch ('/:id', auth, requireRole(...writeRoles), uploadImage, ctrl.update)
router.delete('/:id', auth, requireRole(...writeRoles), ctrl.remove)

module.exports = router
