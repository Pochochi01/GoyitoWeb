const { pool } = require('../config/db')

const Category = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY nombre')
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async create(nombre) {
    const [r] = await pool.query('INSERT INTO categories (nombre) VALUES (?)', [nombre])
    return r.insertId
  },

  async update(id, nombre) {
    const [r] = await pool.query('UPDATE categories SET nombre = ? WHERE id = ?', [nombre, id])
    return r.affectedRows
  },

  async delete(id) {
    const [r] = await pool.query('DELETE FROM categories WHERE id = ?', [id])
    return r.affectedRows
  },
}

module.exports = Category
