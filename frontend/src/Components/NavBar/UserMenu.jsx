import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { FiLogIn, FiUserPlus, FiLogOut, FiSettings, FiUser, FiPackage } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

const UserMenu = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { user, logout, isAnyAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); setOpen(false); navigate('/') }

  const rolLabel = {
    admin:          'Admin General',
    admin_complejo: 'Admin Complejo',
    pos:            'Operador POS',
    comprador:      'Comprador',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 p-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        aria-label="Cuenta"
      >
        <FaUserCircle className="text-2xl" />
        {user && <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">{user.name}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-[9999] overflow-hidden">
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400">Sesión iniciada como</p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{user.name}</p>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  {rolLabel[user.role] || user.role}
                </span>
              </div>

              <Link to="/mi-cuenta" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiUser size={14}/> Mi cuenta
              </Link>

              <Link to="/mi-cuenta" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiPackage size={14}/> Mis pedidos
              </Link>

              {isAnyAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                  <FiSettings size={14}/> Panel Admin
                </Link>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700"/>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FiLogOut size={14}/> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiLogIn size={14}/> Iniciar sesión
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-700"/>
              <Link to="/register" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiUserPlus size={14}/> Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default UserMenu
