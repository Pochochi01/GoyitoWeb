import React from 'react'

const PRESETS = {
  // Compras
  'Recibida':             'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'En tránsito':          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Pendiente':            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'Cancelada':            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  // Ventas
  'Entregada':            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Enviada':              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Pagada':               'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'Cancelado':            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  // Stock / producto
  'Inhabilitado':         'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 line-through',
  'Sin stock':            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  'Stock bajo':           'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  'Normal':               'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  // Clientes
  'VIP':                  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Premium':              'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  'Regular':              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  'Nuevo':                'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  // Movimientos
  'Entrada':              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Salida':               'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  'Ajuste':               'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'Transferencia':        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
}

const StatusBadge = ({ status, className = '' }) => {
  const style = PRESETS[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}>
      {status}
    </span>
  )
}

export default StatusBadge
