import React, { useState, useEffect, useCallback } from 'react'
import { FiEye, FiX, FiPaperclip, FiRefreshCw } from 'react-icons/fi'
import StatusBadge       from '../../../../../Components/Admin/StatusBadge.jsx'
import ExportMenu        from '../../../../../Components/Admin/ExportMenu.jsx'
import DateRangeFilter   from '../../../../../Components/Admin/DateRangeFilter.jsx'
import purchaseOrderService from '../../../../../api/services/purchaseOrderService'

const ESTADOS = ['Todos','Pendiente','En tránsito','Recibida','Cancelada']

function OrderModal({ orderId, onClose, onUpdated }) {
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    purchaseOrderService.getById(orderId)
      .then(setOrder).catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  const changeEstado = async (estado) => {
    setSaving(true)
    try { await purchaseOrderService.updateEstado(orderId, estado); onUpdated(); onClose() }
    catch { /* silencioso */ }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Orden de compra</h3>
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
              <div><p className="text-gray-400 text-xs">Proveedor</p><p className="font-semibold dark:text-white">{order.proveedor_nombre}</p></div>
              <div><p className="text-gray-400 text-xs">Fecha</p><p className="font-semibold dark:text-white">{order.fecha}</p></div>
              <div><p className="text-gray-400 text-xs">Estado</p><StatusBadge status={order.estado}/></div>
              <div><p className="text-gray-400 text-xs">Días entrega</p><p className="font-semibold dark:text-white">{order.dias_entrega ? `${order.dias_entrega} días` : '—'}</p></div>
            </div>

            {order.comprobante && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
                <FiPaperclip size={12}/> Comprobante: <span className="font-mono font-bold">{order.comprobante}</span>
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
            {order.estado !== 'Recibida' && order.estado !== 'Cancelada' && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Actualizar estado</p>
                <div className="flex flex-wrap gap-2">
                  {['En tránsito','Recibida','Cancelada'].filter(e => e !== order.estado).map(e => (
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

export default function CompGestion() {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [estado,    setEstado]    = useState('Todos')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [selected,  setSelected]  = useState(null)

  const load = useCallback(async (sd = startDate, ed = endDate) => {
    setLoading(true)
    try {
      const params = {}
      if (estado !== 'Todos') params.estado    = estado
      if (sd)                 params.startDate = sd
      if (ed)                 params.endDate   = ed
      setOrders(await purchaseOrderService.getAll(params))
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [estado, startDate, endDate])

  useEffect(() => { load() }, [estado])

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setEstado(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${estado===e?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
              {e}
            </button>
          ))}
          <button onClick={() => load()} className="ml-1 p-1.5 text-gray-400 hover:text-primary transition-colors" title="Recargar"><FiRefreshCw size={14}/></button>
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
                    {['ID','Fecha','Proveedor','Estado','Comprobante','Total',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {orders.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-300">#{c.id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.fecha}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{c.proveedor_nombre}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.estado}/></td>
                      <td className="px-4 py-3">
                        {c.comprobante
                          ? <span className="flex items-center gap-1 text-xs text-blue-500 font-mono"><FiPaperclip size={11}/>{c.comprobante}</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">${Number(c.total).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(c.id)} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
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
              {orders.map(c => (
                <div key={c.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-gray-500">#{c.id}</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.proveedor_nombre}</p>
                    <div className="flex items-center gap-2 mt-1"><StatusBadge status={c.estado}/><span className="text-xs text-gray-400">{c.fecha}</span></div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-800 dark:text-white">${Number(c.total).toLocaleString()}</p>
                    <button onClick={() => setSelected(c.id)} className="text-xs text-primary font-semibold hover:underline mt-1"><FiEye size={11} className="inline"/> Detalle</button>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <p className="text-sm">Sin órdenes para este filtro</p>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <OrderModal orderId={selected} onClose={() => setSelected(null)} onUpdated={load}/>}
    </>
  )
}
