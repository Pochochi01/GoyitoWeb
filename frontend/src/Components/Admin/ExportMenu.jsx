import React, { useState } from 'react'
import { FiDownload, FiFileText, FiGrid } from 'react-icons/fi'

const ExportMenu = ({ label = 'Exportar' }) => {
  const [open, setOpen] = useState(false)
  const [exported, setExported] = useState(null)

  const handleExport = (type) => {
    setExported(type)
    setOpen(false)
    setTimeout(() => setExported(null), 2500)
  }

  return (
    <div className="relative">
      {exported ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl">
          ✓ Exportado como {exported}
        </span>
      ) : (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600
                       text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800
                       hover:border-primary hover:text-primary transition-all duration-200"
          >
            <FiDownload size={13} /> {label}
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg
                            border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
              <button onClick={() => handleExport('Excel')}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold
                           text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiGrid size={12} /> Excel (.xlsx)
              </button>
              <button onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold
                           text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <FiFileText size={12} /> PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExportMenu
