import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUserPlus, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'

const Register = () => {
  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
  })
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '', general: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())          errs.name            = 'El nombre es obligatorio'
    if (!form.email.trim())         errs.email           = 'El email es obligatorio'
    if (form.password.length < 6)   errs.password        = 'Mínimo 6 caracteres'
    if (form.password !== form.confirmPassword)
                                    errs.confirmPassword = 'Las contraseñas no coinciden'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // El rol siempre es 'buyer' (comprador) — los demás roles los asigna el administrador
    const result = await register({ ...form, role: 'buyer' })
    setLoading(false)

    if (result.success) {
      navigate('/')
    } else {
      setErrors({ general: result.error })
    }
  }

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200
     bg-white dark:bg-gray-700 text-gray-800 dark:text-white
     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
     ${errors[field] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 bg-white dark:bg-gray-800 shadow-sm">
        <Link to="/" className="text-primary font-bold tracking-widest text-xl uppercase">
          ZolImportados
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md px-8 py-10">

            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <FiUserPlus className="text-primary text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Crear cuenta</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Registrate para comprar en nuestra tienda
              </p>
            </div>

            {/* Error general */}
            {errors.general && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                              text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-2.5">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nombre completo
                </label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Tu nombre completo" className={inputCls('name')}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="tu@email.com" className={inputCls('email')}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <FiPhone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+54 11 xxxx-xxxx" className={inputCls('phone')}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Contraseña + Confirmar — stack en mobile, lado a lado en sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={form.password} onChange={handleChange}
                      placeholder="Mín. 6 caracteres"
                      className={`${inputCls('password')} pr-10`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmar
                  </label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                      placeholder="Repetí tu clave"
                      className={`${inputCls('confirmPassword')} pr-10`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Indicador de rol asignado */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-base">🛍️</span>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Cuenta de comprador</p>
                  <p className="text-xs">Para acceder como vendedor o administrador, contactá con el equipo.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full bg-primary hover:bg-red-600 disabled:opacity-60
                           text-white font-semibold py-3 rounded-full transition-colors
                           duration-200 flex items-center justify-center gap-2"
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <><FiUserPlus size={16}/> Crear cuenta</>
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Ingresá
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

export default Register
