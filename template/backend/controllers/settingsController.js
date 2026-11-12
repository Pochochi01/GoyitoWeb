const SettingsRepository = require('../repositories/SettingsRepository')

// ─── GET /api/settings ────────────────────────────────────────
// Público: devuelve todas las configuraciones como objeto clave:valor.
async function getAll(_req, res, next) {
  try { res.json(await SettingsRepository.getAll()) }
  catch (err) { next(err) }
}

// ─── PUT /api/settings ────────────────────────────────────────
// Admin: actualiza uno o más pares clave-valor.
// Solo se aceptan las claves definidas en ALLOWED (whitelist).
async function update(req, res, next) {
  try {
    const ALLOWED = ['whatsapp_numero', 'whatsapp_mensaje']
    const entries = Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))

    if (entries.length === 0) {
      return res.status(400).json({ message: 'No hay claves válidas para actualizar' })
    }

    const pairs = Object.fromEntries(entries.map(([k, v]) => [k, v ?? '']))
    await SettingsRepository.upsertMany(pairs)

    res.json({ message: 'Configuración guardada', updated: entries.map(([k]) => k) })
  } catch (err) { next(err) }
}

module.exports = { getAll, update }
