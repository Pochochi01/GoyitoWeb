import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'

// URL absoluta del backend OAuth. No usamos axios porque es una navegación
// completa (window.location.href), no un fetch — el navegador tiene que
// seguir los redirects de Google.
const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const GOOGLE_AUTH_URL = `${API_URL}/auth/google`

const OAUTH_ERROR_MESSAGES = {
  no_user:      'No se pudo verificar tu cuenta de Google.',
  auth_failed:  'Ocurrió un problema con el inicio de sesión con Google.',
}

const Login = () => {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Mostrar errores de OAuth si Login se cargó con ?oauth_error=...
  useEffect(() => {
    const oauthErr = searchParams.get('oauth_error')
    if (oauthErr) {
      setError(OAUTH_ERROR_MESSAGES[oauthErr] || `Error de OAuth: ${oauthErr}`)
    }
  }, [searchParams])

  const handleGoogleLogin = () => {
    // Navegación completa — el flow de OAuth requiere redirects server-side.
    window.location.href = GOOGLE_AUTH_URL
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      const { role } = result.user
      const dest = (role === 'admin' || role === 'admin_complejo')
        ? '/admin' : role === 'pos' ? '/pos' : '/'
      navigate(dest)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="py-4 px-6 bg-white dark:bg-gray-800 shadow-sm">
        <Link to="/" className="text-primary font-bold tracking-widest text-xl uppercase">
          ZolImportados
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md px-8 py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <FiLogIn className="text-primary text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Iniciar sesión</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bienvenido de vuelta
              </p>
            </div>

            {/* Botón Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                         bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                         rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200
                         hover:bg-gray-50 dark:hover:bg-gray-600
                         hover:border-primary hover:shadow-sm
                         transition-all duration-200 min-h-[44px] mb-5"
            >
              <FcGoogle size={20}/>
              Continuar con Google
            </button>

            {/* Separador "o" */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"/>
              <span className="text-xs text-gray-400 uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"/>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Usuario o Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Tu usuario o email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                             text-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tu contraseña"
                    required
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-600
                               bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                               text-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                                text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-primary hover:bg-red-600 disabled:opacity-60
                           text-white font-semibold py-3 rounded-full transition-colors
                           duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FiLogIn /> Ingresar</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Registrate
              </Link>
            </p>

            <p className="text-center mt-3">
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
