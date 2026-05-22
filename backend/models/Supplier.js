const { pool } = require('../config/db')

const Supplier = {
  async findAll({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit
    const [rows] = await pool.query(
      'SELECT * FROM suppliers ORDER BY nombre LIMIT ? OFFSET ?',
      [limit, offset]
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async create({ nombre, cuit, contacto, email, tel, cond_pago, puntaje = 0 }) {
    const [r] = await pool.query(
      'INSERT INTO suppliers (nombre, cuit, contacto, email, tel, cond_pago, puntaje) VALUES (?,?,?,?,?,?,?)',
      [nombre, cuit, contacto || null, email || null, tel || null, cond_pago || null, puntaje]
    )
    return r.insertId
  },

  async update(id, fields) {
    const allowed = ['nombre', 'cuit', 'contacto', 'email', 'tel', 'cond_pago', 'puntaje']
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
    if (!entries.length) return 0
    const set  = entries.map(([k]) => `${k} = ?`).join(', ')
    const vals = [...entries.map(([, v]) => v), id]
    const [r] = await pool.query(`UPDATE suppliers SET ${set} WHERE id = ?`, vals)
    return r.affectedRows
  },

  /**
   * Elimina un proveedor y TODOS sus registros dependientes de forma definitiva.
   *
   * Orden de eliminación (cascada manejada desde el backend):
   *   1. purchase_order_items — CASCADE de purchase_orders, se eliminan automáticamente
   *   2. purchase_orders      — FK fk_po_supplier sin ON DELETE en BD original; se borra aquí
   *   3. suppliers            — eliminación definitiva del proveedor
   *
   * Nota: una vez aplicada cascade_migration.sql, el paso 2 lo maneja la BD
   *       automáticamente. El DELETE explícito es doble seguridad.
   */
  async delete(id) {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      // Paso 1 — eliminar órdenes de compra (sus ítems caen por fk_poi_order CASCADE)
      await conn.query('DELETE FROM purchase_orders WHERE proveedor_id = ?', [id])
      // Paso 2 — eliminar el proveedor
      const [r] = await conn.query('DELETE FROM suppliers WHERE id = ?', [id])
      await conn.commit()
      return r.affectedRows
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  },
}

module.exports = Supplier
