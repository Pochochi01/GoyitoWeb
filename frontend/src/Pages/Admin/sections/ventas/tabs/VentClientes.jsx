import React, { useState, useEffect, useCallback } from 'react'
import { FiMail, FiX, FiShoppingBag, FiPlus, FiEdit2 } from 'react-icons/fi'
import StatusBadge     from '../../../../../Components/Admin/StatusBadge.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import customerService from '../../../../../api/services/customerService'

const SEGMENTOS = ['Todos','VIP','Premium','Regular','Nuevo']

const segmentoBg = {
  VIP:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Regular: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Nuevo:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function HistorialModal({ cliente, onClose }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerService.getOrders(cliente.id)
      .then(setOrders).catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [cliente.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">{cliente.nombre}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><FiX size={20}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">{cliente.total_compras ?? '—'}</p>
              <p className="text-xs text-gray-400">Compras totales</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-600">${Number(cliente.total_gastado||0).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total gastado</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Historial reciente</p>
            {loading ? (
              <div className="flex justify-center py-6"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
            ) : orders.length > 0 ? (
              <div className="flex flex-col gap-2">
                {orders.map(o => (
                  <div key={o.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-gray-500">#{o.id}</p>
                      <p className="text-xs text-gray-400">{o.fecha} · {o.canal}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">${Number(o.total).toLocaleString()}</p>
                      <StatusBadge status={o.estado}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Sin órdenes registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClienteModal({ cliente, onClose, onSaved }) {
  const editing = Boolean(cliente?.id)
  const [form, setForm] = useState({
    nombre:   cliente?.nombre   || '',
    email:    cliente?.email    || '',
    segmento: cliente?.segmento || 'Nuevo',
    telefono: cliente?.telefono || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.email) { setError('Nombre y email son obligatorios'); return }
    setLoading(true)
    try {
      editing ? await customerService.update(cliente.id, form) : await customerService.create(form)
      onSaved(); onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Nombre completo"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Segmento</label>
              <select name="segmento" value={form.segmento} onChange={handleChange} className={inputCls}>
                {['Nuevo','Regular','Premium','VIP'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className={inputCls}/>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [toast,     setToast]     = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  /** load recibe sd/ed directamente para evitar stale closure con state async */
  const load = useCallback(async (sd = startDate, ed = endDate) => {
    setLoading(true)
    try {
      const params = {}
      if (segmento !== 'Todos') params.segmento  = segmento
      if (sd)                   params.startDate = sd
      if (ed)                   params.endDate   = ed
      setClientes(await customerService.getAll(params))
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [segmento, startDate, endDate])

  useEffect(() => { load() }, [segmento])

  return (
    <>
      {toast && <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {SEGMENTOS.map(s => (
              <button key={s} onClick={() => setSegmento(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${segmento===s?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{c.nombre}</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-500"><FiMail size={11}/>{c.email}</div>
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
                    className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1">
                    <FiShoppingBag size={12}/> Historial
                  </button>
                  <button onClick={() => setModal(c)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 text-blue-500 hover:border-blue-400 transition-all"><FiEdit2 size={14}/></button>
                </div>
              </div>
            ))}
            {!loading && clientes.length === 0 && <p className="col-span-3 text-center text-gray-400 py-10">Sin clientes registrados</p>}
          </div>
        )}
      </div>

      {modal && (
        <ClienteModal
          cliente={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { showToast(modal === 'create' ? 'Cliente creado' : 'Cliente actualizado'); load() }}
        />
      )}
      {historial && <HistorialModal cliente={historial} onClose={() => setHistorial(null)}/>}
    </>
  )
}
