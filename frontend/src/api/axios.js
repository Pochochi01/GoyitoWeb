import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT de localStorage en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('goyito_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global: si el servidor responde 401 limpia la sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('goyito_token')
      localStorage.removeItem('goyito_user')
    }
    return Promise.reject(err)
  }
)

export default api
