/**
 * PagoError — Pantalla de pago fallido o cancelado.
 * También sirve como pantalla de pago pendiente (/pago/pendiente).
 *
 * MercadoPago redirige aquí cuando el pago es rechazado o cancelado.
 * El usuario puede intentarlo de nuevo.
 */
import React from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import NavBar  from '../../Components/NavBar/NavBar.jsx'
import Footer  from '../../Components/Footer/Footer.jsx'
import { FiAlertCircle, FiShoppingBag, FiRefreshCw, FiClock } from 'react-icons/fi'

export default function PagoError() {
  const [params]   = useSearchParams()
  const location   = useLocation()

  const isPending  = location.pathname.includes('pendiente')
  const orderId    = params.get('external_reference')
  const paymentId  = params.get('payment_id') || params.get('collection_id')
  const status     = params.get('status') || params.get('collection_status')

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1">
        <section className={`py-12 ${isPending
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900'
          : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900'}`}>
          <div className="container text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5
              ${isPending ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {isPending
                ? <FiClock className="text-yellow-500" size={42}/>
                : <FiAlertCircle className="text-red-500" size={42}/>
              }
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {isPending ? 'Pago pendiente' : 'El pago no se completó'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {isPending
                ? 'Tu pago está siendo revisado. Te avisaremos cuando se acredite. No es necesario realizar el pago nuevamente.'
                : 'Hubo un problema al procesar tu pago. Podés intentarlo de nuevo o elegir otro método de pago.'}
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-lg mx-auto flex flex-col gap-5">

            {/* Info de la transacción */}
            {(orderId || paymentId) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h2 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">Información del intento</h2>
                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {orderId   && <div className="flex justify-between"><span>Nº de orden</span><span className="font-semibold text-gray-800 dark:text-white">#{orderId}</span></div>}
                  {paymentId && <div className="flex justify-between"><span>ID de pago</span><span className="font-mono text-xs text-gray-800 dark:text-white">{paymentId}</span></div>}
                  {status    && <div className="flex justify-between"><span>Estado</span><span className="font-semibold capitalize">{status}</span></div>}
                </div>
              </div>
            )}

            {/* Mensaje de stock */}
            {!isPending && orderId && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold mb-1">¿Qué pasó con mi pedido?</p>
                <p className="text-xs leading-relaxed">
                  La orden <strong>#{orderId}</strong> fue registrada con estado <em>Pendiente</em>.
                  El stock fue reservado. Si no completás el pago, contactá a nuestro equipo para cancelar la reserva.
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <Link to="/carrito"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-red-600
                           text-white font-semibold py-3 rounded-full transition-colors">
                <FiRefreshCw size={16}/> Intentar de nuevo
              </Link>
              <Link to="/tienda"
                className="flex items-center justify-center gap-2 border border-gray-200
                           dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold
                           py-3 rounded-full hover:border-primary hover:text-primary transition-colors">
                <FiShoppingBag size={16}/> Seguir comprando
              </Link>
            </div>

            <p className="text-xs text-center text-gray-400">
              ¿Necesitás ayuda? Contactanos con el ID de pago:{' '}
              <span className="font-mono font-bold">{paymentId || '—'}</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
