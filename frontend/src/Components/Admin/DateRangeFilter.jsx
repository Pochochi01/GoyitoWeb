/**
 * DateRangeFilter — filtro de rango de fechas reutilizable.
 *
 * Props:
 *  startDate / endDate       string YYYY-MM-DD o ''
 *  onStartDate / onEndDate   setters del estado padre
 *  onApply(start, end)       se llama con las fechas ya resueltas (evita stale closure)
 *
 * IMPORTANTE: onApply recibe (start, end) directamente.
 * En el componente padre usá: onApply={(s, e) => load(s, e)}
 */
import React from 'react'
import { FiCalendar, FiX, FiSearch } from 'react-icons/fi'

const inputCls =
  'px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-700 text-gray-800 dark:text-white ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/40'

const fmt = (d) => d.toISOString().split('T')[0]

const SHORTCUTS = [
  {
    label: 'Hoy',
    fn: () => {
      const t = fmt(new Date())
      return [t, t]
    },
  },
  {
    label: 'Esta semana',
    fn: () => {
      const now = new Date()
      const day = now.getDay() || 7            // lunes = 1 … domingo = 7
      const start = new Date(now)
      start.setDate(now.getDate() - day + 1)  // lunes de esta semana
      return [fmt(start), fmt(now)]
    },
  },
  {
    label: 'Este mes',
    fn: () => {
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [fmt(start), fmt(now)]
    },
  },
  {
    label: 'Mes anterior',
    fn: () => {
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end   = new Date(now.getFullYear(), now.getMonth(), 0)  // último día del mes ant.
      return [fmt(start), fmt(end)]
    },
  },
]

export default function DateRangeFilter({ startDate, endDate, onStartDate, onEndDate, onApply }) {
  const hasFilter = Boolean(startDate || endDate)

  /** Aplica un atajo: actualiza estado Y llama onApply con los valores nuevos (no el estado viejo) */
  const applyShortcut = (fn) => {
    const [s, e] = fn()
    onStartDate(s)
    onEndDate(e)
    onApply?.(s, e)          // ← pasa las fechas directamente → sin stale closure
  }

  /** Limpia ambas fechas y recarga */
  const clear = () => {
    onStartDate('')
    onEndDate('')
    onApply?.('', '')        // ← idem
  }

  /** Input "Desde" pierde foco → recarga con el valor actual + endDate */
  const handleStartBlur = (e) => {
    const val = e.target.value
    onStartDate(val)
    onApply?.(val, endDate)
  }

  /** Input "Hasta" pierde foco → recarga con startDate + el valor actual */
  const handleEndBlur = (e) => {
    const val = e.target.value
    onEndDate(val)
    onApply?.(startDate, val)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FiCalendar size={14} className="text-gray-400 flex-shrink-0" />

      {/* Inputs manuales */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={startDate}
          onChange={e => onStartDate(e.target.value)}
          onBlur={handleStartBlur}
          className={inputCls}
          title="Fecha desde"
        />
        <span className="text-gray-400 text-xs">—</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={e => onEndDate(e.target.value)}
          onBlur={handleEndBlur}
          className={inputCls}
          title="Fecha hasta"
        />
      </div>

      {/* Botón Aplicar para inputs manuales */}
      <button
        onClick={() => onApply?.(startDate, endDate)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg
                   bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
        title="Aplicar filtro"
      >
        <FiSearch size={11} /> Aplicar
      </button>

      {/* Atajos rápidos */}
      <div className="flex gap-1 flex-wrap">
        {SHORTCUTS.map(s => (
          <button
            key={s.label}
            onClick={() => applyShortcut(s.fn)}
            className="px-2.5 py-1 text-[10px] font-semibold rounded-lg
                       bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                       hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Limpiar */}
      {hasFilter && (
        <button
          onClick={clear}
          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600
                     transition-colors font-semibold"
        >
          <FiX size={11} /> Limpiar
        </button>
      )}

      {/* Indicador de filtro activo */}
      {hasFilter && (
        <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
          Filtrando: {startDate || '…'} → {endDate || '…'}
        </span>
      )}
    </div>
  )
}
