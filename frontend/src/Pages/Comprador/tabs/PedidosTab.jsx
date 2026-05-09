import React, { useState, useEffect, useCallback } from 'react'
import { FiPackage, FiChevronDown, FiChevronUp, FiStar, FiX, FiCheck } from 'react-icons/fi'
import api from '../../../api/axios'
import reviewService from '../../../api/services/reviewService'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// ─── Timeline de seguimiento ──────────────────────────────────
const STEPS = [
  { key: 'Pendiente',  label: 'Pendiente',  desc: 'Orden registrada' },
  { key: 'Pagada',     label: 'Pagada',     desc: 'Pago confirmado'  },
  { key: 'Enviada',    label: 'En camino',  desc: 'Pedido en camino' },
  { key: 'Entregada',  label: 'Entregada',  desc: 'Pedido entregado' },
]
const CANCELLED = 'Cancelada'

function OrderTimeline({ estado }) {
  if (estado === CANCELLED) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 font-semibold">
        <FiX size={16}/> Orden cancelada
      </div>
    )
  }
  const currentIdx = STEPS.findIndex(s => s.key === estado)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                {done ? <FiCheck size={13}/> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight
                ${current ? 'text-primary' : done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 transition-all ${i < currentIdx ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}/>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Modal de reseña ──────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [reseña,  setReseña]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!rating) { setError('Seleccioná una calificación'); return }
    setLoading(true)
    try {
      await reviewService.create({ orden_id: order.id, rating, reseña: reseña.trim() || null })
      onSubmitted()
      onClose()
    } catch (e) { setError(e.response?.data?.message || 'Error al enviar la reseña') }
    finally { setLoading(false) }
  }

  const starClass = (i) => {
    const filled = i <= (hover || rating)
    return `text-2xl cursor-pointer transition-all ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`
  }

  const ratingLabels = ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Calificá tu compra</h3>
            <p className="text-xs text-gray-400 mt-0.5">Orden #{order.id} · {order.fecha}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Productos de la orden */}
          {order.items?.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Productos comprados</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                  {item.imagen && (
                    <img src={`${BASE}/${item.imagen}`} alt={item.titulo} className="w-10 h-10 object-cover rounded-lg flex-shrink-0"/>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{item.titulo || item.nombre_producto}</p>
                    <p className="text-xs text-gray-400">x{item.cantidad} · ${Number(item.precio_unit).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estrellas */}
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">¿Cómo calificás esta compra?</p>
            <div className="flex items-center justify-center gap-2">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button"
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                  onClick={() => { setRating(i); setError('') }}
                  className={starClass(i)}>
                  <FiStar className={`${i <= (hover || rating) ? 'fill-yellow-400' : ''}`} size={32}/>
                </button>
              ))}
            </div>
            {(hover || rating) > 0 && (
              <p className="text-sm font-semibold text-yellow-500 mt-2">{ratingLabels[hover || rating]}</p>
            )}
          </div>

          {/* Reseña opcional */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Reseña <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={reseña}
              onChange={e => setReseña(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Contá tu experiencia con el producto y la entrega…"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-right text-[10px] text-gray-400 mt-0.5">{reseña.length}/500</p>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Ahora no
            </button>
            <button onClick={handleSubmit} disabled={loading || !rating}
              className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiStar size={13}/> Publicar reseña</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de orden ─────────────────────────────────────────
function OrderCard({ order, onReviewed }) {
  const [open,         setOpen]         = useState(false)
  const [reviewModal,  setReviewModal]  = useState(false)

  const canReview = order.estado === 'Entregada' && !order.ya_reseñado

  const statusColor = {
    Pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Pagada:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Enviada:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Entregada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelada: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header de la orden */}
        <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          onClick={() => setOpen(v => !v)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiPackage className="text-primary" size={18}/>
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-sm">Orden #{order.id}</p>
              <p className="text-xs text-gray-400">{order.fecha} · {order.metodo_pago}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-primary">${Number(order.total).toLocaleString()}</p>
              <p className="text-xs text-gray-400">{order.items?.length} ítem{order.items?.length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.estado] || 'bg-gray-100 text-gray-600'}`}>
              {order.estado}
            </span>
            {open ? <FiChevronUp size={16} className="text-gray-400"/> : <FiChevronDown size={16} className="text-gray-400"/>}
          </div>
        </div>

        {/* Detalle expandible */}
        {open && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            {/* Seguimiento */}
            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700/20">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Seguimiento</p>
              <OrderTimeline estado={order.estado}/>
            </div>

            {/* Productos */}
            {order.items?.length > 0 && (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    {item.imagen ? (
                      <img src={`${BASE}/${item.imagen}`} alt={item.titulo} className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-50"/>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <FiPackage size={16} className="text-gray-400"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.titulo || item.nombre_producto}</p>
                      <p className="text-xs text-gray-400">x{item.cantidad} · ${Number(item.precio_unit).toLocaleString()} c/u</p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white text-sm">${Number(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Canal: {order.canal}</p>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">${Number(order.total).toLocaleString()}</span>
                {canReview && (
                  <button onClick={() => setReviewModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full text-xs font-semibold transition-colors">
                    <FiStar size={12}/> Calificar
                  </button>
                )}
                {order.ya_reseñado && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <FiCheck size={12}/> Calificada
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {reviewModal && (
        <ReviewModal
          order={order}
          onClose={() => setReviewModal(false)}
          onSubmitted={() => { onReviewed(order.id); setReviewModal(false) }}
        />
      )}
    </>
  )
}

// ─── Tab de pedidos ───────────────────────────────────────────
export default function PedidosTab() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/customers/me/orders')
      setOrders(data)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleReviewed = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ya_reseñado: true } : o))
    showToast('¡Gracias por tu reseña!')
  }

  const pendientes  = orders.filter(o => ['Pendiente','Pagada','Enviada'].includes(o.estado))
  const entregadas  = orders.filter(o => o.estado === 'Entregada')
  const canceladas  = orders.filter(o => o.estado === 'Cancelada')

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
    </div>
  )

  if (orders.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <FiPackage size={48} className="mx-auto mb-3 opacity-20"/>
      <p className="text-lg font-semibold">Todavía no realizaste compras</p>
      <p className="text-sm mt-1">Explorá la tienda y hacé tu primer pedido</p>
    </div>
  )

  const Section = ({ title, items, emptyMsg }) => items.length === 0 ? null : (
    <div>
      <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{items.length}</span>
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {items.map(o => <OrderCard key={o.id} order={o} onReviewed={handleReviewed}/>)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {toast && <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}
      <Section title="En progreso"   items={pendientes}/>
      <Section title="Entregadas"    items={entregadas}/>
      <Section title="Canceladas"    items={canceladas}/>
    </div>
  )
}
