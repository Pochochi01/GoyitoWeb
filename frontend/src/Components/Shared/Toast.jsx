import React, { useState, useCallback, useRef, useEffect } from 'react'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

/**
 * Toast ligero para módulos de administración.
 *   const { toast, showToast } = useToast()
 *   showToast('Guardado')                  → éxito
 *   showToast('Falló', 'error')            → error
 *   <Toast toast={toast}/>
 */
export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, type, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), duration)
  }, [duration])
  useEffect(() => () => clearTimeout(timer.current), [])
  return { toast, showToast }
}

export default function Toast({ toast }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  return (
    <div
      key={toast.key}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed z-[60] left-4 right-4 top-4 sm:left-auto sm:right-5 sm:top-5 sm:max-w-sm
                 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl
                 bg-gray-900/95 text-white text-sm backdrop-blur
                 animate-[toastIn_240ms_cubic-bezier(0.22,1,0.36,1)]"
    >
      {isError
        ? <FiAlertCircle className="text-red-400 flex-shrink-0" size={16}/>
        : <FiCheckCircle className="text-green-400 flex-shrink-0" size={16}/>}
      <span>{toast.message}</span>
    </div>
  )
}
