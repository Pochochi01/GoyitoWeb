import React from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const StatCard = ({ title, value, subtitle, icon, trend, trendLabel, color = 'text-primary', bg = 'bg-primary/10' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <span className={color}>{icon}</span>
        </div>
      )}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
        {trend >= 0 ? '+' : ''}{trend}% {trendLabel && <span className="text-gray-400 font-normal">{trendLabel}</span>}
      </div>
    )}
  </div>
)

export default StatCard
