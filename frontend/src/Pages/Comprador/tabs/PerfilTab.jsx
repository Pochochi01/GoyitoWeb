import React, { useState, useEffect, useCallback } from 'react'
import { FiUser, FiMail, FiPhone, FiEdit2, FiCheck, FiX,
         FiMapPin, FiPlus, FiTrash2, FiStar, FiHome, FiBriefcase } from 'react-icons/fi'
import api from '../../../api/axios'
import addressService from '../../../api/services/addressService'

// ─── Input con icono ──────────────────────────────────────────
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>}
      {children}
    </div>
  </div>
)

const inputCls = (withIcon = true) =>
  `w-full ${withIcon ? 'pl-9' : 'px-3'} pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all`

// ─── Alias icon ───────────────────────────────────────────────
const AliasIcon = ({ alias }) => {
  if (alias?.toLowerCase().includes('trabajo')) return <FiBriefcase size={14}/>
  return <FiHome size={14}/>
}

// ─── Modal de dirección ───────────────────────────────────────
function AddressModal({ address, onClose, onSaved }) {
  const editing = Boolean(address?.id)
  const [form, setForm] = useState({
    alias:         address?.alias          || 'Casa',
    calle:         address?.calle         || '',
    numero:        address?.numero        || '',
    piso:          address?.piso          || '',
    ciudad:        address?.ciudad        || '',
    provincia:     address?.provincia     || '',
    codigo_postal: address?.codigo_postal || '',
    es_principal:  address?.es_principal  || false,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => setForm(p => ({
    ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.calle || !form.ciudad) { setError('Calle y ciudad son obligatorias'); return }
    setLoading(true)
    try {
      editing ? await addressService.update(address.id, form) : await addressService.create(form)
      onSaved()
      onClose()
    } catch (err) { setError(err.response?.data?.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">{editing ? 'Editar dirección' : 'Nueva dirección'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Alias</label>
            <input name="alias" value={form.alias} onChange={handleChange} placeholder="Casa / Trabajo / Otro"
              className={inputCls(false)}/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Calle *</label>
              <input name="calle" value={form.calle} onChange={handleChange} placeholder="Av. Corrientes" className={inputCls(false)}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Número</label>
              <input name="numero" value={form.numero} onChange={handleChange} placeholder="1234" className={inputCls(false)}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Piso / Depto</label>
            <input name="piso" value={form.piso} onChange={handleChange} placeholder="3° B (opcional)" className={inputCls(false)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Ciudad *</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Buenos Aires" className={inputCls(false)}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Provincia</label>
              <input name="provincia" value={form.provincia} onChange={handleChange} placeholder="CABA" className={inputCls(false)}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Código postal</label>
            <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} placeholder="1000" className={inputCls(false)}/>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="es_principal" checked={form.es_principal} onChange={handleChange}
              className="w-4 h-4 accent-primary rounded"/>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Usar como dirección principal</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : editing ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tab de perfil ────────────────────────────────────────────
export default function PerfilTab() {
  const [profile,   setProfile]   = useState(null)
  const [addresses, setAddresses] = useState([])
  const [editing,   setEditing]   = useState(false)
  const [form,      setForm]      = useState({ nombre: '', email: '', telefono: '' })
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [addrModal, setAddrModal] = useState(null) // null | 'new' | address

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/customers/me')
      setProfile(data)
      setForm({ nombre: data.nombre || '', email: data.email || data.user_email || '', telefono: data.telefono || '' })
    } catch { /* silencioso */ }
  }, [])

  const loadAddresses = useCallback(async () => {
    try { setAddresses(await addressService.getAll()) } catch { /* silencioso */ }
  }, [])

  useEffect(() => { loadProfile(); loadAddresses() }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/customers/me', form)
      showToast('Perfil actualizado')
      setEditing(false)
      loadProfile()
    } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return
    try { await addressService.remove(id); showToast('Dirección eliminada'); loadAddresses() }
    catch (e) { showToast(e.response?.data?.message || 'Error') }
  }

  const handleSetPrincipal = async (id) => {
    try { await addressService.setPrincipal(id); loadAddresses() }
    catch { /* silencioso */ }
  }

  const segmentoBg = {
    VIP:     'bg-yellow-100 text-yellow-700', Premium: 'bg-purple-100 text-purple-700',
    Regular: 'bg-blue-100 text-blue-700',    Nuevo:   'bg-green-100 text-green-700',
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {toast && <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      {/* ── Datos personales ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 dark:text-white">Datos personales</h2>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <FiEdit2 size={13}/> Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <Field label="Nombre completo" icon={FiUser}>
              <input name="nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                className={inputCls()} placeholder="Tu nombre"/>
            </Field>
            <Field label="Email" icon={FiMail}>
              <input type="email" name="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={inputCls()} placeholder="tu@email.com"/>
            </Field>
            <Field label="Teléfono" icon={FiPhone}>
              <input name="telefono" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                className={inputCls()} placeholder="+54 11 xxxx-xxxx"/>
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiCheck size={14}/> Guardar</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            {[
              { label: 'Nombre', value: profile?.nombre, icon: FiUser },
              { label: 'Email',  value: profile?.email || profile?.user_email, icon: FiMail },
              { label: 'Teléfono', value: profile?.telefono || '—', icon: FiPhone },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <f.icon size={15} className="text-gray-400 flex-shrink-0"/>
                <div>
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{f.value || '—'}</p>
                </div>
              </div>
            ))}
            {profile?.segmento && (
              <div className="mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${segmentoBg[profile.segmento] || 'bg-gray-100 text-gray-600'}`}>
                  <FiStar size={9} className="inline mr-1"/>{profile.segmento}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Direcciones de envío ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">Direcciones de envío</h2>
            <p className="text-xs text-gray-400 mt-0.5">Máximo 3 direcciones</p>
          </div>
          {addresses.length < 3 && (
            <button onClick={() => setAddrModal('new')}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-red-600 text-white rounded-full text-xs font-semibold transition-colors">
              <FiPlus size={13}/> Agregar
            </button>
          )}
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiMapPin size={32} className="mx-auto mb-2 opacity-30"/>
            <p className="text-sm">No tenés direcciones guardadas</p>
            <button onClick={() => setAddrModal('new')}
              className="mt-3 text-primary text-xs font-semibold hover:underline">
              + Agregar dirección
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map(addr => (
              <div key={addr.id}
                className={`relative rounded-xl border-2 p-4 transition-all
                  ${addr.es_principal ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'}`}>

                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                      ${addr.es_principal ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                      <AliasIcon alias={addr.alias}/>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 dark:text-white">{addr.alias}</p>
                      {addr.es_principal && (
                        <span className="text-[10px] font-semibold text-primary">★ Principal</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!addr.es_principal && (
                      <button onClick={() => handleSetPrincipal(addr.id)}
                        className="text-[10px] text-gray-400 hover:text-primary font-semibold border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 transition-colors">
                        Hacer principal
                      </button>
                    )}
                    <button onClick={() => setAddrModal(addr)} className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors">
                      <FiEdit2 size={13}/>
                    </button>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 size={13}/>
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="mt-2 ml-10 text-sm text-gray-600 dark:text-gray-400">
                  <p>{addr.calle}{addr.numero ? ` ${addr.numero}` : ''}{addr.piso ? `, ${addr.piso}` : ''}</p>
                  <p>{addr.ciudad}{addr.provincia ? `, ${addr.provincia}` : ''}{addr.codigo_postal ? ` (${addr.codigo_postal})` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addrModal && (
        <AddressModal
          address={addrModal === 'new' ? null : addrModal}
          onClose={() => setAddrModal(null)}
          onSaved={() => { showToast(addrModal === 'new' ? 'Dirección agregada' : 'Dirección actualizada'); loadAddresses() }}
        />
      )}
    </div>
  )
}
