/**
 * CompDashboard
 * Fuente de datos: GET /api/analytics/purchases
 * Campos usados: kpis, monthly, bySupplier
 */
import React, { useEffect, useState } from 'react'
import { FiShoppingCart, FiTruck, FiUsers, FiDollarSign } from 'react-icons/fi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from 'recharts'
import StatCard        from '../../../../../Components/Admin/StatCard.jsx'
import ChartCard       from '../../../../../Components/Admin/ChartCard.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import analyticsService from '../../../../../api/services/analyticsService'

const EmptyChart = ({ h = 200 }) => (
  <div className="flex items-center justify-center text-gray-400 text-sm" style={{height:h}}>Sin datos aún</div>
)

export default function CompDashboard() {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  const load = (sd = startDate, ed = endDate) => {
    setLoading(true)
    const params = {}
    if (sd) params.startDate = sd
    if (ed) params.endDate   = ed
    analyticsService.getPurchases(params)
      .then(setData).catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const kpis       = data?.kpis       || {}
  const monthly    = data?.monthly    || []
  const bySupplier = data?.bySupplier || []

  const totalMes           = Number(kpis.totalMes           || 0)
  const ordenesPend        = Number(kpis.ordenesPend        || 0)
  const proveedoresActivos = Number(kpis.proveedoresActivos || 0)
  const promEntrega        = kpis.promEntrega ? `${kpis.promEntrega}d` : '—'

  // Precio promedio simulado a partir de los datos reales
  const precioEvol = monthly.map(m => ({
    mes: m.mes,
    promUnit: m.ordenes > 0 ? Math.round(Number(m.monto) / m.ordenes) : 0,
  }))

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Filtro de período */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
        <DateRangeFilter
          startDate={startDate} endDate={endDate}
          onStartDate={setStartDate} onEndDate={setEndDate}
          onApply={(s, e) => load(s, e)}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total invertido (mes)" value={totalMes ? `$${(totalMes/1000).toFixed(0)}k` : '$0'}
          icon={<FiDollarSign size={18}/>}   color="text-primary"     bg="bg-primary/10"/>
        <StatCard title="Órdenes activas"       value={ordenesPend}
          icon={<FiTruck size={18}/>}         color="text-blue-600"   bg="bg-blue-100 dark:bg-blue-900/30"/>
        <StatCard title="Proveedores activos"   value={proveedoresActivos}
          icon={<FiUsers size={18}/>}         color="text-green-600"  bg="bg-green-100 dark:bg-green-900/30"/>
        <StatCard title="Entrega prom."         value={promEntrega}
          icon={<FiShoppingCart size={18}/>}  color="text-yellow-600" bg="bg-yellow-100 dark:bg-yellow-900/30"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Monto total de compras por mes" subtitle="Últimos 7 meses">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Bar dataKey="monto" name="Monto comprado" fill="#1376f4" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={220}/>}
        </ChartCard>

        <ChartCard title="Ranking de proveedores" subtitle="Por monto total comprado">
          {bySupplier.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySupplier} layout="vertical" margin={{left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" tick={{fontSize:9}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <YAxis type="category" dataKey="proveedor" tick={{fontSize:8}} width={130}
                  tickFormatter={v=>v.split(' ').slice(0,2).join(' ')}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Bar dataKey="monto" name="Monto" fill="#2dcc6f" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={220}/>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Órdenes por mes" subtitle="Cantidad de órdenes de compra">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthly} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}}/>
                <Tooltip/>
                <Line type="monotone" dataKey="ordenes" name="Órdenes" stroke="#f42c37" strokeWidth={2} dot={{r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>

        <ChartCard title="Precio unitario promedio por mes">
          {precioEvol.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={precioEvol} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${v}`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Line type="monotone" dataKey="promUnit" name="Precio prom." stroke="#8b5cf6" strokeWidth={2} dot={{r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>
      </div>
    </div>
  )
}
