import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiLayout, FiPackage, FiShoppingBag, FiLogOut,
  FiMenu, FiX, FiHome, FiChevronRight,
  FiTrendingUp, FiShoppingCart, FiMonitor, FiUsers, FiStar, FiTag,
} from 'react-icons/fi'
import { useAuth }       from '../../context/AuthContext.jsx'
import DarkMode          from '../../Components/NavBar/DarkMode.jsx'
import Diseno            from './sections/Diseno.jsx'
import ProductosModule   from './sections/productos/ProductosModule.jsx'
import CategoriasModule  from './sections/categorias/CategoriasModule.jsx'
import ComprasModule     from './sections/compras/ComprasModule.jsx'
import VentasModule      from './sections/ventas/VentasModule.jsx'
import UsuariosModule        from './sections/UsuariosModule.jsx'
import CalificacionesModule from './sections/CalificacionesModule.jsx'

/**
 * ALL_NAV_ITEMS — ítems del sidebar con control por rol.
 * roles: array de roles que pueden ver ese ítem.
 *   - 'admin'          → admin general (acceso total)
 *   - 'admin_complejo' → admin de complejo (sin Diseño ni Usuarios)
 */
const ALL_NAV_ITEMS = [
  { id: 'ventas',    label: 'Ventas',    icon: <FiTrendingUp  size={18}/>, roles: ['admin', 'admin_complejo'] },
  { id: 'productos', label: 'Productos', icon: <FiPackage     size={18}/>, roles: ['admin', 'admin_complejo'] },
  { id: 'categorias', label: 'Categorías', icon: <FiTag       size={18}/>, roles: ['admin', 'admin_complejo'] },
  { id: 'compras',   label: 'Compras',   icon: <FiShoppingCart size={18}/>, roles: ['admin', 'admin_complejo'] },
  { id: 'calificaciones', label: 'Calificaciones', icon: <FiStar size={18}/>, roles: ['admin', 'admin_complejo'] },
  { id: 'usuarios',  label: 'Usuarios',  icon: <FiUsers       size={18}/>, roles: ['admin'] },
  { id: 'diseno',    label: 'Diseño',    icon: <FiLayout      size={18}/>, roles: ['admin'] },
]

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('ventas')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }
  const handleNav    = (id) => { setActiveSection(id); setSidebarOpen(false) }

  // Solo muestra los ítems permitidos para el rol del usuario
  const NAV_ITEMS = ALL_NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const activeLabel = NAV_ITEMS.find(n => n.id === activeSection)?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

      {/* ── Sidebar ── */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}/>
        )}

        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
                           bg-gray-900 dark:bg-gray-950 text-white
                           transform transition-transform duration-300
                           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

          {/* Brand */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <Link to="/" className="text-primary font-bold tracking-widest text-lg uppercase leading-tight">
              Goyito's<br/>
              <span className="text-white text-xs font-normal tracking-normal normal-case">Panel Admin</span>
            </Link>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <FiX size={20}/>
            </button>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full capitalize">
                  {user?.role === 'admin_complejo' ? 'Admin Complejo' : user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 px-3 mb-2">Menú</p>
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                transition-all duration-150
                                ${activeSection === item.id
                                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                                  : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {item.icon}
                    {item.label}
                    {activeSection === item.id && <FiChevronRight className="ml-auto" size={14}/>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer links */}
          <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
            <Link to="/pos"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <FiMonitor size={16}/> Ir al POS
            </Link>
            <Link to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <FiHome size={16}/> Ver sitio
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
              <FiLogOut size={16}/> Cerrar sesión
            </button>
          </div>
        </aside>
      </>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-gray-800
                           border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <button className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-primary"
            onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22}/>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">{activeLabel}</h1>
            <p className="text-xs text-gray-400">Dashboard · {activeLabel}</p>
          </div>
          <DarkMode />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {activeSection === 'ventas'    && <VentasModule />}
          {activeSection === 'productos' && <ProductosModule />}
          {activeSection === 'categorias'&& <CategoriasModule />}
          {activeSection === 'compras'   && <ComprasModule />}
          {activeSection === 'calificaciones' && <CalificacionesModule />}
          {activeSection === 'usuarios'  && <UsuariosModule />}
          {activeSection === 'diseno'    && <Diseno />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
