/**
 * AuthCallback — pantalla intermedia tras el OAuth con Google.
 *
 * El backend redirige acá con `?token=JWT_HERE`. Nuestra responsabilidad:
 *   1. Leer el token del query string.
 *   2. Persistirlo en AuthContext (que llama /auth/me para obtener el user).
 *   3. Limpiar el query (no queremos el token visible en el address bar).
 *   4. Redirigir al destino correcto según el rol.
 *
 * Si no hay token o falla la verificación, redirige a /login con un mensaje.
 */
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthCallback() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const { loginWithToken } = useAuth()
  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No se recibió el token de autenticación.')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    loginWithToken(token).then(result => {
      if (result.success) {
        setStatus('success')
        const role = result.user?.role
        const dest = (role === 'admin' || role === 'admin_complejo')
          ? '/admin'
          : role === 'pos' ? '/pos' : '/'
        // Replace para que el back del navegador no vuelva a esta URL con el token
        setTimeout(() => navigate(dest, { replace: true }), 500)
      } else {
        setStatus('error')
        setMessage(result.error || 'No pudimos completar el inicio de sesión.')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
      }
    })
  }, [params, navigate, loginWithToken])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md px-8 py-10 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Iniciando sesión…</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Esto toma solo un segundo.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <FiCheckCircle className="text-green-500" size={36}/>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">¡Bienvenido!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirigiendo…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <FiAlertCircle className="text-red-500" size={36}/>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">No se pudo iniciar sesión</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
            <p className="text-xs text-gray-400 mt-2">Volviendo al login…</p>
          </>
        )}
      </div>
    </div>
  )
}
