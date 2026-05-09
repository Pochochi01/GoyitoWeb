const bcrypt   = require('bcryptjs')
const User     = require('../models/User')
const Customer = require('../models/Customer')
const { signToken } = require('../services/tokenService')

const SALT_ROUNDS = 12

async function register(req, res, next) {
  try {
    const { username, password, nombre, email, rol = 'comprador', telefono } = req.body
    if (!username || !password || !nombre) {
      return res.status(400).json({ message: 'username, password y nombre son requeridos' })
    }

    const exists = await User.findByUsername(username)
    if (exists) return res.status(409).json({ message: 'El usuario ya existe' })

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const userId = await User.create({ username, password_hash, nombre, email, rol })

    if (rol === 'comprador' && email) {
      const existing = await Customer.findByEmail(email)
      if (!existing) await Customer.create({ nombre, email, telefono, usuario_id: userId })
    }

    const token = signToken({ id: userId, username, rol, sucursal_id: null })
    res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
      .status(201)
      .json({ message: 'Registro exitoso', token, user: { id: userId, username, nombre, rol, sucursal_id: null } })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'username y password requeridos' })
    }

    const user = await User.findByUsername(username)
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' })

    const token = signToken({ id: user.id, username: user.username, rol: user.rol, sucursal_id: user.sucursal_id || null })
    res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
      .json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol, sucursal_id: user.sucursal_id || null } })
  } catch (err) {
    next(err)
  }
}

function logout(_req, res) {
  res.clearCookie('token').json({ message: 'Sesión cerrada' })
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan campos' })
    }
    const user = await User.findByUsername(req.user.username)
    const match = await bcrypt.compare(currentPassword, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Contraseña actual incorrecta' })
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await User.updatePassword(req.user.id, hash)
    res.json({ message: 'Contraseña actualizada' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, logout, me, changePassword }
