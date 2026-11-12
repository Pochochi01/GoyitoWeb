import React, { useState, useEffect, useCallback } from 'react'
import { FiEye, FiCreditCard, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi'
import StatusBadge     from '../../../../../Components/Admin/StatusBadge.jsx'
import ExportMenu      from '../../../../../Components/Admin/ExportMenu.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import salesOrderService from '../../../../../api/services/salesOrderService'
import AdminModal, { apiErrorMessage } from '../../../../../Components/Admin/AdminModal.jsx'
import Toast, { useToast } from '../../../../../Components/Shared/Toast.jsx'

const ESTADOS = ['Todos','Pendiente','Pagada','Enviada','Entregada','Cancelada']
const CANALES  = ['Todos','E-commerce','POS']

// Componente pequeño: muestra un valor monoespaciado con botón de copiar al portapapeles.
function CopyableCode({ value, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard no disponible */ }
  }
  return (
    <button onClick={handleCopy} title={`Copiar ${label || 'al portapapeles'}`}
      className="inline-flex items-center gap-1.5 font-mono text-xs bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 hover:text-primary
                 dark:hover:bg-primary/20 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-md transition-colors max-w-full">
      <span className="truncate">{value}</span>
      {copied ? <FiCheck size={11} className="text-green-500 flex-shrink-0"/> : <FiCopy size={11} className="flex-shrink-0 opacity-60"/>}
    </button>
  )
}

function OrderModal({ orderId, onClose, onUpdated }) {
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)
  const [error,   setError]   = useState('')
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    salesOrderService.getById(orderId)
      .then(setOrder)
      .catch(e => setLoadErr(apiErrorMessage(e, 'Error al cargar la orden')))
      .finally(() => setLoading(false))
  }, [orderId])

  const changeEstado = async (estado) => {
    if (saving) return
    if (estado === 'Cancelada' && !window.confirm('¿Cancelar esta venta? El estado no se podrá volver a cambiar.')) return
    setSaving(estado)
    setError('')
    try {
      await salesOrderService.updateEstado(orderId, estado)
      onUpdated(`Venta #${orderId} → ${estado}`)
      onClose()
    } catch (e) {
      setError(apiErrorMessage(e, 'No se pudo actualizar el estado'))
    } finally { setSaving(null) }
  }

  return (
    <AdminModal title={order ? `Detalle de venta #${order.id}` : 'Detalle de venta'} onClose={onClose} busy={Boolean(saving)} error={error}>
        {loading ? (
          <div className="flex justify-center py-16"><span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : !order ? (
          <p className="text-center py-10 text-gray-400">{loadErr || 'Error al cargar la orden'}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="min-w-0"><p className="text-gray-400 text-xs">Cliente</p><p className="font-semibold dark:text-white truncate">{order.cliente_nombre || '—'}</p></div>
              <div><p className="text-gray-400 text-xs">Fecha</p><p className="font-semibold dark:text-white">{order.fecha}</p></div>
              <div>
                <p className="text-gray-400 text-xs">Canal</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.canal==='POS'?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>{order.canal}</span>
              </div>
              <div><p className="text-gray-400 text-xs">Estado</p><StatusBadge status={order.estado}/></div>
              <div>
                <p className="text-gray-400 text-xs">Método de pago</p>
                <div className="flex items-center gap-1 mt-0.5"><FiCreditCard size={12} className="text-gray-400"/><p className="font-semibold dark:text-white text-sm">{order.metodo_pago}</p></div>
              </div>
              {order.operador_nombre && (
                <div><p className="text-gray-400 text-xs">Operador POS</p><p className="font-semibold font-mono dark:text-white">{order.operador_nombre}</p></div>
              )}
            </div>

            {order.mp_payment_id && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pago MercadoPago</p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400">Usá este ID para conciliar con el panel de MercadoPago</p>
                  <CopyableCode value={order.mp_payment_id} label="ID de pago"/>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Productos</p>
              <div className="flex flex-col gap-2">
                {order.items?.map((it, i) => (
                  <div key={i} className="flex justify-between items-center gap-3 text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white truncate">{it.nombre_producto}</p>
                      <p className="text-xs text-gray-400 tabular-nums">x{it.cantidad} · ${it.precio_unit} c/u</p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white tabular-nums flex-shrink-0">${Number(it.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
              <span className="font-bold text-gray-800 dark:text-white">Total</span>
              <span className="font-bold text-primary text-lg tabular-nums">${Number(order.total).toLocaleString()}</span>
            </div>

            {!['Entregada','Cancelada'].includes(order.estado) && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Actualizar estado</p>
                <div className="flex flex-wrap gap-2">
                  {['Pagada','Enviada','Entregada','Cancelada'].filter(e => e !== order.estado).map(e => (
                    <button key={e} disabled={Boolean(saving)} onClick={() => changeEstado(e)}
                      className="min-h-[40px] px-4 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      {saving === e && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin"/>}
                      → {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
    </AdminModal>
  )
}

export default function VentOrdenes() {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [estado,    setEstado]    = useState('Todos')
  const [canal,     setCanal]     = useState('Todos')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [selected,  setSelected]  = useState(null)
  const [loadError, setLoadError] = useState('')
  const { toast, showToast } = useToast()

  /**
   * load acepta overrides de fecha para evitar el stale-closure de React.
   * Cuando DateRangeFilter llama onApply(s, e), pasamos esos valores directamente.
   */
  const load = useCallback(async (sd = startDate, ed = endDate, { silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const params = {}
      if (estado !== 'Todos') params.estado    = estado
      if (canal  !== 'Todos') params.canal     = canal
      if (sd)                 params.startDate = sd
      if (ed)                 params.endDate   = ed
      setOrders(await salesOrderService.getAll(params))
      setLoadError('')
    } catch (e) {
      const msg = apiErrorMessage(e, 'No se pudieron cargar las ventas')
      if (silent) showToast(msg, 'error'); else setLoadError(msg)
    }
    finally { setLoading(false) }
  }, [estado, canal, startDate, endDate, showToast])   // ← fechas en deps

  // Recarga cuando cambia estado o canal
  useEffect(() => { load() }, [estado, canal]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toast toast={toast}/>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ESTADOS.map(e => (
              <button key={e} onClick={() => setEstado(e)} aria-pressed={estado===e}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
                  ${estado===e?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {CANALES.map(c => (
              <button key={c} onClick={() => setCanal(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${canal===c?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => load()} aria-label="Recargar" className="w-9 h-9 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-primary transition-colors" title="Recargar"><FiRefreshCw size={14}/></button>
          <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
            <DateRangeFilter
              startDate={startDate} endDate={endDate}
              onStartDate={setStartDate} onEndDate={setEndDate}
              onApply={(s, e) => load(s, e)}
            />
          </div>
          <div className="ml-auto"><ExportMenu/></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : loadError ? (
          <div className="text-center py-14 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
            <button onClick={() => load()} className="px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold">Reintentar</button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['ID','Fecha','Cliente','Canal','Estado','Pago','ID MP','Total',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-300">#{o.id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.fecha}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{o.cliente_nombre||'—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.canal==='POS'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{o.canal}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={o.estado}/></td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{o.metodo_pago}</td>
                      <td className="px-4 py-3">
                        {o.mp_payment_id
                          ? <CopyableCode value={o.mp_payment_id} label="ID de pago MP"/>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">${Number(o.total).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(o.id)} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                          <FiEye size={12}/> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
              {orders.map(o => (
                <div key={o.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-gray-500">#{o.id}</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{o.cliente_nombre||'—'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <StatusBadge status={o.estado}/>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${o.canal==='POS'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{o.canal}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800 dark:text-white">${Number(o.total).toLocaleString()}</p>
                    <button onClick={() => setSelected(o.id)} className="min-h-[40px] px-2 -mr-2 text-xs text-primary font-semibold hover:underline"><FiEye size={11} className="inline"/> Detalle</button>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && <div className="text-center py-14 text-gray-400 text-sm">Sin órdenes para este filtro</div>}
          </>
        )}
      </div>

      {selected && <OrderModal orderId={selected} onClose={() => setSelected(null)} onUpdated={(msg) => { showToast(msg); load(undefined, undefined, { silent: true }) }}/>}
    </>
  )
}
