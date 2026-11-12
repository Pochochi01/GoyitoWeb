/**
 * db.example.js — placeholder para tu conexión de base de datos.
 *
 * Reemplazá este archivo por tu configuración real. Ejemplos:
 *
 * ─── MySQL (mysql2) ─────────────────────────────────────────
 *   const mysql = require('mysql2/promise')
 *   const pool  = mysql.createPool({ host, port, user, password, database, ... })
 *   async function testConnection() { const c = await pool.getConnection(); c.release() }
 *   module.exports = { pool, testConnection }
 *
 * ─── PostgreSQL (pg) ────────────────────────────────────────
 *   const { Pool } = require('pg')
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL })
 *   async function testConnection() { await pool.query('SELECT 1') }
 *   module.exports = { pool, testConnection }
 *
 * ─── Sequelize ──────────────────────────────────────────────
 *   const { Sequelize } = require('sequelize')
 *   const sequelize = new Sequelize(process.env.DATABASE_URL)
 *   module.exports = { sequelize, testConnection: () => sequelize.authenticate() }
 *
 * ─── Prisma ─────────────────────────────────────────────────
 *   const { PrismaClient } = require('@prisma/client')
 *   const prisma = new PrismaClient()
 *   module.exports = { prisma, testConnection: () => prisma.$connect() }
 *
 * ─── MongoDB (mongoose) ─────────────────────────────────────
 *   const mongoose = require('mongoose')
 *   async function testConnection() { await mongoose.connect(process.env.MONGODB_URI) }
 *   module.exports = { mongoose, testConnection }
 *
 * Los repositories en `repositories/` esperan un método por operación
 * (findById, create, update, delete). Adaptalos a tu driver una vez elijas.
 */

async function testConnection() {
  throw new Error(
    '[db] No configuraste la conexión. Editá config/db.js con tu driver de BD.'
  )
}

module.exports = { testConnection }
