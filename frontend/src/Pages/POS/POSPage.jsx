import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiSearch, FiPlus, FiMinus, FiTrash2, FiUser, FiLogOut,
  FiBarChart2, FiShoppingCart, FiX, FiPercent, FiHome,
} from 'react-icons/fi'
import { useAuth }  from '../../context/AuthContext.jsx'
import posService   from '../../api/services/posService'
import POSReceipt   from './POSReceipt.jsx'
import DarkMode     from '../../Components/NavBar/DarkMode.jsx'

const METODOS = ['Efectivo', 'Tarjeta Cred', 'Débito', 'Transferencia', 'MercadoPago']

const IMG_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'

// ─── Helpers ─────────────────────────────────────────────────
const calcItemTotal = (i) => +(i.precio_unit * i.cantidad).toFixed(2)
const calcSubtotal  = (cart) => cart.reduce((s, i) => s + calcItemTotal(i), 0)

// ─── Selector de sucursal ─────────────────────────────────────
function BranchSelector({ branches, onSelect }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Seleccionar sucursal
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Elegí tu punto de venta para comenzar
        </p>
        <div className="flex flex-col gap-3">
          {branches.map(b => (
            <button key={b.id} onClick={() => onSelect(b)}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary hover:bg-primary/5 text-left transition-all">
              <p className="font-bold text-gray-800 dark:text-white">{b.nombre}</p>
              {b.direccion && <p className="text-xs text-gray-400">{b.direccion}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de producto ─────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const finalPrice = product.discount > 0
    ? +(product.price * (1 - product.discount / 100)).toFixed(2)
    : +product.price

  return (
    <button onClick={() => onAdd(product)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3
                 flex flex-col gap-1.5 hover:border-primary hover:shadow-md transition-all duration-200
                 text-left active:scale-95">
      {product.image ? (
        <picture>
          <source srcSet={`${IMG_BASE}/${product.image}`} type="image/webp"/>
          <img src={`${IMG_BASE}/${product.image}`} alt={product.title}
            className="w-full h-20 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"/>
        </picture>
      ) : (
        <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">🛍️</div>
      )}
      <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight line-clamp-2">{product.title}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-primary">${finalPrice}</span>
        {product.discount > 0 && (
          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">
            -{product.discount}%
          </span>
        )}
      </div>
      {product.stock !== undefined && product.stock <= 5 && (
        <span className="text-[10px] text-orange-500 font-semibold">Stock: {product.stock}</span>
      )}
    </button>
  )
}

// ─── Item del carrito ─────────────────────────────────────────
function CartItem({ item, onQty, onRemove }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight line-clamp-2">
          {item.nombre_producto}
        </p>
        <p className="text-xs text-gray-400">${item.precio_unit} c/u</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onQty(item.producto_id, item.cantidad - 1)}
          className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
          <FiMinus size={10}/>
        </button>
        <span className="text-sm font-bold w-5 text-center text-gray-800 dark:text-white">{item.cantidad}</span>
        <button onClick={() => onQty(item.producto_id, item.cantidad + 1)}
          className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
          <FiPlus size={10}/>
        </button>
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs font-bold text-gray-800 dark:text-white">${calcItemTotal(item).toLocaleString()}</span>
        <button onClick={() => onRemove(item.producto_id)} className="text-red-400 hover:text-red-600">
          <FiTrash2 size={11}/>
        </button>
      </div>
    </div>
  )
}

// ─── Buscador de clientes ─────────────────────────────────────
function CustomerSearch({ value, onSelect, onClear }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [open,    setOpen]    = useState(false)
  const ref = useRef()

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    try { setResults(await posService.searchCustomers(q)) } catch { setResults([]) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (value) return (
    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <FiUser size={13} className="text-blue-500"/>
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{value.nombre}</span>
      </div>
      <button onClick={onClear} className="text-gray-400 hover:text-gray-600"><FiX size={14}/></button>
    </div>
  )

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente (opcional)…"
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 max-h-40 overflow-y-auto">
          {results.map(c => (
            <button key={c.id} onClick={() => { onSelect(c); setQuery(''); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <p className="font-semibold text-gray-800 dark:text-white">{c.nombre}</p>
              <p className="text-gray-400">{c.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function POSPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  // Sucursal
  const [branch,    setBranch]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_branch')) } catch { return null }
  })
  const [branches,  setBranches]  = useState([])

  // Productos
  const [products,  setProducts]  = useState([])
  const [query,     setQuery]     = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [categories,setCategories]= useState(['Todos'])
  const [loadingP,  setLoadingP]  = useState(false)

  // Carrito
  const [cart,      setCart]      = useState([])
  const [customer,  setCustomer]  = useState(null)
  const [descuento, setDescuento] = useState(0)
  const [metodo,    setMetodo]    = useState('Efectivo')

  // Venta
  const [selling,   setSelling]   = useState(false)
  const [receipt,   setReceipt]   = useState(null)
  const [error,     setError]     = useState('')

  // Clock
  const [clock, setClock] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Cargar sucursales si no tiene asignada
  useEffect(() => {
    if (!branch) posService.getBranches().then(setBranches).catch(() => {})
  }, [branch])

  const selectBranch = (b) => {
    setBranch(b)
    localStorage.setItem('pos_branch', JSON.stringify(b))
  }

  // Cargar productos
  const loadProducts = useCallback(async (q = '') => {
    setLoadingP(true)
    try {
      const data = await posService.searchProducts(q)
      setProducts(data)
      const cats = ['Todos', ...new Set(data.map(p => p.category).filter(Boolean))]
      setCategories(cats)
    } catch { /* silencioso */ }
    finally { setLoadingP(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadProducts(query), query ? 300 : 0)
    return () => clearTimeout(t)
  }, [query, loadProducts])

  // Filtro por categoría
  const visibleProducts = catFilter === 'Todos'
    ? products
    : products.filter(p => p.category === catFilter)

  // ── Carrito actions ─────────────────────────────────────────
  const addToCart = (product) => {
    const finalPrice = product.discount > 0
      ? +(product.price * (1 - product.discount / 100)).toFixed(2)
      : +product.price

    setCart(prev => {
      const existing = prev.find(i => i.producto_id === product.id)
      if (existing) {
        return prev.map(i => i.producto_id === product.id
          ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, {
        producto_id:    product.id,
        nombre_producto:product.title,
        precio_unit:    finalPrice,
        cantidad:       1,
      }]
    })
    setError('')
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(i => i.producto_id === id ? { ...i, cantidad: qty } : i))
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.producto_id !== id))
  const clearCart      = () => { setCart([]); setCustomer(null); setDescuento(0); setMetodo('Efectivo') }

  // ── Totales ─────────────────────────────────────────────────
  const subtotal = calcSubtotal(cart)
  const descVal  = +(subtotal * descuento / 100).toFixed(2)
  const total    = +(subtotal - descVal).toFixed(2)

  // ── Cobrar ──────────────────────────────────────────────────
  const handleCobrar = async () => {
    if (!cart.length) { setError('El carrito está vacío'); return }
    setSelling(true)
    setError('')
    try {
      const sale = await posService.createSale({
        items:       cart,
        metodo_pago: metodo,
        cliente_id:  customer?.id || null,
        descuento,
        sucursal_id: branch?.id || null,
      })
      setReceipt(sale)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al registrar la venta')
    } finally {
      setSelling(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  // ── Branch selector ─────────────────────────────────────────
  if (!branch) return <BranchSelector branches={branches} onSelect={selectBranch}/>

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">

      {/* ── Top bar ── */}
      <header className="bg-gray-900 text-white px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <span className="text-primary font-bold tracking-widest text-sm uppercase hidden sm:block">
          Goyito's
        </span>
        <span className="text-gray-400 text-xs hidden sm:block">|</span>
        <span className="text-gray-300 text-xs font-semibold">{branch.nombre}</span>
        <span className="ml-auto text-gray-400 text-xs hidden sm:block">
          {clock.toLocaleTimeString()} · {clock.toLocaleDateString()}
        </span>
        <span className="text-gray-400 text-xs ml-auto sm:ml-2">{user?.name}</span>
        <div className="flex items-center gap-2 ml-2">
          <DarkMode />
          <Link to="/pos/reports"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reportes del día">
            <FiBarChart2 size={16}/>
          </Link>
          <Link to="/"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Ir al sitio">
            <FiHome size={16}/>
          </Link>
          <button onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Cerrar sesión">
            <FiLogOut size={16}/>
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel izquierdo: productos ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Buscador + filtros */}
          <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por nombre o escanear código de barras…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all
                    ${catFilter===c?'bg-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingP ? (
              <div className="flex justify-center py-16">
                <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
              </div>
            ) : visibleProducts.length === 0 && products.length === 0 && !query ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
                <FiSearch size={32} className="opacity-20"/>
                <p className="text-sm text-center">No hay productos habilitados.</p>
                <p className="text-xs text-gray-400 text-center">
                  Los productos se habilitan automáticamente cuando tienen stock mayor a 0.<br/>
                  Verificá el stock desde el panel Admin → Productos → Listados.
                </p>
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {visibleProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart}/>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <FiSearch size={32} className="mb-2 opacity-30"/>
                <p className="text-sm">Sin productos{query ? ` para "${query}"` : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Panel derecho: carrito ── */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">

          {/* Header carrito */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShoppingCart size={16} className="text-primary"/>
              <span className="font-bold text-sm text-gray-800 dark:text-white">
                Ticket ({cart.length} ítem{cart.length !== 1 ? 's' : ''})
              </span>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                Vaciar
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-300 dark:text-gray-600">
                <FiShoppingCart size={28} className="mb-2"/>
                <p className="text-xs">Seleccioná productos</p>
              </div>
            ) : (
              cart.map(item => (
                <CartItem key={item.producto_id} item={item} onQty={updateQty} onRemove={removeFromCart}/>
              ))
            )}
          </div>

          {/* Panel de pago */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-3">

            {/* Cliente */}
            <CustomerSearch
              value={customer}
              onSelect={setCustomer}
              onClear={() => setCustomer(null)}
            />

            {/* Descuento */}
            <div className="flex items-center gap-2">
              <FiPercent size={13} className="text-gray-400 flex-shrink-0"/>
              <input type="number" min={0} max={100} value={descuento}
                onChange={e => setDescuento(Math.min(100, Math.max(0, +e.target.value)))}
                placeholder="Descuento %"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>

            {/* Totales */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>Descuento {descuento}%</span><span>-${descVal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-800 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-600">
                <span>TOTAL</span><span className="text-primary">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Método de pago</p>
              <div className="grid grid-cols-3 gap-1">
                {METODOS.map(m => (
                  <button key={m} onClick={() => setMetodo(m)}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all
                      ${metodo===m
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Botón cobrar */}
            <button onClick={handleCobrar} disabled={selling || cart.length === 0}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-red-600 disabled:opacity-50 text-white font-bold text-base transition-colors flex items-center justify-center gap-2">
              {selling
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <>Cobrar ${total.toLocaleString()}</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Comprobante modal */}
      {receipt && (
        <POSReceipt
          sale={receipt}
          onClose={() => setReceipt(null)}
          onNewSale={() => { setReceipt(null); clearCart() }}
        />
      )}
    </div>
  )
}
