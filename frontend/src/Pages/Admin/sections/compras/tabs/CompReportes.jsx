/**
 * CompReportes
 * Fuente de datos: GET /api/analytics/purchases
 * Campos usados: comprasVsVentas, bySupplier, monthly
 */
import React, { useEffect, useState } from 'react'
import { FiFileText, FiBarChart2, FiTrendingUp, FiGrid } from 'react-icons/fi'
import ExportMenu      from '../../../../../Components/Admin/ExportMenu.jsx'
import ChartCard       from '../../../../../Components/Admin/ChartCard.jsx'
import DateRangeFilter from '../../../../../Components/Admin/DateRangeFilter.jsx'
import analyticsService from '../../../../../api/services/analyticsService'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#f42c37','#1376f4','#2dcc6f','#fdc62e','#8b5cf6','#ec4899']

const REPORTS = [
  { id:'comp-ventas', label:'Compras vs Ventas',     icon:<FiTrendingUp size={16}/>, desc:'Comparativa mensual de inversión vs ingresos' },
  { id:'por-prov',    label:'Compras por proveedor', icon:<FiBarChart2 size={16}/>, desc:'Distribución de compras según proveedor' },
  { id:'por-cat',     label:'Compras por categoría', icon:<FiGrid size={16}/>,      desc:'Inversión agrupada por categoría de producto' },
  { id:'pendientes',  label:'Compras pendientes',    icon:<FiFileText size={16}/>,  desc:'Órdenes sin recibir con montos comprometidos' },
]

const EmptyChart = ({ h = 220 }) => (
  <div className="flex items-center justify-center text-gray-400 text-sm" style={{height:h}}>Sin datos aún</div>
)

export default function CompReportes() {
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

  const comprasVsVentas = data?.comprasVsVentas || []
  const bySupplier      = data?.bySupplier      || []
  const monthly         = data?.monthly         || []

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

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">{r.icon}</div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-white">{r.label}</p>
                <p className="text-xs text-gray-400">{r.desc}</p>
              </div>
            </div>
            <ExportMenu label={`Exportar ${r.label}`}/>
          </div>
        ))}
      </div>

      {/* Compras vs Ventas */}
      <ChartCard title="Compras vs Ventas por mes" subtitle="Inversión vs ingresos — últimos 7 meses">
        {loading ? (
          <div className="flex justify-center py-8"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : comprasVsVentas.length ? (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={comprasVsVentas} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="mes" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              <Legend/>
              <Bar dataKey="compras" name="Compras (inversión)" fill="#1376f4" radius={[4,4,0,0]}/>
              <Bar dataKey="ventas"  name="Ventas (ingresos)"   fill="#2dcc6f" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart h={230}/>}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Distribución por proveedor */}
        <ChartCard title="Distribución de compras por proveedor">
          {bySupplier.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySupplier.map(s=>({name:s.proveedor.split(' ')[0], value:s.monto}))}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {bySupplier.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>

        {/* Evolución órdenes */}
        <ChartCard title="Evolución órdenes de compra">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={220}>
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
      </div>
    </div>
  )
}
