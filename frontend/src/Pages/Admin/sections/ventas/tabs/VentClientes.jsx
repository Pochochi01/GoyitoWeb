import React, { useState, useEffect, useCallback } from 'react'
import { FiMail, FiShoppingBag, FiPlus, FiEdit2 } from 'react-icons/fi'
import StatusBadge     from '../../../../../Components/Admin/StatusBadge.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import customerService from '../../../../../api/services/customerService'
import AdminModal, { ModalActions, apiErrorMessage } from '../../../../../Components/Admin/AdminModal.jsx'
import Toast, { useToast } from '../../../../../Components/Shared/Toast.jsx'

const SEGMENTOS = ['Todos','VIP','Premium','Regular','Nuevo']

const segmentoBg = {
  VIP:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Regular: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Nuevo:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const inputCls = 'w-full px-3 min-h-[44px] py-2 text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function HistorialModal({ cliente, onClose }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    customerService.getOrders(cliente.id)
      .then(setOrders)
      .catch(e => setError(apiErrorMessage(e, 'No se pudo cargar el historial')))
      .finally(() => setLoading(false))
  }, [cliente.id])

  return (
    <AdminModal title={cliente.nombre} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-primary tabular-nums">{cliente.total_compras ?? '—'}</p>
          <p className="text-xs text-gray-400">Compras totales</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-600 tabular-nums">${Number(cliente.total_gastado ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Total gastado</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Historial reciente</p>
        {loading ? (
          <div className="flex justify-center py-6"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {orders.map(o => (
              <div key={o.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                <div>
                  <p className="font-mono text-xs font-bold text-gray-500">#{o.id}</p>
                  <p className="text-xs text-gray-400">{o.fecha} · {o.canal}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white tabular-nums">${Number(o.total).toLocaleString()}</p>
                  <StatusBadge status={o.estado}/>
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

function ClienteModal({ cliente, onClose, onSaved }) {
  const editing = Boolean(cliente?.id)
  const [form, setForm] = useState({
    nombre:   cliente?.nombre   ?? '',
    email:    cliente?.email    ?? '',
    segmento: cliente?.segmento ?? 'Nuevo',
    telefono: cliente?.telefono ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => { setError(''); setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim()) { setError('Nombre y email son obligatorios'); return }
    if (!EMAIL_RE.test(form.email.trim())) { setError('El email no es válido'); return }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, nombre: form.nombre.trim(), email: form.email.trim(), telefono: form.telefono.trim() }
      editing ? await customerService.update(cliente.id, payload) : await customerService.create(payload)
      onSaved(); onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Error al guardar'))
    } finally { setLoading(false) }
  }

  const lbl = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'
  return (
    <AdminModal
      title={editing ? 'Editar cliente' : 'Nuevo cliente'}
      onClose={onClose} onSubmit={handleSubmit} busy={loading} error={error} maxWidth="sm:max-w-md"
      footer={<ModalActions onCancel={onClose} busy={loading} submitLabel={editing ? 'Guardar' : 'Crear'}/>}
    >
      <div>
        <label className={lbl}>Nombre *</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Nombre completo" autoComplete="name"/>
      </div>
      <div>
        <label className={lbl}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} autoComplete="email"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Segmento</label>
          <select name="segmento" value={form.segmento} onChange={handleChange} className={inputCls}>
            {['Nuevo','Regular','Premium','VIP'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Teléfono</label>
          <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} className={inputCls} autoComplete="tel"/>
        </div>
      </div>
    </AdminModal>
  )
}

export default function VentClientes() {
  const [clientes,  setClientes]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [segmento,  setSegmento]  = useState('Todos')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [modal,     setModal]     = useState(null)
  const [historial, setHistorial] = useState(null)
  const [loadError, setLoadError] = useState('')
  const { toast, showToast } = useToast()

  /** load recibe sd/ed directamente para evitar stale closure con state async */
  const load = useCallback(async (sd = startDate, ed = endDate, { silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const params = {}
      if (segmento !== 'Todos') params.segmento  = segmento
      if (sd)                   params.startDate = sd
      if (ed)                   params.endDate   = ed
      setClientes(await customerService.getAll(params))
      setLoadError('')
    } catch (e) {
      const msg = apiErrorMessage(e, 'No se pudieron cargar los clientes')
      if (silent) showToast(msg, 'error'); else setLoadError(msg)
    }
    finally { setLoading(false) }
  }, [segmento, startDate, endDate, showToast])

  useEffect(() => { load() }, [segmento]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toast toast={toast}/>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SEGMENTOS.map(s => (
              <button key={s} onClick={() => setSegmento(s)} aria-pressed={segmento===s}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
                  ${segmento===s?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setModal('create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 min-h-[44px] bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.97]">
            <FiPlus size={14}/> Nuevo cliente
          </button>
          </div>
          {/* Filtro por última compra */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
            <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">Filtrar por última compra</p>
            <DateRangeFilter
              startDate={startDate} endDate={endDate}
              onStartDate={setStartDate} onEndDate={setEndDate}
              onApply={(s, e) => load(s, e)}
            />
          </div>
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
            {clientes.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{c.nombre}</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-500 min-w-0"><FiMail size={11} className="flex-shrink-0"/><span className="truncate">{c.email}</span></div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${segmentoBg[c.segmento]}`}>{c.segmento}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-primary">{c.total_compras ?? '—'}</p>
                    <p className="text-[10px] text-gray-400">Compras</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-green-600">${Number(c.total_gastado||0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-blue-600">${Math.round(c.ticket_promedio||0)}</p>
                    <p className="text-[10px] text-gray-400">Ticket</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Última compra: {c.ultima_compra || '—'}</p>
                <div className="flex gap-2">
                  <button onClick={() => setHistorial(c)}
                    className="flex-1 min-h-[40px] rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <FiShoppingBag size={12}/> Historial
                  </button>
                  <button onClick={() => setModal(c)} aria-label={`Editar ${c.nombre}`} className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-blue-500 hover:border-blue-400 transition-all"><FiEdit2 size={14}/></button>
                </div>
              </div>
            ))}
            {!loading && clientes.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">Sin clientes registrados</p>}
          </div>
        )}
      </div>

      {modal && (
        <ClienteModal
          cliente={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { showToast(modal === 'create' ? 'Cliente creado' : 'Cliente actualizado'); load(undefined, undefined, { silent: true }) }}
        />
      )}
      {historial && <HistorialModal cliente={historial} onClose={() => setHistorial(null)}/>}
    </>
  )
}
