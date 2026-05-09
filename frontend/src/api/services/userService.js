/**
 * userService — gestión de usuarios (solo admin)
 * getUsers(params)           → { data, total, page, limit }
 * getById(id)               → user object
 * updateRol(id, rol)        → { message, userId, rol }
 * toggleActivo(id)          → { message, userId, activo }
 */
import api from '../axios'

const userService = {
  async getUsers(params = {}) {
    const { data } = await api.get('/users', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`)
    return data
  },

  async updateRol(id, rol) {
    const { data } = await api.patch(`/users/${id}/rol`, { rol })
    return data
  },

  async toggleActivo(id) {
    const { data } = await api.patch(`/users/${id}/activo`)
    return data
  },
}

export default userService
