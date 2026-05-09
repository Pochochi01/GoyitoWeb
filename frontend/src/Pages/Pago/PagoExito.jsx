/**
 * PagoExito — Página de confirmación de pago con MercadoPago
 *
 * MercadoPago redirige aquí con los siguientes query params:
 *  ?collection_id=<payment_id>
 *  &collection_status=approved
 *  &payment_id=<payment_id>
 *  &status=approved
 *  &external_reference=<orderId>   ← nuestro ID de orden
 *  &preference_id=<pref_id>
 *  &merchant_order_id=<mp_order_id>
 *
 * Lo que hacemos:
 *  1. Leemos external_reference para obtener el orderId
 *  2. Intentamos cargar el detalle de la orden desde nuestra API
 *  3. Mostramos la confirmación con los datos reales
 *  4. Limpiamos el sessionStorage del checkout pendiente
 */
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NavBar  from '../../Components/NavBar/NavBar.jsx'
import Footer  from '../../Components/Footer/Footer.jsx'
import { FiCheckCircle, FiPackage, FiShoppingBag,
         FiCreditCard, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import salesOrderService from '../../api/services/salesOrderService'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PagoExito() {
  const [params]        = useSearchParams()
  const { user }        = useAuth()
  const [order, setOrder]     = useState(null)
  const [loadingO, setLoadingO] = useState(false)

  // Parámetros enviados por MercadoPago
  const mpStatus      = params.get('status')             // approved / in_process
  const collStatus    = params.get('collection_status')  // approved / pending
  const paymentId     = params.get('payment_id') || params.get('collection_id')
  const orderId       = params.get('external_reference') // nuestro ID de orden
  const preferenceId  = params.get('preference_id')

  const isApproved = mpStatus === 'approved' || collStatus === 'approved'
  const isPending  = mpStatus === 'pending'  || collStatus === 'in_process'

  // Limpiar sessionStorage del checkout pendiente
  useEffect(() => {
    sessionStorage.removeItem('mp_pending_order')
  }, [])

  // Cargar detalle de la orden si el usuario está logueado
  useEffect(() => {
    if (!orderId || !user) return
    setLoadingO(true)
    salesOrderService.getById(+orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoadingO(false))
  }, [orderId, user])

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1">
        {/* Banner de resultado */}
        <section className={`py-12 ${isApproved
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900'
          : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900'}`}>
          <div className="container text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5
              ${isApproved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              {isApproved
                ? <FiCheckCircle className="text-green-500" size={42}/>
                : <FiAlertCircle className="text-yellow-500" size={42}/>
              }
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {isApproved ? '¡Pago confirmado!' : 'Pago en proceso'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isApproved
                ? 'Tu pago fue acreditado exitosamente por MercadoPago.'
                : 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'}
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-2xl mx-auto flex flex-col gap-5">

            {/* Datos de la transacción */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h2 className="font-bold text-gray-800 dark:text-white mb-4">Detalle de la transacción</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {orderId && (
                  <div className="flex items-start gap-2">
                    <FiPackage size={15} className="text-gray-400 mt-0.5"/>
                    <div>
                      <p className="text-xs text-gray-400">Nº de orden</p>
                      <p className="font-bold text-primary">#{orderId}</p>
                    </div>
                  </div>
                )}
                {paymentId && (
                  <div className="flex items-start gap-2">
                    <FiCreditCard size={15} className="text-gray-400 mt-0.5"/>
                    <div>
                      <p className="text-xs text-gray-400">ID de pago MP</p>
                      <p className="font-semibold text-gray-800 dark:text-white font-mono text-xs">{paymentId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <FiCalendar size={15} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-xs text-gray-400">Fecha</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FiCreditCard size={15} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-xs text-gray-400">Método de pago</p>
                    <p className="font-semibold text-gray-800 dark:text-white">MercadoPago</p>
                  </div>
                </div>
              </div>

              {/* Estado de la orden */}
              <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
                ${isApproved
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                {isApproved ? '✓ Pago acreditado — la orden será preparada a la brevedad'
                            : '⏳ Pago pendiente de acreditación'}
              </div>
            </div>

            {/* Detalle de la orden (si se pudo cargar) */}
            {loadingO && (
              <div className="flex justify-center py-6">
                <span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
              </div>
            )}

            {order && !loadingO && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                    Productos ({order.items?.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{item.nombre_producto}</p>
                        <p className="text-xs text-gray-400">x{item.cantidad} · ${Number(item.precio_unit).toLocaleString()} c/u</p>
                      </div>
                      <span className="font-bold text-gray-800 dark:text-white">
                        ${Number(item.subtotal).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold text-base">
                  <span className="text-gray-800 dark:text-white">Total pagado</span>
                  <span className="text-primary">${Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Sin sesión: mensaje alternativo */}
            {!user && orderId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">¿Querés ver el detalle de tu compra?</p>
                <p className="text-xs">
                  Tu orden <strong>#{orderId}</strong> fue registrada. Iniciá sesión para acceder al historial completo.
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/tienda"
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-red-600
                           text-white font-semibold py-3 rounded-full transition-colors">
                <FiShoppingBag size={16}/> Seguir comprando
              </Link>
              <Link to="/"
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200
                           dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold
                           py-3 rounded-full hover:border-primary hover:text-primary transition-colors">
                Ir al inicio
              </Link>
            </div>

            <p className="text-xs text-center text-gray-400">
              Ante cualquier inconveniente con tu pago, contactanos con el ID de pago:{' '}
              <span className="font-mono font-bold">{paymentId || '—'}</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
