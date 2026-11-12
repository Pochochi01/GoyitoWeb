/**
 * UserRepository — contrato del acceso a datos de usuarios.
 *
 * Modelo esperado:
 *   { id, username, password_hash, nombre, email, google_id, avatar_url,
 *     provider ('local'|'google'), rol, activo, sucursal_id, created_at }
 *
 * Reglas:
 *   - username UNIQUE
 *   - email UNIQUE (nullable)
 *   - google_id UNIQUE (nullable)
 *   - password_hash puede ser NULL (usuarios OAuth-only)
 *   - rol: enum ('admin' | 'admin_complejo' | 'pos' | 'comprador')
 *
 * Implementá cada método con tu ORM. Todos devuelven objetos planos
 * (POJO), no instancias del ORM.
 */
'use strict'

const NOT_IMPLEMENTED = () => { throw new Error('Repository method not implemented') }

const VALID_ROLES = ['comprador', 'pos', 'admin_complejo', 'admin']

const UserRepository = {
  VALID_ROLES,

  /**
   * @param {string} username
   * @returns {Promise<object|null>}  user con password_hash (para login)
   */
  async findByUsername(username) { return NOT_IMPLEMENTED() },

  /**
   * @param {number|string} id
   * @returns {Promise<object|null>}  user SIN password_hash
   */
  async findById(id) { return NOT_IMPLEMENTED() },

  /**
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) { return NOT_IMPLEMENTED() },

  /**
   * @param {string} googleId
   * @returns {Promise<object|null>}
   */
  async findByGoogleId(googleId) { return NOT_IMPLEMENTED() },

  /**
   * @param {object} data { username, password_hash, nombre, email, rol }
   * @returns {Promise<number|string>}  id del nuevo user
   */
  async create({ username, password_hash, nombre, email, rol = 'comprador' }) {
    return NOT_IMPLEMENTED()
  },

  /**
   * @param {object} data { googleId, email, nombre, avatarUrl, rol }
   * @returns {Promise<number|string>}  id del nuevo user
   *
   * Genera un `username` único derivado del email (parte antes de @, alfanumérico).
   * Establece password_hash=NULL y provider='google'.
   */
  async createFromGoogle({ googleId, email, nombre, avatarUrl, rol = 'comprador' }) {
    return NOT_IMPLEMENTED()
  },

  /**
   * Actualiza campos permitidos: nombre, email, activo, rol, sucursal_id.
   * @returns {Promise<number>}  filas afectadas
   */
  async update(id, fields) { return NOT_IMPLEMENTED() },

  /**
   * @returns {Promise<number>}  filas afectadas
   */
  async updatePassword(id, password_hash) { return NOT_IMPLEMENTED() },

  /**
   * Vincula un usuario existente con un perfil Google.
   * Actualiza google_id, avatar_url y provider='google'.
   * @returns {Promise<number>}  filas afectadas
   */
  async linkGoogleAccount(userId, { googleId, avatarUrl }) { return NOT_IMPLEMENTED() },

  /**
   * @param {object} opts { page, limit, rol, search, activo }
   * @returns {Promise<{rows: object[], total: number}>}
   */
  async list({ page = 1, limit = 20, rol, search, activo } = {}) {
    return NOT_IMPLEMENTED()
  },
}

module.exports = UserRepository
