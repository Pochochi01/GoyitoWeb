const router      = require('express').Router()
const ctrl        = require('../controllers/categoryController')
const auth        = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/roleMiddleware')

router.get   ('/',    ctrl.list)
router.post  ('/',    auth, requireRole('admin'), ctrl.create)
router.patch ('/:id', auth, requireRole('admin'), ctrl.update)
router.delete('/:id', auth, requireRole('admin'), ctrl.remove)

module.exports = router
