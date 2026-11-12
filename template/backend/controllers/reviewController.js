const ReviewRepository = require('../repositories/ReviewRepository')

// ─── POST /api/reviews ─── (comprador) ───────────────────────
async function create(req, res, next) {
  try {
    const { orden_id, rating, reseña } = req.body
    if (!orden_id || !rating) return res.status(400).json({ message: 'orden_id y rating son requeridos' })
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating debe ser entre 1 y 5' })

    const validation = await ReviewRepository.validateBeforeCreate(orden_id, req.user.id)
    if (!validation.existsOrder)         return res.status(404).json({ message: 'Orden no encontrada' })
    if (validation.estadoOrden !== 'Entregada') return res.status(400).json({ message: 'Solo se pueden reseñar órdenes con estado Entregada' })
    if (validation.usuarioIdOrden !== req.user.id) return res.status(403).json({ message: 'No podés reseñar esta orden' })
    if (validation.existsReview)         return res.status(409).json({ message: 'Ya calificaste esta orden' })

    const id = await ReviewRepository.create({
      orden_id, usuario_id: req.user.id, rating, reseña,
    })
    res.status(201).json({ id, message: 'Reseña publicada. ¡Gracias!' })
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/order/:ordenId ─── (comprador) ─────────
async function getByOrder(req, res, next) {
  try {
    const review = await ReviewRepository.findByOrderAndUser(+req.params.ordenId, req.user.id)
    res.json(review || null)
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/summary ─── (admin) ────────────────────
async function getSummary(_req, res, next) {
  try { res.json(await ReviewRepository.getSummary()) }
  catch (err) { next(err) }
}

// ─── GET /api/reviews ─── (admin) ────────────────────────────
async function listAll(req, res, next) {
  try {
    const { grupo, search, page = 1, limit = 20 } = req.query
    res.json(await ReviewRepository.listAll({ grupo, search, page: +page, limit: +limit }))
  } catch (err) { next(err) }
}

// ─── GET /api/reviews/pending ─── (admin) ────────────────────
async function listPending(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query
    res.json(await ReviewRepository.listPendingOrders({ search, page: +page, limit: +limit }))
  } catch (err) { next(err) }
}

module.exports = { create, getByOrder, getSummary, listAll, listPending }
