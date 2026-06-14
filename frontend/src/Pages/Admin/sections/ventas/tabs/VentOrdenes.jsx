import React, { useState, useEffect, useCallback } from 'react'
import { FiEye, FiX, FiCreditCard, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi'
import StatusBadge     from '../../../../../Components/Admin/StatusBadge.jsx'
import ExportMenu      from '../../../../../Components/Admin/ExportMenu.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import salesOrderService from '../../../../../api/services/salesOrderService'

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
  const [order,  setOrder]  = useState(null)
  const [loading,setLoading] = useState(true)
  const [saving, setSaving]  = useState(false)

  useEffect(() => {
    salesOrderService.getById(orderId)
      .then(setOrder).catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  const changeEstado = async (estado) => {
    setSaving(true)
    try { await salesOrderService.updateEstado(orderId, estado); onUpdated(); onClose() }
    catch { /* silencioso */ }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Detalle de venta</h3>
            {order && <p className="text-xs text-gray-400 font-mono">#{order.id}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><FiX size={20}/></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : !order ? (
          <p className="text-center py-10 text-gray-400">Error al cargar la orden</p>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Cliente</p><p className="font-semibold dark:text-white">{order.cliente_nombre || '—'}</p></div>
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

            {/* ID de pago MercadoPago — para control manual con la app de MP */}
            {order.mp_payment_id && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Pago MercadoPago
                </p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400">
                    Usá este ID para conciliar con el panel de MercadoPago
                  </p>
                  <CopyableCode value={order.mp_payment_id} label="ID de pago"/>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Productos</p>
              <div className="flex flex-col gap-2">
                {order.items?.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{it.nombre_producto}</p>
                      <p className="text-xs text-gray-400">x{it.cantidad} · ${it.precio_unit} c/u</p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">${Number(it.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
              <span className="font-bold text-gray-800 dark:text-white">Total</span>
              <span className="font-bold text-primary text-lg">${Number(order.total).toLocaleString()}</span>
            </div>

            {/* Cambiar estado */}
            {!['Entregada','Cancelada'].includes(order.estado) && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Actualizar estado</p>
                <div className="flex flex-wrap gap-2">
                  {['Pagada','Enviada','Entregada','Cancelada'].filter(e => e !== order.estado).map(e => (
                    <button key={e} disabled={saving} onClick={() => changeEstado(e)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50 flex items-center gap-1">
                      {saving && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin"/>}
                      → {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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

  /**
   * load acepta overrides de fecha para evitar el stale-closure de React.
   * Cuando DateRangeFilter llama onApply(s, e), pasamos esos valores directamente.
   */
  const load = useCallback(async (sd = startDate, ed = endDate) => {
    setLoading(true)
    try {
      const params = {}
      if (estado !== 'Todos') params.estado    = estado
      if (canal  !== 'Todos') params.canal     = canal
      if (sd)                 params.startDate = sd
      if (ed)                 params.endDate   = ed
      setOrders(await salesOrderService.getAll(params))
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [estado, canal, startDate, endDate])   // ← fechas en deps

  // Recarga cuando cambia estado o canal
  useEffect(() => { load() }, [estado, canal])

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-1.5">
            {ESTADOS.map(e => (
              <button key={e} onClick={() => setEstado(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
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
          <button onClick={() => load()} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Recargar"><FiRefreshCw size={14}/></button>
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
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
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
            <div className="sm:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
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
                    <button onClick={() => setSelected(o.id)} className="text-xs text-primary font-semibold hover:underline mt-1"><FiEye size={11} className="inline"/> Detalle</button>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && <div className="text-center py-14 text-gray-400 text-sm">Sin órdenes para este filtro</div>}
          </>
        )}
      </div>

      {selected && <OrderModal orderId={selected} onClose={() => setSelected(null)} onUpdated={load}/>}
    </>
  )
}
