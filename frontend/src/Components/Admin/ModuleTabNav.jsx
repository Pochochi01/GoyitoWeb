import React from 'react'

const ModuleTabNav = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
          ${active === tab.id
            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        {tab.icon && <span>{tab.icon}</span>}
        {tab.label}
      </button>
    ))}
  </div>
)

export default ModuleTabNav
