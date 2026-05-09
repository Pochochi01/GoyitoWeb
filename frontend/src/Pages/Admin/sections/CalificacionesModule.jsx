import React, { useState, useEffect, useRef } from 'react'
import {
  FiStar, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiMessageSquare, FiTrendingUp, FiTrendingDown, FiMinus,
  FiAlertCircle, FiClock, FiPackage,
} from 'react-icons/fi'
import reviewService from '../../../api/services/reviewService'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0)

function fmtDate(raw) {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function fmtDateTime(raw) {
  if (!raw) return '—'
  return new Date(raw).toLocaleString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtMoney(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <FiStar
          key={i}
          size={size}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}
          style={i <= rating ? { fill: '#facc15' } : {}}
        />
      ))}
    </div>
  )
}

function PromedioCircle({ value }) {
  const v = +value || 0
  const color = v >= 4 ? '#22c55e' : v >= 3 ? '#eab308' : '#ef4444'
  const dash  = (v / 5) * 100
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${dash} 100`}
            strokeLinecap="round"/>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold"
          style={{ color }}>
          {v > 0 ? v.toFixed(1) : '—'}
        </span>
      </div>
      <Stars rating={Math.round(v)} size={12}/>
      <p className="text-xs text-gray-400">Promedio</p>
    </div>
  )
}

function KpiCards({ summary, pendingTotal }) {
  const total     = +summary.total     || 0
  const positivas = +summary.positivas || 0
  const neutrales = +summary.neutrales || 0
  const negativas = +summary.negativas || 0

  const cards = [
    {
      label: 'Positivas',    sub: '> 3 estrellas',  value: positivas,
      pct: pct(positivas, total), emoji: '😊',
      barCls: 'bg-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      valCls: 'text-green-600 dark:text-green-400',
      badgeCls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Neutrales',   sub: '= 3 estrellas',   value: neutrales,
      pct: pct(neutrales, total), emoji: '😐',
      barCls: 'bg-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      valCls: 'text-yellow-600 dark:text-yellow-400',
      badgeCls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      label: 'Negativas',   sub: '< 3 estrellas',   value: negativas,
      pct: pct(negativas, total), emoji: '😞',
      barCls: 'bg-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      valCls: 'text-red-500 dark:text-red-400',
      badgeCls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      label: 'Sin calificar', sub: 'Entregadas sin reseña', value: pendingTotal,
      pct: null, emoji: '⏳',
      barCls: 'bg-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-700/40',
      valCls: 'text-gray-600 dark:text-gray-300',
      badgeCls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`rounded-2xl border border-gray-100 dark:border-gray-700 p-5 ${c.bg}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {c.emoji} {c.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
            {c.pct !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badgeCls}`}>
                {c.pct}%
              </span>
            )}
          </div>
          <p className={`text-4xl font-bold mt-3 ${c.valCls}`}>{c.value}</p>
          {c.pct !== null && (
            <div className="mt-3 h-1.5 bg-white/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${c.barCls}`}
                style={{ width: `${c.pct}%` }}/>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StarDistribution({ summary }) {
  const total = +summary.total || 1
  const bars = [
    { n: 5, count: +summary.r5 || 0, color: 'bg-green-500' },
    { n: 4, count: +summary.r4 || 0, color: 'bg-green-400' },
    { n: 3, count: +summary.r3 || 0, color: 'bg-yellow-400' },
    { n: 2, count: +summary.r2 || 0, color: 'bg-orange-400' },
    { n: 1, count: +summary.r1 || 0, color: 'bg-red-500'   },
  ]
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Distribución de estrellas</h3>
      <div className="flex items-start gap-6">
        <PromedioCircle value={+(+summary.promedio || 0).toFixed(2)}/>
        <div className="flex-1 flex flex-col gap-2">
          {bars.map(s => {
            const p = pct(s.count, total)
            return (
              <div key={s.n} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-10 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{s.n}</span>
                  <FiStar size={10} className="text-yellow-400" style={{ fill: '#facc15' }}/>
                </div>
                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${s.color}`}
                    style={{ width: `${p}%` }}/>
                </div>
                <div className="w-16 flex items-center justify-between gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{s.count}</span>
                  <span className="text-[10px] text-gray-400">({p}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function QuickInsights({ summary }) {
  const promedio  = +(+summary.promedio || 0)
  const negativas = +(+summary.negativas || 0)
  const total     = +(+summary.total || 0)

  const items = [
    {
      label: 'Satisfacción general',
      value: total > 0
        ? promedio >= 4 ? 'Alta ✓' : promedio >= 3 ? 'Media ~' : 'Baja ✗'
        : '—',
      cls: promedio >= 4 ? 'text-green-600' : promedio >= 3 ? 'text-yellow-600' : 'text-red-500',
    },
    { label: 'Reseñas positivas',    value: `${pct(+summary.positivas, total)}% del total`,  cls: 'text-gray-800 dark:text-white' },
    { label: 'Requieren atención',   value: `${negativas} negativa${negativas !== 1 ? 's' : ''}`, cls: negativas > 0 ? 'text-red-500' : 'text-green-600' },
    { label: 'Promedio de calificación', value: total > 0 ? `${promedio.toFixed(2)} / 5.00` : '—', cls: 'text-primary' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-700 dark:text-white">Análisis rápido</h3>
      {items.map(it => (
        <div key={it.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">{it.label}</span>
          <span className={`text-sm font-bold ${it.cls}`}>{it.value}</span>
        </div>
      ))}
      {negativas > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-xs text-red-600 dark:text-red-400">
          <p className="font-semibold mb-0.5">⚠️ Hay reseñas negativas pendientes de revisión</p>
          <p>Filtrá por "Negativas" para revisar y tomar acciones.</p>
        </div>
      )}
    </div>
  )
}

function SentimentBadge({ rating }) {
  if (rating > 3) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">😊 Positiva</span>
  if (rating < 3) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">😞 Negativa</span>
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">😐 Neutral</span>
}

function CanBadge({ canal }) {
  const isPOS = canal === 'POS'
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isPOS ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
      {canal || '—'}
    </span>
  )
}

function ReviewCard({ review }) {
  const borderColor = review.rating > 3 ? 'border-l-green-400' : review.rating < 3 ? 'border-l-red-400' : 'border-l-yellow-400'
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} p-5`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {(review.usuario_nombre || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">{review.usuario_nombre || 'Sin nombre'}</p>
            <p className="text-xs text-gray-400">{review.usuario_email || '—'}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Stars rating={review.rating} size={14}/>
              <SentimentBadge rating={review.rating}/>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">Orden #{review.orden_id}</p>
          <p className="text-xs text-gray-400">{fmtDate(review.orden_fecha)}</p>
          <CanBadge canal={review.canal}/>
        </div>
      </div>
      {review.productos && (
        <div className="mt-3 flex items-start gap-2">
          <FiPackage size={12} className="text-gray-400 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.productos}</p>
        </div>
      )}
      {review.reseña ? (
        <div className="mt-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <FiMessageSquare size={13} className="text-gray-400 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">&ldquo;{review.reseña}&rdquo;</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400 italic">Sin comentario escrito</p>
      )}
      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-3 text-right">{fmtDateTime(review.created_at)}</p>
    </div>
  )
}

function PendingCard({ order }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-gray-300 dark:border-l-gray-500 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
            {(order.usuario_nombre || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">{order.usuario_nombre || 'Sin nombre'}</p>
            <p className="text-xs text-gray-400">{order.usuario_email || '—'}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <FiClock size={9}/> Sin calificar
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">Orden #{order.id}</p>
          <p className="text-xs text-gray-400">{fmtDate(order.fecha)}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <CanBadge canal={order.canal}/>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{fmtMoney(order.total)}</span>
          </div>
        </div>
      </div>
      {order.productos && (
        <div className="mt-3 flex items-start gap-2">
          <FiPackage size={12} className="text-gray-400 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{order.productos}</p>
        </div>
      )}
    </div>
  )
}

function Pagination({ page, totalPages, loading, onChange }) {
  if (totalPages <= 1) return null
  const pages = []
  let start = Math.max(1, page - 3)
  let end   = Math.min(totalPages, start + 6)
  if (end - start < 6) start = Math.max(1, end - 6)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      <button onClick={() => onChange(page - 1)} disabled={page === 1 || loading}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
        <FiChevronLeft size={13}/> Anterior
      </button>
      <div className="flex gap-1">
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === p ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
            {p}
          </button>
        ))}
      </div>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages || loading}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
        Siguiente <FiChevronRight size={13}/>
      </button>
    </div>
  )
}

// ─── Módulo principal ─────────────────────────────────────────────────────────

const GRUPOS = [
  { id: '',           label: 'Todas',            emoji: '🌟' },
  { id: 'positivas',  label: '> 3★ Positivas',   emoji: '😊' },
  { id: 'neutrales',  label: '= 3★ Neutrales',   emoji: '😐' },
  { id: 'negativas',  label: '< 3★ Negativas',   emoji: '😞' },
]

const TABS = [
  { id: 'calificadas',   label: 'Calificaciones',  icon: FiStar    },
  { id: 'sin_calificar', label: 'Sin calificar',   icon: FiClock   },
]

const LIMIT = 10

export default function CalificacionesModule() {
  // ── Resumen ─────────────────────────────────────────────────
  const [summary,      setSummary]      = useState(null)
  const [summaryError, setSummaryError] = useState(null)

  // ── Pestaña activa ──────────────────────────────────────────
  const [tab, setTab] = useState('calificadas')

  // ── Reviews calificadas ─────────────────────────────────────
  const [reviews,    setReviews]    = useState([])
  const [revTotal,   setRevTotal]   = useState(0)
  const [revPage,    setRevPage]    = useState(1)
  const [revLoading, setRevLoading] = useState(false)
  const [revError,   setRevError]   = useState(null)
  const [grupo,      setGrupo]      = useState('')
  const [revSearch,  setRevSearch]  = useState('')

  // ── Órdenes sin calificar ───────────────────────────────────
  const [pending,     setPending]     = useState([])
  const [pendTotal,   setPendTotal]   = useState(0)
  const [pendPage,    setPendPage]    = useState(1)
  const [pendLoading, setPendLoading] = useState(false)
  const [pendError,   setPendError]   = useState(null)
  const [pendSearch,  setPendSearch]  = useState('')

  // ── Refs para debounce ──────────────────────────────────────
  const revSearchTimer  = useRef(null)
  const pendSearchTimer = useRef(null)

  // ── Carga resumen ───────────────────────────────────────────
  const loadSummary = async () => {
    setSummaryError(null)
    try {
      const data = await reviewService.getSummary()
      setSummary(data)
    } catch (err) {
      setSummaryError('No se pudo cargar el resumen.')
      console.error('CalificacionesModule getSummary:', err)
    }
  }

  // ── Carga reviews calificadas ───────────────────────────────
  const loadReviews = async ({ page = revPage, g = grupo, q = revSearch } = {}) => {
    setRevLoading(true)
    setRevError(null)
    try {
      const params = { page, limit: LIMIT }
      if (g)       params.grupo  = g
      if (q.trim()) params.search = q.trim()
      const res = await reviewService.getAll(params)
      setReviews(res.data   ?? [])
      setRevTotal(res.total ?? 0)
    } catch (err) {
      setRevError('No se pudo cargar las calificaciones.')
      console.error('CalificacionesModule getAll:', err)
    } finally {
      setRevLoading(false)
    }
  }

  // ── Carga órdenes sin calificar ─────────────────────────────
  const loadPending = async ({ page = pendPage, q = pendSearch } = {}) => {
    setPendLoading(true)
    setPendError(null)
    try {
      const params = { page, limit: LIMIT }
      if (q.trim()) params.search = q.trim()
      const res = await reviewService.getPending(params)
      setPending(res.data   ?? [])
      setPendTotal(res.total ?? 0)
    } catch (err) {
      setPendError('No se pudo cargar las órdenes pendientes.')
      console.error('CalificacionesModule getPending:', err)
    } finally {
      setPendLoading(false)
    }
  }

  // ── Carga inicial ───────────────────────────────────────────
  useEffect(() => {
    loadSummary()
    loadReviews({ page: 1 })
    loadPending({ page: 1 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cambio de grupo ─────────────────────────────────────────
  const handleGrupo = (g) => {
    setGrupo(g)
    setRevPage(1)
    loadReviews({ page: 1, g })
  }

  // ── Cambio de página reviews ────────────────────────────────
  const handleRevPage = (p) => {
    setRevPage(p)
    loadReviews({ page: p })
  }

  // ── Búsqueda reviews con debounce ───────────────────────────
  const handleRevSearch = (val) => {
    setRevSearch(val)
    clearTimeout(revSearchTimer.current)
    revSearchTimer.current = setTimeout(() => {
      setRevPage(1)
      loadReviews({ page: 1, q: val })
    }, 350)
  }

  // ── Cambio de página pending ────────────────────────────────
  const handlePendPage = (p) => {
    setPendPage(p)
    loadPending({ page: p })
  }

  // ── Búsqueda pending con debounce ───────────────────────────
  const handlePendSearch = (val) => {
    setPendSearch(val)
    clearTimeout(pendSearchTimer.current)
    pendSearchTimer.current = setTimeout(() => {
      setPendPage(1)
      loadPending({ page: 1, q: val })
    }, 350)
  }

  const handleRefresh = () => {
    loadSummary()
    if (tab === 'calificadas')   loadReviews({ page: revPage })
    else                         loadPending({ page: pendPage })
  }

  const revPages  = Math.ceil(revTotal  / LIMIT)
  const pendPages = Math.ceil(pendTotal / LIMIT)

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      {summaryError ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
          <FiAlertCircle size={16}/> {summaryError}
        </div>
      ) : summary ? (
        <KpiCards summary={summary} pendingTotal={pendTotal}/>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>
          ))}
        </div>
      )}

      {/* ── Distribución + insight ─────────────────────────────── */}
      {summary && +summary.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <StarDistribution summary={summary}/>
          <QuickInsights    summary={summary}/>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab === t.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <t.icon size={14}/>
              {t.label}
              {t.id === 'calificadas' && revTotal > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${tab === t.id ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                  {revTotal}
                </span>
              )}
              {t.id === 'sin_calificar' && pendTotal > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${tab === t.id ? 'bg-primary/20 text-primary' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                  {pendTotal}
                </span>
              )}
            </button>
          ))}
          <div className="flex-1"/>
          <button onClick={handleRefresh}
            className="px-4 text-gray-400 hover:text-primary transition-colors" title="Recargar">
            <FiRefreshCw size={15}/>
          </button>
        </div>

        {/* ── TAB: Calificaciones ─────────────────────────────── */}
        {tab === 'calificadas' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={revSearch} onChange={e => handleRevSearch(e.target.value)}
                  placeholder="Buscar por usuario o texto de reseña…"
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GRUPOS.map(g => (
                  <button key={g.id} onClick={() => handleGrupo(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                      ${grupo === g.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                    {g.emoji} {g.label}
                    {summary && g.id && (
                      <span className={`ml-1.5 font-bold ${grupo === g.id ? 'text-white/80' : 'text-gray-400'}`}>
                        ({+summary[g.id] || 0})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contador */}
            <p className="text-xs text-gray-400 px-1">
              {revTotal} reseña{revTotal !== 1 ? 's' : ''}
              {grupo ? ` · ${GRUPOS.find(g => g.id === grupo)?.label}` : ''}
              {revSearch ? ` · Búsqueda: "${revSearch}"` : ''}
            </p>

            {/* Lista */}
            {revError ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle size={16}/> {revError}
              </div>
            ) : revLoading ? (
              <div className="flex justify-center py-12">
                <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiStar size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-base font-semibold">No hay reseñas{grupo ? ' en esta categoría' : ''}</p>
                <p className="text-sm mt-1 text-gray-400">
                  {grupo === 'negativas'
                    ? '¡Excelente! No hay calificaciones negativas 🎉'
                    : 'Las reseñas aparecen cuando los compradores califican sus pedidos entregados.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(r => <ReviewCard key={r.id} review={r}/>)}
              </div>
            )}

            <Pagination page={revPage} totalPages={revPages} loading={revLoading} onChange={handleRevPage}/>
          </div>
        )}

        {/* ── TAB: Sin calificar ─────────────────────────────── */}
        {tab === 'sin_calificar' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Búsqueda */}
            <div className="relative max-w-sm">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={pendSearch} onChange={e => handlePendSearch(e.target.value)}
                placeholder="Buscar por usuario o email…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            {/* Contador */}
            <p className="text-xs text-gray-400 px-1">
              {pendTotal} pedido{pendTotal !== 1 ? 's' : ''} entregado{pendTotal !== 1 ? 's' : ''} sin calificar
            </p>

            {/* Lista */}
            {pendError ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle size={16}/> {pendError}
              </div>
            ) : pendLoading ? (
              <div className="flex justify-center py-12">
                <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiClock size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-base font-semibold">¡Todo calificado!</p>
                <p className="text-sm mt-1">No hay pedidos entregados pendientes de calificación.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pending.map(o => <PendingCard key={o.id} order={o}/>)}
              </div>
            )}

            <Pagination page={pendPage} totalPages={pendPages} loading={pendLoading} onChange={handlePendPage}/>
          </div>
        )}
      </div>
    </div>
  )
}
