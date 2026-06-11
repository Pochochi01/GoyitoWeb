import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar    from '../Components/NavBar/NavBar.jsx'
import Footer    from '../Components/Footer/Footer.jsx'
import CartItem  from '../Components/Cart/CartItem.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import salesOrderService from '../api/services/salesOrderService'
import paymentService    from '../api/services/paymentService'
import {
  FiShoppingBag, FiTrash2, FiCheckCircle, FiAlertCircle,
  FiPackage, FiCalendar, FiUser, FiCreditCard, FiX,
} from 'react-icons/fi'
import { FaCartShopping } from 'react-icons/fa6'

// ─── Precio unitario con descuento ───────────────────────────
const unitPrice = (item) =>
  item.discount > 0 ? +(item.price * (1 - item.discount / 100)).toFixed(2) : item.price

// ─── Componente: selector de método de pago ──────────────────
function PaymentMethodSelector({ selected, onChange }) {
  const methods = [
    {
      id:      'Efectivo',
      label:   'Efectivo',
      desc:    'Pago contra entrega al recibir el pedido',
      icon:    '💵',
      color:   'border-green-400 bg-green-50 dark:bg-green-900/20',
      active:  'ring-2 ring-green-400',
    },
    {
      id:      'MercadoPago',
      label:   'MercadoPago',
      desc:    'Tarjeta de crédito, débito o efectivo vía MP',
      icon:    '💳',
      color:   'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
      active:  'ring-2 ring-blue-400',
    },
  ]

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Método de pago
      </p>
      <div className="grid grid-cols-2 gap-2">
        {methods.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex flex-col items-center justify-center gap-1.5 p-4 min-h-[96px] rounded-xl border-2 transition-all duration-200 text-center
              ${selected === m.id ? `${m.color} ${m.active}` : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-xs font-bold text-gray-800 dark:text-white">{m.label}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Pantalla de confirmación (Efectivo) ─────────────────────
function ConfirmacionEfectivo({ orderDone, cartSnapshot }) {
  const items     = orderDone.items || cartSnapshot
  const subtotal  = items.reduce(
    (s, i) => s + (Number(i.precio_unit ?? i.price) * Number(i.cantidad ?? i.quantity)), 0
  )
  const envio = subtotal > 0 && subtotal < 500 ? 15 : 0

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <FiCheckCircle className="text-green-500" size={36}/>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">¡Pedido confirmado!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Tu orden fue registrada exitosamente.</p>
      </div>

      {/* Encabezado orden */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">
            Orden <span className="text-primary">#{orderDone.id}</span>
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            {orderDone.estado || 'Pendiente'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FiCalendar size={14} className="text-gray-400 mt-0.5"/>
            <div><p className="text-xs text-gray-400">Fecha</p>
              <p className="font-semibold dark:text-white">{orderDone.fecha || new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FiCreditCard size={14} className="text-gray-400 mt-0.5"/>
            <div><p className="text-xs text-gray-400">Pago</p>
              <p className="font-semibold dark:text-white">💵 {orderDone.metodo_pago || 'Efectivo'}</p>
            </div>
          </div>
          {orderDone.cliente_nombre && (
            <div className="flex items-start gap-2">
              <FiUser size={14} className="text-gray-400 mt-0.5"/>
              <div><p className="text-xs text-gray-400">Cliente</p>
                <p className="font-semibold dark:text-white truncate">{orderDone.cliente_nombre}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-800 dark:text-white text-sm">Productos ({items.length})</h4>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {items.map((item, i) => {
            const nombre  = item.nombre_producto || item.title || '—'
            const cant    = item.cantidad ?? item.quantity
            const precio  = Number(item.precio_unit ?? item.price)
            const imgSrc  = item.images?.[0] || null
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                {imgSrc ? (
                  <picture><source srcSet={imgSrc} type="image/webp"/>
                    <img src={imgSrc} alt={nombre} className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-50"/>
                  </picture>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <FiPackage size={18} className="text-gray-400"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{nombre}</p>
                  <p className="text-xs text-gray-400">x{cant} · ${precio.toLocaleString()} c/u</p>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">${(precio * cant).toLocaleString()}</span>
              </div>
            )
          })}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
          {envio > 0 && (
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Envío</span><span>${envio.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base">
            <span className="text-gray-800 dark:text-white">Total</span>
            <span className="text-primary">${(subtotal + envio).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/tienda"
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-colors">
          <FiShoppingBag size={16}/> Seguir comprando
        </Link>
        <Link to="/"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold py-3 rounded-full hover:border-primary hover:text-primary transition-colors">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

// ─── Modal de confirmación previa al checkout ─────────────────
function ConfirmCheckoutModal({ open, onClose, onConfirm, items, total, shipping, metodoPago, loading, error }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">Confirmar pedido</h3>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40">
            <FiX size={20}/>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {metodoPago === 'MercadoPago'
              ? 'Vas a ser redirigido a MercadoPago para completar el pago. La orden se registrará automáticamente una vez que el pago se apruebe.'
              : 'Al confirmar, se registrará tu pedido y nos pondremos en contacto para coordinar la entrega y el pago en efectivo.'}
          </p>

          {/* Resumen de items */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl divide-y divide-gray-100 dark:divide-gray-700 max-h-48 overflow-y-auto">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 text-sm">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-gray-800 dark:text-white truncate">{it.nombre_producto}</p>
                  <p className="text-xs text-gray-400">x{it.cantidad} · ${it.precio_unit.toLocaleString()} c/u</p>
                </div>
                <span className="font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  ${(it.precio_unit * it.cantidad).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="flex flex-col gap-1 text-sm">
            {shipping > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Envío</span><span>${shipping.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-gray-800 dark:text-white">Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={14}/>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 min-h-[44px]">
              Cancelar
            </button>
            <button type="button" onClick={onConfirm} disabled={loading}
              className={`flex-1 py-2.5 rounded-full text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors min-h-[44px]
                ${metodoPago === 'MercadoPago' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-red-600'}`}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : metodoPago === 'MercadoPago' ? 'Continuar a MercadoPago' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
const Carrito = () => {
  const { cart, clearCart, cartTotal } = useCart()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [metodoPago,   setMetodoPago]   = useState('Efectivo')
  const [checking,     setChecking]     = useState(false)
  const [error,        setError]        = useState('')
  const [orderDone,    setOrderDone]    = useState(null)
  const [cartSnapshot, setCartSnapshot] = useState([])
  const [confirmOpen,  setConfirmOpen]  = useState(false)

  const shipping = cartTotal > 0 && cartTotal < 500 ? 15 : 0
  const total    = cartTotal + shipping

  // Items normalizados para mostrar en el modal y mandar al backend
  const itemsPayload = cart.map(item => ({
    producto_id:     item.id,
    nombre_producto: item.title,
    cantidad:        item.quantity,
    precio_unit:     unitPrice(item),
  }))

  // Abre el modal de confirmación. La orden NO se crea hasta confirmar.
  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    if (!cart.length) return
    setError('')
    setConfirmOpen(true)
  }

  // Confirmado por el usuario → procesar según método de pago.
  const handleConfirm = async () => {
    setChecking(true)
    setError('')

    const snapshot = [...cart]
    setCartSnapshot(snapshot)

    try {
      if (metodoPago === 'MercadoPago') {
        // ── Flujo MP: solo iniciamos la preferencia. La orden se crea
        //    cuando el pago vuelva aprobado (vía sync desde PagoExito).
        const result = await paymentService.initMP({
          items: itemsPayload,
          canal: 'E-commerce',
          payer: user?.email ? { email: user.email } : undefined,
        })

        // Limpiar carrito antes de redirigir a MP
        clearCart()

        const redirectUrl = import.meta.env.DEV
          ? result.sandbox_init_point
          : result.init_point

        window.location.href = redirectUrl

      } else {
        // ── Flujo Efectivo: el modal ya hizo de confirmación,
        //    creamos la orden ahora.
        const sale = await salesOrderService.create({
          canal:       'E-commerce',
          metodo_pago: 'Efectivo',
          items:       itemsPayload,
        })
        clearCart()
        setConfirmOpen(false)
        setOrderDone(sale)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error al procesar la compra. Intentá de nuevo.')
    } finally {
      setChecking(false)
    }
  }

  // ── Confirmación Efectivo ────────────────────────────────────
  if (orderDone) {
    return (
      <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 py-10">
            <div className="container text-center">
              <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                <FaCartShopping className="text-primary"/>
                Mi <span className="text-primary">Carrito</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pedido realizado con éxito</p>
            </div>
          </section>
          <section className="py-10">
            <div className="container">
              <ConfirmacionEfectivo orderDone={orderDone} cartSnapshot={cartSnapshot}/>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Carrito vacío ────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-gray-800 dark:to-gray-900 py-10">
            <div className="container text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
                <FaCartShopping className="text-primary"/> Mi <span className="text-primary">Carrito</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Tu carrito está vacío</p>
            </div>
          </section>
          <section className="py-10">
            <div className="container flex flex-col items-center justify-center py-16 gap-6 text-center">
              <FiShoppingBag className="text-gray-200 dark:text-gray-700" size={100}/>
              <div>
                <p className="text-xl font-semibold text-gray-400 dark:text-gray-500">No hay productos en el carrito</p>
                <p className="text-sm text-gray-400 mt-1">Agregá productos desde la tienda para verlos aquí</p>
              </div>
              <Link to="/tienda" className="bg-primary hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">
                Ir a la Tienda
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Carrito con productos ────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-gray-800 dark:to-gray-900 py-10">
          <div className="container text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
              <FaCartShopping className="text-primary"/> Mi <span className="text-primary">Carrito</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {cart.reduce((s, i) => s + i.quantity, 0)} producto{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* ── Lista de productos ── */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Productos</h2>
                  <button onClick={clearCart}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
                    <FiTrash2 size={14}/> Vaciar carrito
                  </button>
                </div>
                {cart.map(item => <CartItem key={item.id} item={item}/>)}
                <Link to="/tienda" className="self-start mt-2 text-sm text-primary hover:underline">
                  ← Seguir comprando
                </Link>
              </div>

              {/* ── Panel de pago ── */}
              <div className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 lg:sticky lg:top-24 flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Resumen del pedido</h2>

                  {/* Totales */}
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Envío</span>
                      <span>
                        {shipping === 0
                          ? <span className="text-green-500 font-semibold">Gratis</span>
                          : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping > 0 && <p className="text-xs text-gray-400">Gratis en compras mayores a $500</p>}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-1 flex justify-between font-bold text-base text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Selector de método de pago */}
                  <PaymentMethodSelector selected={metodoPago} onChange={setMetodoPago}/>

                  {/* Info extra por método */}
                  {metodoPago === 'MercadoPago' && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2.5 leading-relaxed">
                      Serás redirigido al sitio de <strong>MercadoPago</strong> para completar el pago de forma segura.
                      Podés pagar con tarjeta, débito o efectivo.
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                      <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={14}/>
                      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Botón principal — abre modal de confirmación */}
                  <button
                    onClick={handleCheckoutClick}
                    disabled={checking}
                    className={`w-full font-semibold py-3.5 rounded-full transition-all duration-200
                                flex items-center justify-center gap-2 text-sm disabled:opacity-60
                                ${metodoPago === 'MercadoPago'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-primary hover:bg-red-600 text-white'}`}
                  >
                    {checking ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Procesando…</>
                    ) : metodoPago === 'MercadoPago' ? (
                      <>💳 Pagar con MercadoPago · ${total.toFixed(2)}</>
                    ) : (
                      <><FaCartShopping/> Finalizar compra · ${total.toFixed(2)}</>
                    )}
                  </button>

                  {!user && (
                    <p className="text-xs text-gray-400 text-center">
                      <Link to="/login" className="text-primary underline">Iniciá sesión</Link> para comprar
                    </p>
                  )}

                  <p className="text-xs text-gray-400 text-center">Pago seguro · SSL encriptado</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de confirmación previo al checkout */}
      <ConfirmCheckoutModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        items={itemsPayload}
        total={total}
        shipping={shipping}
        metodoPago={metodoPago}
        loading={checking}
        error={error}
      />
    </div>
  )
}

export default Carrito
