const UserRepository = require('../repositories/UserRepository')
const logger         = require('../utils/logger')

const VALID_ROLES = UserRepository.VALID_ROLES

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, rol, search, activo } = req.query
    const result = await UserRepository.list({
      page:   +page,
      limit:  +limit,
      rol:    rol    || undefined,
      search: search || undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
    })
    res.json({ data: result.rows, total: result.total, page: +page, limit: +limit })
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const user = await UserRepository.findById(+req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) { next(err) }
}

async function updateRol(req, res, next) {
  try {
    const targetId = +req.params.id
    const { rol }  = req.body

    if (!rol || !VALID_ROLES.includes(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`,
      })
    }
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'No podés cambiar tu propio rol' })
    }

    const target = await UserRepository.findById(targetId)
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' })

    await UserRepository.update(targetId, { rol })

    logger.info(`[UserController] Rol actualizado: usuario #${targetId} → ${rol} (por admin #${req.user.id})`)
    res.json({ message: `Rol actualizado a "${rol}"`, userId: targetId, rol })
  } catch (err) { next(err) }
}

async function toggleActivo(req, res, next) {
  try {
    const targetId = +req.params.id

    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'No podés inhabilitarte a vos mismo' })
    }

    const target = await UserRepository.findById(targetId)
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' })

    const nuevoActivo = target.activo ? 0 : 1
    await UserRepository.update(targetId, { activo: nuevoActivo })

    const accion = nuevoActivo ? 'habilitado' : 'inhabilitado'
    logger.info(`[UserController] Usuario #${targetId} ${accion} por admin #${req.user.id}`)
    res.json({ message: `Usuario ${accion}`, userId: targetId, activo: Boolean(nuevoActivo) })
  } catch (err) { next(err) }
}

module.exports = { list, show, updateRol, toggleActivo }
