/**
 * ProdStock
 * Fuente de datos:
 *   - GET /api/stock          → movimientos (tab movimientos)
 *   - GET /api/stock/low-stock → alertas + tab ubicaciones
 */
import React, { useState, useEffect, useCallback } from 'react'
import { FiAlertTriangle, FiArrowUp, FiArrowDown, FiRefreshCw, FiRepeat } from 'react-icons/fi'
import StatusBadge from '../../../../../Components/Admin/StatusBadge.jsx'
import ExportMenu  from '../../../../../Components/Admin/ExportMenu.jsx'
import stockService   from '../../../../../api/services/stockService'
import productService from '../../../../../api/services/productService'

const TIPO_ICON = {
  Entrada:      <FiArrowUp   className="text-green-500"/>,
  Salida:       <FiArrowDown className="text-red-500"/>,
  Ajuste:       <FiRefreshCw className="text-yellow-500"/>,
  Transferencia:<FiRepeat    className="text-blue-500"/>,
}

const getStockStatus = (p) => {
  if (p.stock === 0)                       return 'Sin stock'
  if (p.stock < (p.stock_minimo ?? 5))    return 'Stock bajo'
  return 'Normal'
}

export default function ProdStock() {
  const [tab,          setTab]         = useState('movimientos')
  const [tipoFiltro,   setTipoFiltro]  = useState('Todos')
  const [movements,    setMovements]   = useState([])
  const [lowStock,     setLowStock]    = useState([])
  const [allProducts,  setAllProducts] = useState([])
  const [loadingMov,   setLoadingMov]  = useState(true)
  const [loadingStock, setLoadingStock]= useState(true)

  const loadMovements = useCallback(async () => {
    setLoadingMov(true)
    try {
      const params = tipoFiltro !== 'Todos' ? { tipo: tipoFiltro } : {}
      setMovements(await stockService.getMovements(params))
    } catch { setMovements([]) }
    finally { setLoadingMov(false) }
  }, [tipoFiltro])

  const loadStock = useCallback(async () => {
    setLoadingStock(true)
    try {
      const [low, prod] = await Promise.all([
        stockService.getLowStock(),
        productService.getAll({ limit: 200, activo: 1 }),
      ])
      setLowStock(low)
      setAllProducts(prod.data)
    } catch { /* silencioso */ }
    finally { setLoadingStock(false) }
  }, [])

  useEffect(() => { loadMovements() }, [loadMovements])
  useEffect(() => { loadStock() },     [loadStock])

  return (
    <div className="flex flex-col gap-5">
      {/* Alertas */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-orange-500" size={16}/>
            <span className="font-bold text-sm text-orange-700 dark:text-orange-400">
              Alertas de stock — {lowStock.length} productos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex justify-between items-center border border-orange-100 dark:border-orange-800/30">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">{p.titulo}</p>
                  <p className="text-[10px] text-gray-400">{p.ubicacion || '—'}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={p.stock===0?'Sin stock':'Stock bajo'}/>
                  <p className="text-[10px] text-gray-400 mt-1">Stock: {p.stock} / Min: {p.stock_minimo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {['movimientos','ubicaciones'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize
              ${tab===t?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
            {t === 'movimientos' ? 'Movimientos de stock' : 'Ubicaciones en depósito'}
          </button>
        ))}
      </div>

      {/* Tab: movimientos */}
      {tab === 'movimientos' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipo:</span>
            {['Todos','Entrada','Salida','Ajuste','Transferencia'].map(t => (
              <button key={t} onClick={() => setTipoFiltro(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all
                  ${tipoFiltro===t?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                {t}
              </button>
            ))}
            <div className="ml-auto"><ExportMenu label="Exportar movimientos"/></div>
          </div>

          {loadingMov ? (
            <div className="flex justify-center py-10">
              <span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['ID','Fecha','Producto','Tipo','Cantidad','Motivo','Usuario'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.fecha}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{m.producto}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {TIPO_ICON[m.tipo]}
                          <StatusBadge status={m.tipo}/>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-bold ${m.cantidad>0?'text-green-600':'text-red-500'}`}>
                        {m.cantidad>0?'+':''}{m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{m.motivo || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.usuario_nombre || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {movements.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">Sin movimientos registrados</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: ubicaciones */}
      {tab === 'ubicaciones' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loadingStock ? (
            <div className="flex justify-center py-10">
              <span className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['Producto','Categoría','Ubicación','Stock actual','Stock mínimo','Estado'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {[...allProducts].sort((a,b)=>(a.ubicacion||'').localeCompare(b.ubicacion||'')).map(p => {
                    const st = getStockStatus(p)
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{p.title}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category}</td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.ubicacion || '—'}</td>
                        <td className={`px-4 py-3 font-bold ${st==='Sin stock'?'text-red-500':st==='Stock bajo'?'text-orange-500':'text-gray-800 dark:text-white'}`}>{p.stock}</td>
                        <td className="px-4 py-3 text-gray-500">{p.stock_minimo}</td>
                        <td className="px-4 py-3"><StatusBadge status={st}/></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {allProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">Sin productos registrados</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
