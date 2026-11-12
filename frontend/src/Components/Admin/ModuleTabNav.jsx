import React from 'react'

// En mobile las pestañas scrollean horizontalmente (una sola fila) en vez de envolver.
const ModuleTabNav = ({ tabs, active, onChange }) => (
  <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div role="tablist" className="inline-flex sm:flex sm:flex-wrap gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 min-w-max sm:min-w-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-200
            ${active === tab.id
              ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  </div>
)

export default ModuleTabNav
