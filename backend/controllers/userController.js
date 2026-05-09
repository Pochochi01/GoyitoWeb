const User   = require('../models/User')
const logger = require('../utils/logger')

const VALID_ROLES = User.VALID_ROLES  // ['comprador','pos','admin_complejo','admin']

// ─── GET /api/users ───────────────────────────────────────────
async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, rol, search, activo } = req.query
    const result = await User.list({
      page:   +page,
      limit:  +limit,
      rol:    rol    || undefined,
      search: search || undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
    })
    res.json({ data: result.rows, total: result.total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

// ─── PATCH /api/users/:id/rol ─────────────────────────────────
async function updateRol(req, res, next) {
  try {
    const targetId = +req.params.id
    const { rol }  = req.body

    if (!rol || !VALID_ROLES.includes(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`,
      })
    }

    // Un admin no puede cambiar su propio rol para no bloquearse
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'No podés cambiar tu propio rol' })
    }

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' })

    await User.update(targetId, { rol })

    logger.info(`[UserController] Rol actualizado: usuario #${targetId} → ${rol} (por admin #${req.user.id})`)
    res.json({ message: `Rol actualizado a "${rol}"`, userId: targetId, rol })
  } catch (err) { next(err) }
}

// ─── PATCH /api/users/:id/activo ─────────────────────────────
async function toggleActivo(req, res, next) {
  try {
    const targetId = +req.params.id

    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'No podés inhabilitarte a vos mismo' })
    }

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' })

    const nuevoActivo = target.activo ? 0 : 1
    await User.update(targetId, { activo: nuevoActivo })

    const accion = nuevoActivo ? 'habilitado' : 'inhabilitado'
    logger.info(`[UserController] Usuario #${targetId} ${accion} por admin #${req.user.id}`)
    res.json({ message: `Usuario ${accion}`, userId: targetId, activo: Boolean(nuevoActivo) })
  } catch (err) { next(err) }
}

// ─── GET /api/users/:id ───────────────────────────────────────
async function show(req, res, next) {
  try {
    const user = await User.findById(+req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) { next(err) }
}

module.exports = { list, show, updateRol, toggleActivo }
