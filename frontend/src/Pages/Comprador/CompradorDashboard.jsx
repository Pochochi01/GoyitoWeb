import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiPackage, FiLogOut, FiHome, FiChevronRight } from 'react-icons/fi'
import { FaUserCircle } from 'react-icons/fa'
import NavBar    from '../../Components/NavBar/NavBar.jsx'
import DarkMode  from '../../Components/NavBar/DarkMode.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import PerfilTab  from './tabs/PerfilTab.jsx'
import PedidosTab from './tabs/PedidosTab.jsx'

const TABS = [
  { id: 'perfil',   label: 'Mi perfil',     icon: FiUser    },
  { id: 'pedidos',  label: 'Mis pedidos',   icon: FiPackage },
]

export default function CompradorDashboard() {
  const [activeTab, setActiveTab] = useState('perfil')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initial = (user?.name || user?.username || '?').charAt(0).toUpperCase()

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1">
        {/* Hero / encabezado */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-gray-800 dark:to-gray-900 py-8">
          <div className="container flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                {initial}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Hola, {user?.name?.split(' ')[0] || 'comprador'} 👋
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mi cuenta</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DarkMode/>
              <Link to="/"
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <FiHome size={14}/> Inicio
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors">
                <FiLogOut size={14}/> Salir
              </button>
            </div>
          </div>
        </section>

        {/* Tab nav */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="container">
            <div className="flex gap-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'}`}
                >
                  <tab.icon size={15}/>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="container py-8">
          {activeTab === 'perfil'  && <PerfilTab />}
          {activeTab === 'pedidos' && <PedidosTab />}
        </div>
      </main>
    </div>
  )
}
