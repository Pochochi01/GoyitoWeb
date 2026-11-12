import React, { useState, useEffect, useCallback } from 'react'
import { FiStar, FiPhone, FiMail, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import supplierService from '../../../../../api/services/supplierService'
import purchaseOrderService from '../../../../../api/services/purchaseOrderService'
import StatusBadge from '../../../../../Components/Admin/StatusBadge.jsx'
import AdminModal, { ModalActions, apiErrorMessage } from '../../../../../Components/Admin/AdminModal.jsx'
import Toast, { useToast } from '../../../../../Components/Shared/Toast.jsx'

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} size={12} className={i<=Math.round(rating)?'text-yellow-400 fill-yellow-400':'text-gray-300'}/>
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating}</span>
  </div>
)

const inputCls = 'w-full px-3 min-h-[44px] py-2 text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function HistorialModal({ supplier, onClose }) {
  const [historial, setHistorial] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    purchaseOrderService.getAll({ proveedor_id: supplier.id })
      .then(setHistorial)
      .catch(e => setError(apiErrorMessage(e, 'No se pudo cargar el historial')))
      .finally(() => setLoading(false))
  }, [supplier.id])

  return (
    <AdminModal title={supplier.nombre} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-gray-400">CUIT</p><p className="font-mono font-semibold dark:text-white">{supplier.cuit}</p></div>
        <div><p className="text-xs text-gray-400">Condición de pago</p><p className="font-semibold dark:text-white">{supplier.cond_pago||'—'}</p></div>
        <div><p className="text-xs text-gray-400">Contacto</p><p className="font-semibold dark:text-white">{supplier.contacto||'—'}</p></div>
        <div><p className="text-xs text-gray-400">Puntaje</p><Stars rating={supplier.puntaje}/></div>
        <div className="flex items-center gap-1.5 text-xs text-blue-500 min-w-0 break-all"><FiMail size={12} className="flex-shrink-0"/>{supplier.email||'—'}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><FiPhone size={12}/>{supplier.tel||'—'}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Historial de órdenes</p>
        {loading ? (
          <div className="flex justify-center py-6"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        ) : historial.length > 0 ? (
          <div className="flex flex-col gap-2">
            {historial.map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                <div>
                  <p className="font-mono text-xs font-bold text-gray-500">#{c.id}</p>
                  <p className="text-xs text-gray-400">{c.fecha}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white tabular-nums">${Number(c.total).toLocaleString()}</p>
                  <StatusBadge status={c.estado}/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Sin órdenes registradas</p>
        )}
      </div>
    </AdminModal>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SupplierModal({ supplier, onClose, onSaved }) {
  const editing = Boolean(supplier?.id)
  const [form, setForm] = useState({
    nombre:    supplier?.nombre    ?? '',
    cuit:      supplier?.cuit      ?? '',
    contacto:  supplier?.contacto  ?? '',
    email:     supplier?.email     ?? '',
    tel:       supplier?.tel       ?? '',
    cond_pago: supplier?.cond_pago ?? '',
    puntaje:   supplier?.puntaje   ?? 5,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => { setError(''); setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.cuit.trim()) { setError('Nombre y CUIT son obligatorios'); return }
    if (form.email && !EMAIL_RE.test(form.email.trim())) { setError('El email no es válido'); return }
    const puntaje = Number(form.puntaje)
    if (!Number.isFinite(puntaje) || puntaje < 1 || puntaje > 5) { setError('El puntaje debe estar entre 1 y 5'); return }
    setLoading(true)
    setError('')
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
      payload.puntaje = puntaje
      editing ? await supplierService.update(supplier.id, payload) : await supplierService.create(payload)
      onSaved(); onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Error al guardar'))
    } finally { setLoading(false) }
  }

  const lbl = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'
  return (
    <AdminModal
      title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
      onClose={onClose} onSubmit={handleSubmit} busy={loading} error={error} maxWidth="sm:max-w-md"
      footer={<ModalActions onCancel={onClose} busy={loading} submitLabel={editing ? 'Guardar' : 'Crear'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={lbl}>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Razón social" autoComplete="organization"/>
        </div>
        <div>
          <label className={lbl}>CUIT *</label>
          <input name="cuit" value={form.cuit} onChange={handleChange} className={inputCls} placeholder="20-12345678-9" inputMode="numeric"/>
        </div>
        <div>
          <label className={lbl}>Condición de pago</label>
          <input name="cond_pago" value={form.cond_pago} onChange={handleChange} className={inputCls} placeholder="30 días"/>
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} autoComplete="email"/>
        </div>
        <div>
          <label className={lbl}>Teléfono</label>
          <input name="tel" type="tel" value={form.tel} onChange={handleChange} className={inputCls} autoComplete="tel"/>
        </div>
        <div>
          <label className={lbl}>Contacto</label>
          <input name="contacto" value={form.contacto} onChange={handleChange} className={inputCls}/>
        </div>
        <div>
          <label className={lbl}>Puntaje (1-5)</label>
          <input name="puntaje" type="number" inputMode="decimal" min="1" max="5" step="0.1" value={form.puntaje} onChange={handleChange} className={inputCls}/>
        </div>
      </div>
    </AdminModal>
  )
}

export default function CompProveedores() {
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [historial, setHistorial] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [busyId,    setBusyId]    = useState(null)
  const { toast, showToast } = useToast()

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try { setSuppliers(await supplierService.getAll()); setLoadError('') }
    catch (e) {
      const msg = apiErrorMessage(e, 'No se pudieron cargar los proveedores')
      if (silent) showToast(msg, 'error'); else setLoadError(msg)
    }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const handleDelete = async (s) => {
    if (busyId) return
    if (!window.confirm(`¿Eliminar "${s.nombre}"?`)) return
    setBusyId(s.id)
    try {
      await supplierService.remove(s.id)
      setSuppliers(prev => prev.filter(x => x.id !== s.id))
      showToast('Proveedor eliminado')
      load({ silent: true })
    }
    catch (e) { showToast(apiErrorMessage(e, 'Error al eliminar'), 'error') }
    finally { setBusyId(null) }
  }

  return (
    <>
      <Toast toast={toast}/>

      <div className="flex flex-col gap-5">
        <div className="flex justify-end">
          <button onClick={() => setModal('create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 min-h-[44px] bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.97]">
            <FiPlus size={14}/> Nuevo proveedor
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : loadError ? (
          <div className="text-center py-14 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
            <button onClick={() => load()} className="px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold">Reintentar</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{s.nombre}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{s.cuit}</p>
                  </div>
                  <Stars rating={s.puntaje}/>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {s.email && <div className="flex items-center gap-1.5 min-w-0"><FiMail size={11} className="flex-shrink-0"/><span className="truncate">{s.email}</span></div>}
                  {s.tel   && <div className="flex items-center gap-1.5"><FiPhone size={11}/>{s.tel}</div>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-blue-600">{s.cond_pago||'—'}</p>
                    <p className="text-[10px] text-gray-400">Pago</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate">{s.contacto||'—'}</p>
                    <p className="text-[10px] text-gray-400">Contacto</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setHistorial(s)} className="flex-1 min-h-[40px] rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-all">Ver historial</button>
                  <button onClick={() => setModal(s)} disabled={busyId !== null} aria-label={`Editar ${s.nombre}`} className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-blue-500 hover:border-blue-400 transition-colors disabled:opacity-40"><FiEdit2 size={14}/></button>
                  <button onClick={() => handleDelete(s)} disabled={busyId !== null} aria-label={`Eliminar ${s.nombre}`} className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-red-400 hover:border-red-400 transition-colors disabled:opacity-40">
                    {busyId === s.id ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"/> : <FiTrash2 size={14}/>}
                  </button>
                </div>
              </div>
            ))}
            {!loading && suppliers.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">Sin proveedores registrados</p>}
          </div>
        )}
      </div>

      {modal && (
        <SupplierModal
          supplier={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { showToast(modal === 'create' ? 'Proveedor creado' : 'Proveedor actualizado'); load({ silent: true }) }}
        />
      )}
      {historial && <HistorialModal supplier={historial} onClose={() => setHistorial(null)}/>}
    </>
  )
}
