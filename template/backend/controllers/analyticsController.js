const AnalyticsRepository = require('../repositories/AnalyticsRepository')

// ─── /api/analytics/products ─────────────────────────────────
async function products(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    res.json(await AnalyticsRepository.products({ startDate, endDate }))
  } catch (err) { next(err) }
}

// ─── /api/analytics/sales ────────────────────────────────────
async function sales(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    res.json(await AnalyticsRepository.sales({ startDate, endDate }))
  } catch (err) { next(err) }
}

// ─── /api/analytics/purchases ────────────────────────────────
async function purchases(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    res.json(await AnalyticsRepository.purchases({ startDate, endDate }))
  } catch (err) { next(err) }
}

module.exports = { products, sales, purchases }
