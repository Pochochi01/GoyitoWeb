import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiRefreshCw, FiShoppingBag, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi'
import posService from '../../api/services/posService'
import DarkMode   from '../../Components/NavBar/DarkMode.jsx'

const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })

const KpiCard = ({ title, value, icon, color = 'text-primary', bg = 'bg-primary/10' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
)

export default function POSReports() {
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [sales,   setSales]   = useState([])
  const [selected,setSelected]= useState(null)

  const branch = (() => {
    try { return JSON.parse(localStorage.getItem('pos_branch')) } catch { return null }
  })()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { fecha }
      if (branch?.id) params.sucursal_id = branch.id
      const [report, salesData] = await Promise.all([
        posService.getReports(params),
        posService.getSales(params),
      ])
      setData(report)
      setSales(salesData)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [fecha, branch?.id])

  useEffect(() => { load() }, [load])

  const loadDetail = async (id) => {
    try {
      const detail = await posService.getSaleById(id)
      setSelected(detail)
    } catch { /* silencioso */ }
  }

  const kpis = data?.kpis        || {}
  const byPay = data?.byPayment  || []
  const topP  = data?.topProducts|| []

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
        <Link to="/pos" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <FiArrowLeft size={18}/>
        </Link>
        <span className="font-bold text-sm text-white">Reportes del día</span>
        {branch && <span className="text-xs text-gray-400 ml-1">— {branch.nombre}</span>}
        <div className="ml-auto flex items-center gap-3">
          <DarkMode />
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"/>
          <button onClick={load} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50">
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>
      </header>

      <div className="p-4 max-w-5xl mx-auto flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Ventas del día"    value={Number(kpis.total_ventas||0)}
            icon={<FiShoppingBag size={18}/>}  color="text-primary"    bg="bg-primary/10"/>
          <KpiCard title="Ingresos"          value={`$${fmt(kpis.ingresos)}`}
            icon={<FiDollarSign size={18}/>}   color="text-green-600"  bg="bg-green-100 dark:bg-green-900/30"/>
          <KpiCard title="Ticket promedio"   value={`$${fmt(kpis.ticket_promedio)}`}
            icon={<FiUsers size={18}/>}        color="text-blue-600"   bg="bg-blue-100 dark:bg-blue-900/30"/>
          <KpiCard title="Canceladas"        value={Number(kpis.canceladas||0)}
            icon={<FiTrendingUp size={18}/>}   color="text-orange-500" bg="bg-orange-100 dark:bg-orange-900/30"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Métodos de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Métodos de pago</h3>
            </div>
            {byPay.length ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['Método','Cantidad','Total'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {byPay.map(p => (
                    <tr key={p.metodo_pago} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                      <td className="px-4 py-2.5 font-semibold text-gray-800 dark:text-white">{p.metodo_pago}</td>
                      <td className="px-4 py-2.5 text-gray-500">{p.cantidad}</td>
                      <td className="px-4 py-2.5 font-bold text-green-600">${fmt(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 text-sm text-gray-400">Sin ventas para esta fecha</p>
            )}
          </div>

          {/* Top productos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Productos más vendidos</h3>
            </div>
            {topP.length ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['Producto','Unidades','Ingresos'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {topP.map((p,i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                      <td className="px-4 py-2.5 font-semibold text-gray-800 dark:text-white text-xs leading-tight">{p.titulo}</td>
                      <td className="px-4 py-2.5 font-bold text-primary">{p.unidades}</td>
                      <td className="px-4 py-2.5 text-green-600 font-semibold">${fmt(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-8 text-sm text-gray-400">Sin datos</p>
            )}
          </div>
        </div>

        {/* Listado de ventas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-sm text-gray-800 dark:text-white">Ventas del día ({sales.length})</h3>
          </div>
          {sales.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['#','Hora','Cliente','Ítems','Pago','Estado','Total',''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {sales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">#{s.id}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{s.created_at ? new Date(s.created_at).toLocaleTimeString() : '—'}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.cliente_nombre || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{s.items_count}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{s.metodo_pago}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                          ${s.estado==='Pagada'?'bg-green-100 text-green-700':s.estado==='Cancelada'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-gray-800 dark:text-white">${fmt(s.total)}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => loadDetail(s.id)}
                          className="text-xs text-primary hover:underline font-semibold">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10 text-sm text-gray-400">Sin ventas para esta fecha</p>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">Venta #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <FiArrowLeft size={18}/>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-gray-400">Fecha</p><p className="font-semibold dark:text-white">{selected.fecha}</p></div>
                <div><p className="text-gray-400">Método</p><p className="font-semibold dark:text-white">{selected.metodo_pago}</p></div>
                <div><p className="text-gray-400">Operador</p><p className="font-semibold dark:text-white">{selected.operador_nombre||'—'}</p></div>
                <div><p className="text-gray-400">Cliente</p><p className="font-semibold dark:text-white">{selected.cliente_nombre||'—'}</p></div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                {selected.items?.map((it,i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 text-xs">
                    <div>
                      <p className="font-semibold dark:text-white">{it.titulo||it.nombre_producto}</p>
                      <p className="text-gray-400">x{it.cantidad} · ${it.precio_unit}</p>
                    </div>
                    <span className="font-bold dark:text-white">${fmt(it.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base">
                <span className="dark:text-white">Total</span>
                <span className="text-primary">${fmt(selected.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
