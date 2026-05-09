/**
 * ProdPrecios
 * Fuente de datos:
 *   - GET /api/products               → lista de productos (simulador + ofertas)
 *   - GET /api/products/:id/prices    → historial de precios del producto seleccionado
 */
import React, { useState, useEffect } from 'react'
import { FiPercent } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ChartCard    from '../../../../../Components/Admin/ChartCard.jsx'
import productService from '../../../../../api/services/productService'

export default function ProdPrecios() {
  const [tab,        setTab]      = useState('historial')
  const [products,   setProducts] = useState([])
  const [simProdId,  setSimProdId]= useState('')
  const [simDesc,    setSimDesc]  = useState(10)
  const [history,    setHistory]  = useState([])
  const [loadingP,   setLoadingP] = useState(true)
  const [loadingH,   setLoadingH] = useState(false)

  // Cargar lista de productos
  useEffect(() => {
    productService.getAll({ limit: 200, activo: 1 })
      .then(r => {
        setProducts(r.data)
        if (r.data.length) setSimProdId(String(r.data[0].id))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingP(false))
  }, [])

  // Cargar historial al cambiar de producto
  useEffect(() => {
    if (!simProdId) return
    setLoadingH(true)
    productService.getPriceHistory(simProdId)
      .then(setHistory).catch(() => setHistory([]))
      .finally(() => setLoadingH(false))
  }, [simProdId])

  const prod         = products.find(p => String(p.id) === simProdId)
  const precioConDesc= prod ? +(prod.price * (1 - simDesc / 100)).toFixed(2) : 0
  const margenNormal = prod && prod.costo > 0 ? +((prod.price - prod.costo) / prod.price * 100).toFixed(1) : 0
  const margenConDesc= prod && prod.costo > 0 ? +((precioConDesc - prod.costo) / precioConDesc * 100).toFixed(1) : 0

  const ofertaProducts = products.filter(p => p.discount > 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {['historial','ofertas','simulador'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize
              ${tab===t?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
            {t==='historial'?'Historial de precios':t==='ofertas'?'Productos en oferta':'Simulador de margen'}
          </button>
        ))}
      </div>

      {/* Tab: historial */}
      {tab === 'historial' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loadingP ? (
            <div className="flex justify-center py-10"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/40">
                <tr>
                  {['Fecha','Producto','Precio','Motivo'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {history.map((h,i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.fecha}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{prod?.title || '—'}</td>
                    <td className="px-4 py-3 font-bold text-primary">${h.precio}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{h.motivo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingP && history.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Sin historial de precios registrado</div>
          )}
        </div>
      )}

      {/* Tab: ofertas */}
      {tab === 'ofertas' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loadingP ? (
            <div className="flex justify-center py-10"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/40">
                <tr>
                  {['Producto','Cat.','Precio normal','Precio c/desc','Descuento','Margen c/desc'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {ofertaProducts.map(p => {
                  const pDesc = +(p.price * (1 - p.discount / 100)).toFixed(2)
                  const m     = p.costo > 0 ? +((pDesc - p.costo) / pDesc * 100).toFixed(1) : null
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{p.title}</td>
                      <td className="px-4 py-3 text-gray-500">{p.category}</td>
                      <td className="px-4 py-3 text-gray-400 line-through">${p.price}</td>
                      <td className="px-4 py-3 font-bold text-primary">${pDesc}</td>
                      <td className="px-4 py-3">
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold">
                          -{p.discount}%
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${m===null?'text-gray-400':m>=15?'text-green-600':m>=8?'text-yellow-600':'text-red-500'}`}>
                        {m !== null ? `${m}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {!loadingP && ofertaProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Sin productos en oferta</div>
          )}
        </div>
      )}

      {/* Tab: simulador */}
      {tab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FiPercent className="text-primary"/> Simulador de descuento y margen
            </h3>
            {loadingP ? (
              <div className="flex justify-center py-8"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Producto</label>
                  <select value={simProdId} onChange={e => setSimProdId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Descuento: <strong className="text-primary">{simDesc}%</strong>
                  </label>
                  <input type="range" min={0} max={60} value={simDesc} onChange={e=>setSimDesc(+e.target.value)}
                    className="w-full accent-primary"/>
                </div>
                {prod && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { label:'Costo unitario',     val:`$${prod.costo||'—'}`,     color:'text-gray-800 dark:text-white' },
                      { label:'Precio normal',       val:`$${prod.price}`,          color:'text-gray-800 dark:text-white' },
                      { label:'Precio c/descuento',  val:`$${precioConDesc}`,        color:'text-primary' },
                      { label:'Margen normal',       val:`${margenNormal}%`,         color:margenNormal>=20?'text-green-600':'text-yellow-600' },
                      { label:'Margen c/descuento',  val:`${margenConDesc}%`,        color:margenConDesc>=15?'text-green-600':margenConDesc>=5?'text-yellow-600':'text-red-500' },
                      { label:'Diferencia margen',   val:`${(margenNormal-margenConDesc).toFixed(1)}pp`, color:'text-orange-500' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                        <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <ChartCard title="Evolución de precios" subtitle={prod?.title || '—'}>
            {loadingH ? (
              <div className="flex justify-center py-8"><span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
            ) : history.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history} margin={{left:-10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="fecha" tick={{fontSize:9}} tickFormatter={v=>v?.slice(5)}/>
                  <YAxis tick={{fontSize:10}} tickFormatter={v=>`$${v}`}/>
                  <Tooltip formatter={v=>`$${v}`}/>
                  <Line type="monotone" dataKey="precio" stroke="#f42c37" strokeWidth={2} dot={{r:4}}/>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Sin historial de precios para este producto
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  )
}
