const { pool } = require('../config/db')

const MAX_ADDRESSES = 3

// ─── GET /api/addresses ───────────────────────────────────────
async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE usuario_id = ? ORDER BY es_principal DESC, created_at ASC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

// ─── POST /api/addresses ──────────────────────────────────────
async function create(req, res, next) {
  try {
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM user_addresses WHERE usuario_id = ?',
      [req.user.id]
    )
    if (count >= MAX_ADDRESSES) {
      return res.status(400).json({ message: `Máximo ${MAX_ADDRESSES} direcciones por cuenta` })
    }

    const { alias = 'Casa', calle, numero, piso, ciudad, provincia, codigo_postal, es_principal = false } = req.body
    if (!calle || !ciudad) return res.status(400).json({ message: 'calle y ciudad son requeridos' })

    // Si se marca como principal, quitar la principal anterior
    if (es_principal) {
      await pool.query('UPDATE user_addresses SET es_principal = 0 WHERE usuario_id = ?', [req.user.id])
    }

    const [r] = await pool.query(
      'INSERT INTO user_addresses (usuario_id, alias, calle, numero, piso, ciudad, provincia, codigo_postal, es_principal) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.user.id, alias, calle, numero || null, piso || null, ciudad, provincia || null, codigo_postal || null, es_principal ? 1 : 0]
    )

    // Si es la primera dirección, marcarla como principal automáticamente
    if (count === 0) {
      await pool.query('UPDATE user_addresses SET es_principal = 1 WHERE id = ?', [r.insertId])
    }

    res.status(201).json({ id: r.insertId, message: 'Dirección agregada' })
  } catch (err) { next(err) }
}

// ─── PATCH /api/addresses/:id ─────────────────────────────────
async function update(req, res, next) {
  try {
    const id = +req.params.id
    const [[addr]] = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ? AND usuario_id = ?', [id, req.user.id]
    )
    if (!addr) return res.status(404).json({ message: 'Dirección no encontrada' })

    const { alias, calle, numero, piso, ciudad, provincia, codigo_postal, es_principal } = req.body

    if (es_principal) {
      await pool.query('UPDATE user_addresses SET es_principal = 0 WHERE usuario_id = ?', [req.user.id])
    }

    await pool.query(
      `UPDATE user_addresses SET
         alias         = COALESCE(?, alias),
         calle         = COALESCE(?, calle),
         numero        = ?,
         piso          = ?,
         ciudad        = COALESCE(?, ciudad),
         provincia     = ?,
         codigo_postal = ?,
         es_principal  = COALESCE(?, es_principal)
       WHERE id = ? AND usuario_id = ?`,
      [alias || null, calle || null, numero ?? addr.numero, piso ?? addr.piso,
       ciudad || null, provincia ?? addr.provincia, codigo_postal ?? addr.codigo_postal,
       es_principal !== undefined ? (es_principal ? 1 : 0) : null, id, req.user.id]
    )
    res.json({ message: 'Dirección actualizada' })
  } catch (err) { next(err) }
}

// ─── DELETE /api/addresses/:id ────────────────────────────────
async function remove(req, res, next) {
  try {
    const id = +req.params.id
    const [r] = await pool.query(
      'DELETE FROM user_addresses WHERE id = ? AND usuario_id = ?', [id, req.user.id]
    )
    if (!r.affectedRows) return res.status(404).json({ message: 'Dirección no encontrada' })

    // Si era la principal y quedan otras, asignar la primera como principal
    await pool.query(
      `UPDATE user_addresses SET es_principal = 1
       WHERE usuario_id = ? AND es_principal = 0
       ORDER BY created_at ASC LIMIT 1`,
      [req.user.id]
    )
    res.json({ message: 'Dirección eliminada' })
  } catch (err) { next(err) }
}

// ─── PATCH /api/addresses/:id/principal ──────────────────────
async function setPrincipal(req, res, next) {
  try {
    const id = +req.params.id
    const [[addr]] = await pool.query(
      'SELECT id FROM user_addresses WHERE id = ? AND usuario_id = ?', [id, req.user.id]
    )
    if (!addr) return res.status(404).json({ message: 'Dirección no encontrada' })

    await pool.query('UPDATE user_addresses SET es_principal = 0 WHERE usuario_id = ?', [req.user.id])
    await pool.query('UPDATE user_addresses SET es_principal = 1 WHERE id = ?', [id])
    res.json({ message: 'Dirección principal actualizada' })
  } catch (err) { next(err) }
}

module.exports = { list, create, update, remove, setPrincipal }
