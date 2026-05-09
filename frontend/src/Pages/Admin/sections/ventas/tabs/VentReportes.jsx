/**
 * VentReportes
 * Fuente de datos: GET /api/analytics/sales
 * Campos usados: monthly, byCategoria, segmentacion, weekly
 */
import React, { useEffect, useState } from 'react'
import { FiTrendingUp, FiUsers, FiBarChart2, FiFileText } from 'react-icons/fi'
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
  { id:'mensual',   label:'Reporte mensual de ventas', icon:<FiTrendingUp size={16}/>, desc:'Resumen de ingresos, margen y unidades por mes' },
  { id:'clientes',  label:'Reporte de clientes',       icon:<FiUsers size={16}/>,      desc:'Segmentación, frecuencia y ticket promedio' },
  { id:'canal',     label:'Ventas por canal',          icon:<FiBarChart2 size={16}/>,  desc:'Comparativa E-commerce vs POS por período' },
  { id:'categoria', label:'Ventas por categoría',     icon:<FiFileText size={16}/>,   desc:'Ingresos y unidades agrupados por categoría' },
]

const EmptyChart = ({ h = 200 }) => (
  <div className="flex items-center justify-center text-gray-400 text-sm" style={{height:h}}>Sin datos aún</div>
)

export default function VentReportes() {
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

  useEffect(() => { load() }, [])

  const monthly      = data?.monthly      || []
  const byCategoria  = data?.byCategoria  || []
  const segmentacion = data?.segmentacion || []
  const weekly       = data?.weekly       || []

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

      {/* Tarjetas de reporte con export */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{r.icon}</div>
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-white">{r.label}</p>
                <p className="text-xs text-gray-400">{r.desc}</p>
              </div>
            </div>
            <ExportMenu label={`Exportar ${r.label}`}/>
          </div>
        ))}
      </div>

      {/* Evolución mensual */}
      <ChartCard title="Evolución mensual de ventas" subtitle="Ingresos — últimos 7 meses">
        {loading ? (
          <div className="flex justify-center py-8"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : monthly.length ? (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={monthly} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="mes" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              <Legend/>
              <Line type="monotone" dataKey="ventas" name="Ventas"     stroke="#f42c37" strokeWidth={2} dot={{r:4}}/>
              <Line type="monotone" dataKey="ecom"   name="E-commerce" stroke="#2dcc6f" strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
              <Line type="monotone" dataKey="pos"    name="POS"        stroke="#1376f4" strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyChart h={230}/>}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Por categoría */}
        <ChartCard title="Ventas por categoría" subtitle="Ingresos por línea de producto">
          {byCategoria.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategoria} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="categoria" tick={{fontSize:10}} tickFormatter={v=>v.split(' ')[0]}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Bar dataKey="ventas" name="Ventas" fill="#f42c37" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={220}/>}
        </ChartCard>

        {/* Segmentación clientes */}
        <ChartCard title="Segmentación de clientes" subtitle="Distribución por tipo">
          {segmentacion.length ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={210}>
                <PieChart>
                  <Pie data={segmentacion} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {segmentacion.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {segmentacion.map((s,i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart h={210}/>}
        </ChartCard>
      </div>

      {/* Ventas semanales */}
      <ChartCard title="Ventas semanales (mes actual)" subtitle="Ingresos y órdenes semana a semana">
        {weekly.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="semana" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              <Legend/>
              <Bar dataKey="ventas"  name="Ventas ($)" fill="#f42c37" radius={[4,4,0,0]}/>
              <Bar dataKey="ordenes" name="Órdenes"    fill="#fdc62e" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart/>}
      </ChartCard>
    </div>
  )
}
