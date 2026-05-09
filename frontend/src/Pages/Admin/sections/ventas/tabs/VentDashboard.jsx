/**
 * VentDashboard
 * Fuente de datos: GET /api/analytics/sales
 * Campos usados: kpis, monthly, topProducts, paymentMethods, weekly
 */
import React, { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import StatCard        from '../../../../../Components/Admin/StatCard.jsx'
import ChartCard       from '../../../../../Components/Admin/ChartCard.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import analyticsService from '../../../../../api/services/analyticsService'

const COLORS = ['#f42c37','#1376f4','#2dcc6f','#fdc62e','#8b5cf6','#ec4899']

const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
  </div>
)

const EmptyChart = ({ h = 200 }) => (
  <div className={`flex items-center justify-center text-gray-400 text-sm`} style={{height:h}}>
    Sin datos aún
  </div>
)

export default function VentDashboard() {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  const load = (sd = startDate, ed = endDate) => {
    setLoading(true)
    const params = {}
    if (sd) params.startDate = sd
    if (ed) params.endDate   = ed
    analyticsService.getSales(params)
      .then(setData).catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])  // carga inicial sin filtro

  if (loading) return <Spinner/>

  const kpis          = data?.kpis           || {}
  const monthly       = data?.monthly        || []
  const weekly        = data?.weekly         || []
  const topProducts   = data?.topProducts    || []
  const paymentMethods= data?.paymentMethods || []

  const totalMes    = Number(kpis.totalMes    || 0)
  const totalOrds   = Number(kpis.totalOrdenes|| 0)
  const ticketProm  = Math.round(Number(kpis.ticketProm || 0))

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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ventas del mes"  value={totalMes  ? `$${(totalMes/1000).toFixed(0)}k` : '$0'}
          icon={<FiDollarSign size={18}/>}  color="text-primary"     bg="bg-primary/10"/>
        <StatCard title="Órdenes"         value={totalOrds}
          icon={<FiShoppingBag size={18}/>} color="text-blue-600"   bg="bg-blue-100 dark:bg-blue-900/30"/>
        <StatCard title="Ticket promedio" value={`$${ticketProm}`}
          icon={<FiUsers size={18}/>}       color="text-green-600"  bg="bg-green-100 dark:bg-green-900/30"/>
        <StatCard title="Canales activos" value={[...new Set((data?.monthly||[]).flatMap(m=>[m.ecom>0?'Ecom':null,m.pos>0?'POS':null].filter(Boolean)))].length || '—'}
          icon={<FiTrendingUp size={18}/>}  color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30"/>
      </div>

      {/* Evolución ventas */}
      <ChartCard title="Evolución de ventas" subtitle="Ingresos por mes — últimos 7 meses">
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{left:-10}}>
              <defs>
                <linearGradient id="gVenta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f42c37" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f42c37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="mes" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              <Legend/>
              <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#f42c37" fill="url(#gVenta)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyChart h={220}/>}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ecom vs POS */}
        <ChartCard title="E-commerce vs POS" subtitle="Ventas por canal">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthly} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Legend/>
                <Bar dataKey="ecom" name="E-commerce" fill="#f42c37" radius={[4,4,0,0]}/>
                <Bar dataKey="pos"  name="POS"         fill="#1376f4" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={210}/>}
        </ChartCard>

        {/* Métodos de pago */}
        <ChartCard title="Métodos de pago" subtitle="Distribución de órdenes">
          {paymentMethods.length ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={210}>
                <PieChart>
                  <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {paymentMethods.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {paymentMethods.map((m,i) => (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-gray-600 dark:text-gray-400">{m.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart h={210}/>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top productos */}
        <ChartCard title="Top productos más vendidos" subtitle="Por unidades">
          {topProducts.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts.slice(0,6)} layout="vertical" margin={{left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" tick={{fontSize:10}}/>
                <YAxis type="category" dataKey="producto" tick={{fontSize:9}} width={100}
                  tickFormatter={v=>v?.split(' ').slice(0,2).join(' ')}/>
                <Tooltip/>
                <Bar dataKey="unidades" name="Unidades" fill="#2dcc6f" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>

        {/* Ventas semanales */}
        <ChartCard title="Ventas semanales (mes actual)">
          {weekly.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weekly} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="semana" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Legend/>
                <Line type="monotone" dataKey="ventas"  name="Ventas"  stroke="#f42c37" strokeWidth={2} dot={{r:4}}/>
                <Line type="monotone" dataKey="ordenes" name="Órdenes" stroke="#fdc62e" strokeWidth={2} dot={{r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>
      </div>
    </div>
  )
}
