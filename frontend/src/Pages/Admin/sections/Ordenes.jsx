import React, { useState } from 'react'
import { FiEye, FiX, FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi'

const MOCK_ORDERS = [
  {
    id: '#ORD-0001', date: '2025-01-15', status: 'Entregado', total: 340.00,
    customer: 'Juan Pérez', email: 'juan@mail.com', items: [
      { name: 'Auricular JBL Pro', qty: 1, price: 120 },
      { name: 'Auricular JS Studio', qty: 1, price: 220 },
    ],
  },
  {
    id: '#ORD-0002', date: '2025-01-16', status: 'En camino', total: 1500.00,
    customer: 'María García', email: 'maria@mail.com', items: [
      { name: 'MacBook Air M2', qty: 1, price: 1500 },
    ],
  },
  {
    id: '#ORD-0003', date: '2025-01-17', status: 'Pendiente', total: 220.00,
    customer: 'Carlos López', email: 'carlos@mail.com', items: [
      { name: 'Auricular JS Studio', qty: 1, price: 220 },
    ],
  },
  {
    id: '#ORD-0004', date: '2025-01-18', status: 'Cancelado', total: 699.00,
    customer: 'Ana Rodríguez', email: 'ana@mail.com', items: [
      { name: 'Teléfono Android 5G', qty: 1, price: 699 },
    ],
  },
  {
    id: '#ORD-0005', date: '2025-01-19', status: 'En camino', total: 730.00,
    customer: 'Pedro Sánchez', email: 'pedro@mail.com', items: [
      { name: 'Auricular Sanyo Bass', qty: 1, price: 336 },
      { name: 'Smartwatch Lite', qty: 1, price: 199 },
      { name: 'Auricular JBL Pro', qty: 1, price: 120 },
    ],
  },
  {
    id: '#ORD-0006', date: '2025-01-20', status: 'Pendiente', total: 890.00,
    customer: 'Laura Gómez', email: 'laura@mail.com', items: [
      { name: 'Headset VR Gaming', qty: 1, price: 890 },
    ],
  },
]

const STATUS_STYLES = {
  'Entregado': { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400', icon: <FiCheckCircle size={12} /> },
  'En camino': { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-400',   icon: <FiTruck size={12} /> },
  'Pendiente': { bg: 'bg-yellow-100 dark:bg-yellow-900/30',text: 'text-yellow-700 dark:text-yellow-400',icon: <FiClock size={12} /> },
  'Cancelado': { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',     icon: <FiXCircle size={12} /> },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pendiente']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.icon}{status}
    </span>
  )
}

const OrderModal = ({ order, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white">Detalle de orden</h3>
          <p className="text-xs text-gray-400">{order.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
          <FiX size={20} />
        </button>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400 text-xs">Cliente</p><p className="font-semibold dark:text-white">{order.customer}</p></div>
          <div><p className="text-gray-400 text-xs">Email</p><p className="font-semibold dark:text-white truncate">{order.email}</p></div>
          <div><p className="text-gray-400 text-xs">Fecha</p><p className="font-semibold dark:text-white">{order.date}</p></div>
          <div><p className="text-gray-400 text-xs">Estado</p><StatusBadge status={order.status} /></div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Productos</p>
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <FiPackage size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-gray-400 text-xs">×{item.qty}</span>
                </div>
                <span className="font-semibold dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
          <span className="font-bold text-gray-800 dark:text-white">Total</span>
          <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
)

const Ordenes = () => {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('Todos')

  const statusOptions = ['Todos', 'Pendiente', 'En camino', 'Entregado', 'Cancelado']

  const filtered = filter === 'Todos'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === filter)

  const totals = {
    total: MOCK_ORDERS.reduce((s, o) => s + o.total, 0),
    entregados: MOCK_ORDERS.filter((o) => o.status === 'Entregado').length,
    pendientes: MOCK_ORDERS.filter((o) => o.status === 'Pendiente').length,
    enCamino:   MOCK_ORDERS.filter((o) => o.status === 'En camino').length,
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Ingresos totales', value: `$${totals.total.toFixed(0)}`, color: 'text-primary' },
          { label: 'Entregados',       value: totals.entregados,            color: 'text-green-500' },
          { label: 'En camino',        value: totals.enCamino,              color: 'text-blue-500'  },
          { label: 'Pendientes',       value: totals.pendientes,            color: 'text-yellow-500' },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                {['ID Compra', 'Cliente', 'Fecha', 'Estado', 'Total', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-100">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{order.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{order.date}</td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4 font-bold text-gray-800 dark:text-white">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(order)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <FiEye size={13} /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">{order.id}</p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{order.customer}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-gray-400">{order.date}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800 dark:text-white">${order.total.toFixed(2)}</p>
                <button onClick={() => setSelected(order)}
                  className="text-xs text-primary font-semibold hover:underline mt-1 flex items-center gap-1">
                  <FiEye size={11} /> Detalle
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiPackage size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay órdenes con este estado</p>
          </div>
        )}
      </div>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

export default Ordenes
