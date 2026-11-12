import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

/**
 * Modal de administración.
 * - Mobile (<sm): bottom sheet (sube desde abajo, 92dvh máx).
 * - Desktop: diálogo centrado con pop-in sutil.
 * - Cuerpo con scroll propio; footer fijo con safe-area → el teclado virtual
 *   nunca tapa el botón de guardar.
 * - Escape / click en el fondo cierran, salvo mientras `busy`.
 *
 * Si se pasa `onSubmit`, el contenido se envuelve en un <form> y el footer
 * queda dentro (los botones type="submit" funcionan).
 */
export default function AdminModal({
  title, onClose, onSubmit, busy = false, footer, children,
  maxWidth = 'sm:max-w-lg', error,
}) {
  const busyRef = useRef(busy)
  busyRef.current = busy

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busyRef.current) onClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const Wrapper = onSubmit ? 'form' : 'div'
  const wrapperProps = onSubmit
    ? { onSubmit: (e) => { e.preventDefault(); if (!busyRef.current) onSubmit(e) }, noValidate: true }
    : {}

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 animate-[fadeIn_200ms_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busyRef.current) onClose() }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
        className={`relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full ${maxWidth}
                    max-h-[92dvh] sm:max-h-[90vh] flex flex-col
                    animate-[sheetUp_320ms_cubic-bezier(0.32,0.72,0,1)] sm:animate-[popIn_220ms_cubic-bezier(0.22,1,0.36,1)]`}
      >
        <div className="sm:hidden absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"/>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 sm:py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h3 className="font-bold text-gray-800 dark:text-white min-w-0 truncate">{title}</h3>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar"
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:opacity-40 transition-colors flex-shrink-0">
            <FiX size={20}/>
          </button>
        </div>

        <Wrapper {...wrapperProps} className="flex flex-col min-h-0 flex-1">
          <div className="px-5 py-5 flex flex-col gap-5 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>
          {(footer || error) && (
            <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-gray-800 sm:rounded-b-2xl">
              {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 mb-3">{error}</p>
              )}
              {footer}
            </div>
          )}
        </Wrapper>
      </div>
    </div>,
    document.body
  )
}

/** Footer estándar Cancelar / Guardar */
export function ModalActions({ onCancel, busy, submitLabel = 'Guardar', busyLabel = 'Guardando…', danger = false, onSubmitClick }) {
  return (
    <div className="flex gap-3">
      <button type="button" onClick={onCancel} disabled={busy}
        className="flex-1 min-h-[44px] rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-[background-color,transform] active:scale-[0.97]">
        Cancelar
      </button>
      <button type={onSubmitClick ? 'button' : 'submit'} onClick={onSubmitClick} disabled={busy} aria-busy={busy}
        className={`flex-1 min-h-[44px] rounded-full text-white text-sm font-semibold disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-[0.97]
          ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-red-600'}`}>
        {busy && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
        {busy ? busyLabel : submitLabel}
      </button>
    </div>
  )
}

/** Mensaje de error legible a partir de un error de axios */
export function apiErrorMessage(err, fallback = 'Ocurrió un error') {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.request && !err?.response) return 'Sin conexión con el servidor. Reintentá.'
  return fallback
}
