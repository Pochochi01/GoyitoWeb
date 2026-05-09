/**
 * ProdDashboard
 * Fuente de datos: GET /api/analytics/products
 * Campos usados: kpis, topByIngresos, byCategoria, monthly
 */
import React, { useEffect, useState } from 'react'
import { FiPackage, FiDollarSign, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import StatCard  from '../../../../../Components/Admin/StatCard.jsx'
import ChartCard from '../../../../../Components/Admin/ChartCard.jsx'
import analyticsService from '../../../../../api/services/analyticsService'

const COLORS = ['#f42c37','#1376f4','#2dcc6f','#fdc62e','#8b5cf6','#ec4899']

const EmptyChart = ({ h = 200 }) => (
  <div className="flex items-center justify-center text-gray-400 text-sm" style={{height:h}}>Sin datos aún</div>
)

export default function ProdDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getProducts()
      .then(setData).catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const kpis          = data?.kpis          || {}
  const topByIngresos = data?.topByIngresos || []
  const byCategoria   = data?.byCategoria   || []
  const monthly       = data?.monthly       || []

  const totalSkus  = Number(kpis.totalSkus  || 0)
  const sinStock   = Number(kpis.sinStock   || 0)
  const stockBajo  = Number(kpis.stockBajo  || 0)
  const margenProm = Number(kpis.margenProm || 0).toFixed(1)

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total SKUs"   value={totalSkus}
          icon={<FiPackage size={18}/>}       color="text-primary"    bg="bg-primary/10"/>
        <StatCard title="Sin stock"    value={sinStock}
          icon={<FiAlertTriangle size={18}/>} color="text-red-500"    bg="bg-red-100 dark:bg-red-900/30"/>
        <StatCard title="Stock bajo"   value={stockBajo}
          icon={<FiAlertTriangle size={18}/>} color="text-orange-500" bg="bg-orange-100 dark:bg-orange-900/30"/>
        <StatCard title="Margen prom." value={`${margenProm}%`}
          icon={<FiTrendingUp size={18}/>}    color="text-green-600"  bg="bg-green-100 dark:bg-green-900/30"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top productos por ingresos */}
        <ChartCard title="Top 8 productos por ingresos" subtitle="Últimos 6 meses">
          {topByIngresos.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topByIngresos} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="producto" tick={{fontSize:9}} tickFormatter={v=>v.split(' ')[0]}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Bar dataKey="ingresos" name="Ingresos" fill="#f42c37" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={220}/>}
        </ChartCard>

        {/* Ventas por categoría */}
        <ChartCard title="Ventas por categoría" subtitle="Distribución por ingresos">
          {byCategoria.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategoria} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({name,percent})=>`${name?.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {byCategoria.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={220}/>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Evolución ventas */}
        <ChartCard title="Evolución ventas" subtitle="Últimos 7 meses">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly} margin={{left:-10}}>
                <defs>
                  <linearGradient id="gVP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f42c37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f42c37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
                <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#f42c37" fill="url(#gVP)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>

        {/* Margen por producto */}
        <ChartCard title="Margen de ganancia (%)" subtitle="Top 6 productos">
          {topByIngresos.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topByIngresos.slice(0,6).map(p=>({
                producto: p.producto?.split(' ').slice(0,2).join(' '),
                margen:   Number(p.margen||0),
              }))} layout="vertical" margin={{left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/>
                <YAxis type="category" dataKey="producto" tick={{fontSize:9}} width={80}/>
                <Tooltip formatter={v=>`${v}%`}/>
                <Bar dataKey="margen" name="Margen %" fill="#2dcc6f" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart/>}
        </ChartCard>
      </div>

      {/* Ecom vs POS */}
      <ChartCard title="E-commerce vs POS — Ventas mensuales" subtitle="Comparativa de canales">
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="mes" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              <Legend/>
              <Bar dataKey="ecom" name="E-commerce" fill="#1376f4" radius={[4,4,0,0]}/>
              <Bar dataKey="pos"  name="POS"         fill="#2dcc6f" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart/>}
      </ChartCard>
    </div>
  )
}
