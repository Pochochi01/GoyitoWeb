const bcrypt              = require('bcryptjs')
const UserRepository      = require('../repositories/UserRepository')
const CustomerRepository  = require('../repositories/CustomerRepository')
const { signToken }       = require('../services/tokenService')

const SALT_ROUNDS = 12

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure:   process.env.NODE_ENV === 'production',
})

async function register(req, res, next) {
  try {
    const { username, password, nombre, email, rol = 'comprador', telefono } = req.body
    if (!username || !password || !nombre) {
      return res.status(400).json({ message: 'username, password y nombre son requeridos' })
    }

    const exists = await UserRepository.findByUsername(username)
    if (exists) return res.status(409).json({ message: 'El usuario ya existe' })

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const userId        = await UserRepository.create({ username, password_hash, nombre, email, rol })

    // Si el rol es 'comprador' y hay email, crear también un customer vinculado
    if (rol === 'comprador' && email) {
      const existing = await CustomerRepository.findByEmail(email)
      if (!existing) await CustomerRepository.create({ nombre, email, telefono, usuario_id: userId })
    }

    const token = signToken({ id: userId, username, rol, sucursal_id: null })
    res
      .cookie('token', token, cookieOpts())
      .status(201)
      .json({
        message: 'Registro exitoso', token,
        user: { id: userId, username, nombre, rol, sucursal_id: null },
      })
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'username y password requeridos' })
    }

    const user = await UserRepository.findByUsername(username)
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' })

    const token = signToken({
      id:          user.id,
      username:    user.username,
      rol:         user.rol,
      sucursal_id: user.sucursal_id || null,
    })
    res
      .cookie('token', token, cookieOpts())
      .json({
        token,
        user: {
          id:          user.id,
          username:    user.username,
          nombre:      user.nombre,
          rol:         user.rol,
          sucursal_id: user.sucursal_id || null,
        },
      })
  } catch (err) { next(err) }
}

function logout(_req, res) {
  res.clearCookie('token').json({ message: 'Sesión cerrada' })
}

async function me(req, res, next) {
  try {
    const user = await UserRepository.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) { next(err) }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan campos' })
    }
    const user = await UserRepository.findByUsername(req.user.username)
    if (!user?.password_hash) {
      return res.status(400).json({ message: 'Tu cuenta no tiene contraseña (login por Google)' })
    }
    const match = await bcrypt.compare(currentPassword, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Contraseña actual incorrecta' })
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await UserRepository.updatePassword(req.user.id, hash)
    res.json({ message: 'Contraseña actualizada' })
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, me, changePassword }
