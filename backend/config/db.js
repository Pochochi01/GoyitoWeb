const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            parseInt(process.env.DB_PORT) || 3306,
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASS     || '',
  database:        process.env.DB_NAME     || 'goyitoweb',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
})

async function testConnection() {
  try {
    const conn = await pool.getConnection()
    console.log('✅ MySQL conectado:', process.env.DB_NAME)
    conn.release()
  } catch (err) {
    console.error('❌ Error de conexión MySQL:', err.message)
    process.exit(1)
  }
}

module.exports = { pool, testConnection }
