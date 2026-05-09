import api from '../axios'

// Backend usa 'rol' / 'nombre' — adaptamos a 'role' / 'name' para el frontend
const adaptUser = (u) => ({
  id:          u.id,
  username:    u.username,
  name:        u.nombre      || u.name,
  role:        u.rol         || u.role,
  sucursal_id: u.sucursal_id || null,
})

// rol frontend → rol backend
const roleMap = {
  buyer:           'comprador',
  pos:             'pos',
  admin:           'admin',
  admin_complejo:  'admin_complejo',
}

const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password })
    return { token: data.token, user: adaptUser(data.user) }
  },

  async register({ name, email, password, role, phone, store }) {
    const { data } = await api.post('/auth/register', {
      username:      email,
      password,
      nombre:        name,
      email,
      rol:           roleMap[role] || 'comprador',
      telefono:      phone || undefined,
    })
    return { token: data.token, user: adaptUser(data.user) }
  },

  async logout() {
    await api.post('/auth/logout').catch(() => {})
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return adaptUser(data)
  },
}

export default authService
