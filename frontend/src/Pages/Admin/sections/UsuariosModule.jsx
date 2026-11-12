import React, { useState, useEffect, useCallback } from 'react'
import {
  FiSearch, FiRefreshCw, FiUser, FiToggleLeft, FiToggleRight,
  FiChevronLeft, FiChevronRight, FiShield, FiCheck,
} from 'react-icons/fi'
import userService from '../../../api/services/userService'
import { useAuth } from '../../../context/AuthContext.jsx'
import Toast, { useToast } from '../../../Components/Shared/Toast.jsx'
import { apiErrorMessage } from '../../../Components/Admin/AdminModal.jsx'

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
function RolSelector({ userId, currentRol, onSaved, onError, disabled }) {
  const [rol,     setRol]     = useState(currentRol)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const changed = rol !== currentRol

  const handleSave = async () => {
    if (!changed || saving) return
    setSaving(true)
    try {
      await userService.updateRol(userId, rol)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved(userId, rol)
    } catch (e) {
      setRol(currentRol)
      onError?.(apiErrorMessage(e, 'No se pudo cambiar el rol'))
    }
    finally { setSaving(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={rol}
        onChange={e => setRol(e.target.value)}
        disabled={disabled || saving}
        aria-label="Cambiar rol"
        className={`px-2.5 min-h-[36px] text-base sm:text-xs rounded-lg border transition-colors
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
          className="flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg text-xs font-semibold
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
function UserRow({ user, currentUserId, onRolSaved, onRolError, onToggleActivo }) {
  const [toggling, setToggling] = useState(false)
  const isSelf = user.id === currentUserId

  const handleToggle = async () => {
    if (isSelf || toggling) return
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
          onError={onRolError}
          disabled={isSelf}
        />
      </td>

      {/* Estado activo */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleToggle}
          disabled={toggling || isSelf}
          title={isSelf ? 'No podés inhabilitarte a vos mismo' : user.activo ? 'Inhabilitar usuario' : 'Habilitar usuario'}
          aria-label={user.activo ? `Inhabilitar a ${user.username}` : `Habilitar a ${user.username}`}
          className={`w-11 h-11 inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed
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
  const [debounced, setDebounced] = useState('')
  const [loadError, setLoadError] = useState('')
  const { toast, showToast } = useToast()
  const reqId = React.useRef(0)

  const LIMIT = 15

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  // Volver a la página 1 cuando cambian los filtros
  useEffect(() => { setPage(1) }, [debounced, rolFilter])

  const load = useCallback(async () => {
    const id = ++reqId.current
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (debounced) params.search = debounced
      if (rolFilter) params.rol    = rolFilter
      const res = await userService.getUsers(params)
      if (id !== reqId.current) return          // respuesta vieja → descartar
      setUsers(res.data)
      setTotal(res.total)
      setLoadError('')
    } catch (e) {
      if (id === reqId.current) setLoadError(apiErrorMessage(e, 'No se pudieron cargar los usuarios'))
    }
    finally { if (id === reqId.current) setLoading(false) }
  }, [page, debounced, rolFilter])

  useEffect(() => { load() }, [load])

  const handleRolSaved = (userId, newRol) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, rol: newRol } : u))
    showToast(`Rol actualizado a "${rolConfig[newRol]?.label || newRol}"`)
  }

  const handleToggleActivo = async (userId) => {
    try {
      const res = await userService.toggleActivo(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: res.activo } : u))
      showToast(res.activo ? 'Usuario habilitado' : 'Usuario inhabilitado')
    } catch (e) {
      showToast(apiErrorMessage(e, 'Error al cambiar estado'), 'error')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="flex flex-col gap-5">
      <Toast toast={toast}/>

      {/* Barra de filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, usuario o email…"
            aria-label="Buscar usuario"
            className="w-full pl-9 pr-4 min-h-[44px] text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Filtro por rol */}
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setRolFilter('')}
            aria-pressed={rolFilter === ''}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
              ${rolFilter === '' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
          >
            Todos
          </button>
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRolFilter(r.value)}
              aria-pressed={rolFilter === r.value}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
                ${rolFilter === r.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => load()}
          className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-full text-gray-400 hover:text-primary transition-colors flex-shrink-0"
          title="Recargar" aria-label="Recargar"
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
        {loading && users.length === 0 ? (
          <div className="flex justify-center py-16">
            <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
          </div>
        ) : loadError ? (
          <div className="text-center py-14 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
            <button onClick={() => load()} className="px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold">Reintentar</button>
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
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
                    onRolError={(msg) => showToast(msg, 'error')}
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
            aria-label="Página anterior"
            className="flex items-center gap-1 px-3 min-h-[40px] rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            <FiChevronLeft size={13}/> <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4))
              const p = start + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg text-xs font-semibold transition-colors
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
            aria-label="Página siguiente"
            className="flex items-center gap-1 px-3 min-h-[40px] rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            <span className="hidden sm:inline">Siguiente</span> <FiChevronRight size={13}/>
          </button>
        </div>
      )}

      {/* Leyenda de roles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Descripción de roles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
