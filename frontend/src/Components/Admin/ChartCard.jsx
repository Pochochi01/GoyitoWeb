import React from 'react'

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className}`}>
    <div className="mb-4">
      <h4 className="font-bold text-gray-800 dark:text-white text-sm">{title}</h4>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
)

export default ChartCard
