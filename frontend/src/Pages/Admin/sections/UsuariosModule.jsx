import React, { useState, useEffect, useCallback } from 'react'
import {
  FiSearch, FiRefreshCw, FiUser, FiToggleLeft, FiToggleRight,
  FiChevronLeft, FiChevronRight, FiShield, FiCheck,
} from 'react-icons/fi'
import userService from '../../../api/services/userService'
import { useAuth } from '../../../context/AuthContext.jsx'

// ─── Configuración de roles ───────────────────────────────────
const ROLES = [
  { value: 'comprador',      label: 'Comprador',      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'pos',            label: 'POS',            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'admin_complejo', label: 'Admin Complejo', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'admin',          label: 'Admin General',  color: 'bg-primary/10 text-primary' },
]

const rolConfig = Object.fromEntries(ROLES.map(r => [r.value, r]))

// ─── Badge de rol ─────────────────────────────────────────────
function RolBadge({ rol }) {
  const cfg = rolConfig[rol] || { label: rol, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <FiShield size={10}/>
      {cfg.label}
    </span>
  )
}

// ─── Selector de rol inline ───────────────────────────────────
function RolSelector({ userId, currentRol, onSaved, disabled }) {
  const [rol,     setRol]     = useState(currentRol)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const changed = rol !== currentRol

  const handleSave = async () => {
    if (!changed) return
    setSaving(true)
    try {
      await userService.updateRol(userId, rol)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved(userId, rol)
    } catch { setRol(currentRol) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={rol}
        onChange={e => setRol(e.target.value)}
        disabled={disabled || saving}
        className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all
          ${changed
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/10'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}
          text-gray-800 dark:text-white focus:outline-none disabled:opacity-50`}
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Botón guardar — solo visible cuando hay cambio */}
      {changed && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                     bg-primary text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {saving
            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <FiCheck size={11}/>}
          {saving ? '' : 'Guardar'}
        </button>
      )}

      {saved && !changed && (
        <span className="text-[10px] text-green-500 font-semibold animate-pulse">✓ Guardado</span>
      )}
    </div>
  )
}

// ─── Fila de usuario ──────────────────────────────────────────
function UserRow({ user, currentUserId, onRolSaved, onToggleActivo }) {
  const [toggling, setToggling] = useState(false)
  const isSelf = user.id === currentUserId

  const handleToggle = async () => {
    if (isSelf) return
    setToggling(true)
    try { await onToggleActivo(user.id) }
    finally { setToggling(false) }
  }

  const initial = (user.nombre || user.username || '?').charAt(0).toUpperCase()
  const colors  = ['bg-primary/20 text-primary','bg-blue-100 text-blue-600','bg-green-100 text-green-600','bg-purple-100 text-purple-600','bg-yellow-100 text-yellow-600']
  const avatarColor = colors[user.id % colors.length]

  return (
    <tr className={`border-b border-gray-50 dark:border-gray-700 transition-colors
      ${!user.activo ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>

      {/* Avatar + Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
              {user.nombre || '—'}
              {isSelf && <span className="ml-1.5 text-[10px] text-primary font-semibold">(vos)</span>}
            </p>
            <p className="text-xs text-gray-400 font-mono truncate">@{user.username}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-gray-500 dark:text-gray-400">{user.email || '—'}</span>
      </td>

      {/* Rol actual */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <RolBadge rol={user.rol}/>
      </td>

      {/* Selector de rol */}
      <td className="px-4 py-3">
        <RolSelector
          userId={user.id}
          currentRol={user.rol}
          onSaved={onRolSaved}
          disabled={isSelf}
        />
      </td>

      {/* Estado activo */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleToggle}
          disabled={toggling || isSelf}
          title={isSelf ? 'No podés inhabilitarte a vos mismo' : user.activo ? 'Inhabilitar usuario' : 'Habilitar usuario'}
          className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            ${user.activo ? 'text-green-500 hover:text-red-400' : 'text-gray-300 hover:text-green-500'}`}
        >
          {toggling
            ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block"/>
            : user.activo
              ? <FiToggleRight size={22}/>
              : <FiToggleLeft  size={22}/>
          }
        </button>
      </td>

      {/* Fecha */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-gray-400">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('es-AR') : '—'}
        </span>
      </td>
    </tr>
  )
}

// ─── Módulo principal ─────────────────────────────────────────
export default function UsuariosModule() {
  const { user: adminUser } = useAuth()

  const [users,     setUsers]     = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [rolFilter, setRolFilter] = useState('')
  const [page,      setPage]      = useState(1)
  const [toast,     setToast]     = useState({ msg: '', type: 'ok' })

  const LIMIT = 15

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3000)
  }

  const load = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const params = { page: p, limit: LIMIT }
      if (search.trim()) params.search = search.trim()
      if (rolFilter)     params.rol    = rolFilter
      const res = await userService.getUsers(params)
      setUsers(res.data)
      setTotal(res.total)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [page, search, rolFilter])

  useEffect(() => { load(1); setPage(1) }, [rolFilter])
  useEffect(() => { load() }, [page])

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => { load(1); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const handleRolSaved = (userId, newRol) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, rol: newRol } : u))
    showToast(`Rol actualizado a "${rolConfig[newRol]?.label || newRol}"`)
  }

  const handleToggleActivo = async (userId) => {
    try {
      const res = await userService.toggleActivo(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: res.activo } : u))
      showToast(res.activo ? 'Usuario habilitado' : 'Usuario inhabilitado', res.activo ? 'ok' : 'warn')
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al cambiar estado', 'error')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'warn' ? 'bg-orange-500' : 'bg-gray-900'}`}>
          {toast.msg}
        </div>
      )}

      {/* Barra de filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, usuario o email…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Filtro por rol */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRolFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${rolFilter === '' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
          >
            Todos
          </button>
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRolFilter(r.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${rolFilter === r.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => load()}
          className="p-2 text-gray-400 hover:text-primary transition-colors flex-shrink-0"
          title="Recargar"
        >
          <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {total} usuario{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">
          Página {page} de {totalPages || 1}
        </p>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/40">
                <tr>
                  {['Usuario','Email','Rol actual','Cambiar rol','Activo','Registro'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide
                      ${h === 'Email' ? 'hidden md:table-cell' : ''}
                      ${h === 'Rol actual' ? 'hidden sm:table-cell' : ''}
                      ${h === 'Registro' ? 'hidden lg:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    currentUserId={adminUser?.id ? +adminUser.id : null}
                    onRolSaved={handleRolSaved}
                    onToggleActivo={handleToggleActivo}
                  />
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <FiUser size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            <FiChevronLeft size={13}/> Anterior
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                    ${page === p ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Siguiente <FiChevronRight size={13}/>
          </button>
        </div>
      )}

      {/* Leyenda de roles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Descripción de roles
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { rol: 'comprador',      desc: 'Puede comprar en la tienda. Sin acceso al panel.' },
            { rol: 'pos',            desc: 'Acceso al punto de venta (POS). Sin acceso al panel admin.' },
            { rol: 'admin_complejo', desc: 'Panel admin completo excepto el módulo Diseño.' },
            { rol: 'admin',          desc: 'Acceso total incluido Diseño y gestión de usuarios.' },
          ].map(item => (
            <div key={item.rol} className="flex flex-col gap-1.5">
              <RolBadge rol={item.rol}/>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
