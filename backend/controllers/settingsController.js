const { pool } = require('../config/db')

// ─── GET /api/settings ────────────────────────────────────────
// Público: devuelve todas las configuraciones como objeto clave:valor
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM site_settings')
    const obj = {}
    rows.forEach(r => { obj[r.clave] = r.valor })
    res.json(obj)
  } catch (err) { next(err) }
}

// ─── PUT /api/settings ────────────────────────────────────────
// Admin: actualiza uno o más pares clave-valor
// Body: { whatsapp_numero: '...' , whatsapp_mensaje: '...' }
async function update(req, res, next) {
  try {
    const ALLOWED = ['whatsapp_numero', 'whatsapp_mensaje']
    const entries = Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))

    if (entries.length === 0)
      return res.status(400).json({ message: 'No hay claves válidas para actualizar' })

    for (const [clave, valor] of entries) {
      await pool.query(
        'INSERT INTO site_settings (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
        [clave, valor ?? '']
      )
    }

    res.json({ message: 'Configuración guardada', updated: entries.map(([k]) => k) })
  } catch (err) { next(err) }
}

module.exports = { getAll, update }
