/**
 * ProdReportes
 * Fuente de datos: GET /api/analytics/products
 * Campos usados: topByIngresos, byCategoria
 */
import React, { useEffect, useState } from 'react'
import { FiFileText, FiGrid, FiBarChart2, FiRotateCcw } from 'react-icons/fi'
import ExportMenu   from '../../../../../Components/Admin/ExportMenu.jsx'
import ChartCard    from '../../../../../Components/Admin/ChartCard.jsx'
import analyticsService from '../../../../../api/services/analyticsService'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#f42c37','#1376f4','#2dcc6f','#fdc62e','#8b5cf6','#ec4899']

const REPORT_TYPES = [
  { id:'rentabilidad', label:'Rentabilidad por producto', icon:<FiBarChart2 size={16}/>, desc:'Margen bruto, precio costo/venta y ganancia neta por SKU' },
  { id:'categorias',   label:'Ventas por categoría',     icon:<FiGrid size={16}/>,      desc:'Distribución porcentual de ventas y unidades por categoría' },
  { id:'devoluciones', label:'Devoluciones y reclamos',  icon:<FiRotateCcw size={16}/>, desc:'Listado de devoluciones con motivo, monto y estado de resolución' },
  { id:'stock',        label:'Reporte de stock',         icon:<FiFileText size={16}/>,  desc:'Estado actual de inventario con alertas y valorización' },
]

const MOCK_DEVOLUCIONES = [
  { id:'DEV-001', fecha:'2026-04-15', producto:'Auricular Sanyo Bass', motivo:'Defecto de fábrica',      monto:420,  estado:'Resuelta'   },
  { id:'DEV-002', fecha:'2026-04-10', producto:'MacBook Air M2',       motivo:'No coincide descripción', monto:1500, estado:'Pendiente'  },
  { id:'DEV-003', fecha:'2026-04-08', producto:'Smartwatch Premium',   motivo:'No funciona',             monto:350,  estado:'Resuelta'   },
  { id:'DEV-004', fecha:'2026-04-02', producto:'Headset VR Gaming',    motivo:'Envío dañado',            monto:890,  estado:'En proceso' },
]

const EmptyChart = ({ h = 250 }) => (
  <div className="flex items-center justify-center text-gray-400 text-sm" style={{height:h}}>Sin datos aún</div>
)

export default function ProdReportes() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getProducts()
      .then(setData).catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const topByIngresos = data?.topByIngresos || []
  const byCategoria   = data?.byCategoria   || []

  const rentData = topByIngresos.map(p => ({
    nombre:  p.producto?.split(' ').slice(0,2).join(' '),
    margen:  Number(p.margen || 0),
    ganancia:Number(p.ingresos || 0),
  })).sort((a,b) => b.margen - a.margen)

  return (
    <div className="flex flex-col gap-6">
      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{r.icon}</div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-white">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                </div>
              </div>
            </div>
            <ExportMenu label={`Exportar ${r.label}`}/>
          </div>
        ))}
      </div>

      {/* Rentabilidad */}
      <ChartCard title="Margen de ganancia por producto (%)" subtitle="Top productos ordenados por margen">
        {loading ? (
          <div className="flex justify-center py-8"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : rentData.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rentData} margin={{left:-10}} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="nombre" tick={{fontSize:9}} width={90}/>
              <Tooltip formatter={v=>`${v}%`}/>
              <Bar dataKey="margen" name="Margen %" fill="#f42c37" radius={[0,4,4,0]}
                label={{position:'right', fontSize:9, formatter:v=>`${v}%`}}/>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart/>}
      </ChartCard>

      {/* Por categoría */}
      <ChartCard title="Ventas por categoría" subtitle="Distribución porcentual">
        {byCategoria.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategoria} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                  {byCategoria.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`$${Number(v).toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {byCategoria.map((c,i) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                    <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">${Number(c.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <EmptyChart h={200}/>}
      </ChartCard>

      {/* Devoluciones (estáticas — tabla de referencia) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-800 dark:text-white text-sm">Devoluciones y reclamos recientes</h4>
          <ExportMenu label="Exportar devoluciones"/>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40">
            <tr>
              {['ID','Fecha','Producto','Motivo','Monto','Estado'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {MOCK_DEVOLUCIONES.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.id}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.fecha}</td>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{d.producto}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{d.motivo}</td>
                <td className="px-4 py-3 font-bold text-primary">${d.monto}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    d.estado==='Resuelta'  ?'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400':
                    d.estado==='Pendiente' ?'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400':
                                           'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                    {d.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
