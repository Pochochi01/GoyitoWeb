const CustomerRepository   = require('../repositories/CustomerRepository')
const SalesOrderRepository = require('../repositories/SalesOrderRepository')
const UserRepository       = require('../repositories/UserRepository')
const ReviewRepository     = require('../repositories/ReviewRepository')

// ─── Admin: list / show / create / update ────────────────────

async function list(req, res, next) {
  try {
    const { segmento, startDate, endDate, page = 1, limit = 50 } = req.query
    const items = await CustomerRepository.findAll({
      segmento, startDate, endDate, page: +page, limit: +limit,
    })
    res.json(items)
  } catch (err) { next(err) }
}

async function show(req, res, next) {
  try {
    const item = await CustomerRepository.findById(+req.params.id)
    if (!item) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json(item)
  } catch (err) { next(err) }
}

async function orders(req, res, next) {
  try {
    const items = await SalesOrderRepository.list({ cliente_id: +req.params.id, limit: 100 })
    res.json(items)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { nombre, email } = req.body
    if (!nombre || !email) return res.status(400).json({ message: 'nombre y email requeridos' })
    const exists = await CustomerRepository.findByEmail(email)
    if (exists) return res.status(409).json({ message: 'Email ya registrado' })
    const id = await CustomerRepository.create(req.body)
    res.status(201).json({ id, message: 'Cliente creado' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const rows = await CustomerRepository.update(+req.params.id, req.body)
    if (!rows) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json({ message: 'Cliente actualizado' })
  } catch (err) { next(err) }
}

// ─── Buyer: perfil propio ─────────────────────────────────────

/** GET /api/customers/me — perfil del comprador logueado */
async function myProfile(req, res, next) {
  try {
    // Necesita un método en el repository: findByUserId(usuario_id)
    // que devuelva el customer JOIN con user.username y user.email.
    // Ver CustomerRepository — agregar el método si no existe.
    const cust = await CustomerRepository.findByUserId?.(req.user.id)
    if (!cust) {
      const u = await UserRepository.findById(req.user.id)
      return res.json({
        fromUser: true, nombre: u?.nombre, email: u?.email, telefono: null, segmento: null,
      })
    }
    res.json(cust)
  } catch (err) { next(err) }
}

/** PATCH /api/customers/me — actualiza perfil */
async function updateMyProfile(req, res, next) {
  try {
    const { nombre, email, telefono } = req.body
    const cust = await CustomerRepository.findByUserId?.(req.user.id)

    if (cust) {
      await CustomerRepository.update(cust.id, { nombre, email, telefono })
    }

    // Actualizar también nombre/email en users
    const userFields = {}
    if (nombre) userFields.nombre = nombre
    if (email)  userFields.email  = email
    if (Object.keys(userFields).length) {
      await UserRepository.update(req.user.id, userFields)
    }

    res.json({ message: 'Perfil actualizado' })
  } catch (err) { next(err) }
}

/** GET /api/customers/me/orders — pedidos del comprador con flag ya_reseñado */
async function myOrders(req, res, next) {
  try {
    const cust = await CustomerRepository.findByUserId?.(req.user.id)
    if (!cust) return res.json([])

    const items = await SalesOrderRepository.list({ cliente_id: cust.id, limit: 100 })

    // Marcar cuáles ya tienen reseña
    const enriched = await Promise.all(items.map(async o => {
      const review = await ReviewRepository.findByOrderAndUser(o.id, req.user.id)
      const full   = await SalesOrderRepository.findById(o.id)  // trae items
      return { ...full, ya_reseñado: Boolean(review) }
    }))

    res.json(enriched)
  } catch (err) { next(err) }
}

module.exports = { list, show, orders, create, update, myProfile, updateMyProfile, myOrders }
