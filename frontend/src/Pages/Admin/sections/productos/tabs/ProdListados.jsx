import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiCheckCircle, FiImage } from 'react-icons/fi'
import StatusBadge   from '../../../../../Components/Admin/StatusBadge.jsx'
import productService from '../../../../../api/services/productService'
import categoryService from '../../../../../api/services/categoryService'
import ProductImage    from '../../../../../Components/Shared/ProductImage.jsx'
import Toast, { useToast } from '../../../../../Components/Shared/Toast.jsx'

const FILTROS = ['Todos', 'En oferta', 'Inhabilitado', 'Sin stock', 'Stock bajo', 'Con stock']

const getStockStatus = (p) => {
  if (!p.activo)                       return 'Inhabilitado'
  if (p.stock === 0)                   return 'Sin stock'
  if (p.stock < (p.stock_minimo || 5)) return 'Stock bajo'
  return 'Normal'
}

const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

// ─── Vista previa de imagen ───────────────────────────────────
function ImageThumb({ src, onRemove, label }) {
  return (
    <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <img src={src} alt={label} className="w-full h-full object-cover"/>
      {onRemove && (
        // Siempre visible en táctil (no hay hover); en desktop aparece al pasar el mouse
        <button type="button" onClick={onRemove} aria-label={`Quitar ${label}`}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center
                     opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,background-color]">
          <FiX size={12}/>
        </button>
      )}
    </div>
  )
}

// ─── Miniatura de fila con fallback ───────────────────────────
function RowThumb({ src, size = 'w-11 h-11' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`${size} rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0`}>
        <FiImage size={14} className="text-gray-400"/>
      </div>
    )
  }
  return (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)}
      className={`${size} object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700`}/>
  )
}

// ─── Acciones de fila (desktop compacto / mobile con targets de 44px) ──
function RowActions({ p, busy, disabled, mobile, onEdit, onToggle, onDelete }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const size = mobile ? 'min-h-[40px] px-3 text-xs font-semibold flex-1' : 'w-8 h-8'
  return (
    <div className={`flex items-center ${mobile ? 'gap-2' : 'gap-1'}`}>
      <button onClick={onEdit} disabled={disabled} aria-label={`Editar ${p.title}`} title="Editar"
        className={`${base} ${size} text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 ${mobile ? '' : 'bg-transparent dark:bg-transparent'}`}>
        <FiEdit2 size={14}/>{mobile && 'Editar'}
      </button>
      <button onClick={onToggle} disabled={disabled} title={p.activo ? 'Inhabilitar' : 'Habilitar'}
        className={`${base} ${mobile ? size : 'h-8 px-2.5 text-xs font-semibold'} border ${p.activo
          ? 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-red-300 hover:text-red-500'
          : 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
        {busy ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin"/> : (p.activo ? 'Inhabilitar' : 'Habilitar')}
      </button>
      <button onClick={onDelete} disabled={disabled} aria-label={`Eliminar ${p.title}`} title="Eliminar"
        className={`${base} ${size} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${mobile ? 'bg-red-50/60 dark:bg-red-900/10' : ''}`}>
        <FiTrash2 size={14}/>{mobile && 'Eliminar'}
      </button>
    </div>
  )
}

// ─── Modal Producto ───────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product?.id)

  // `??` (no `||`) para no perder valores 0 legítimos (stock 0, descuento 0, costo 0)
  const [form, setForm] = useState({
    titulo:       product?.title        ?? '',
    precio:       product?.price        ?? '',
    descuento:    product?.discount     ?? 0,
    categoria_id: product?.categoria_id ?? '',
    barcode:      product?.barcode      ?? '',
    stock:        product?.stock        ?? 0,
    stock_minimo: product?.stock_minimo ?? 5,
    ubicacion:    product?.ubicacion    ?? '',
    costo:        product?.costo        ?? '',
    descripcion:  product?.descripcion  ?? '',
  })

  // Imagen principal
  const [mainFile,    setMainFile]    = useState(null)
  const [mainPreview, setMainPreview] = useState(product?.imagen ? product.images?.[0] : null)
  const [mainRemoved, setMainRemoved] = useState(false)

  // Imágenes adicionales (hasta 4): existentes {url, ruta} + archivos nuevos {file, url}
  const [existingExtras, setExistingExtras] = useState(() =>
    (product?.imagenes_extra || []).map((url, i) => ({ url, ruta: product.imagenes_extra_rutas?.[i] }))
  )
  const [newExtras, setNewExtras] = useState([])

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Liberar object URLs creados para previsualizar (al desmontar)
  const newExtrasRef = useRef(newExtras)
  newExtrasRef.current = newExtras
  useEffect(() => () => newExtrasRef.current.forEach(x => URL.revokeObjectURL(x.url)), [])
  useEffect(() => () => {
    if (mainFile && mainPreview) URL.revokeObjectURL(mainPreview)
  }, [mainFile, mainPreview])

  // Cerrar con Escape (salvo durante el guardado)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, onClose])

  const handleChange = (e) => {
    setError('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMainFile = (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('El archivo debe ser una imagen'); return }
    setMainFile(f)
    setMainPreview(URL.createObjectURL(f))
    setMainRemoved(false)
  }

  const removeMain = () => {
    setMainFile(null)
    setMainPreview(null)
    setMainRemoved(true)
  }

  const totalExtras = existingExtras.length + newExtras.length

  const handleExtraFiles = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    e.target.value = ''
    const toAdd = files.slice(0, 4 - totalExtras).map(file => ({ file, url: URL.createObjectURL(file) }))
    setNewExtras(prev => [...prev, ...toAdd])
  }

  const removeNewExtra = (idx) => setNewExtras(prev => {
    if (prev[idx]) URL.revokeObjectURL(prev[idx].url)
    return prev.filter((_, i) => i !== idx)
  })
  const removeExistingExtra = (idx) => setExistingExtras(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!form.titulo.trim() || form.precio === '' || !form.categoria_id) {
      setError('Completá título, precio y categoría'); return
    }
    if (Number(form.precio) <= 0) { setError('El precio debe ser mayor a 0'); return }
    const desc = Number(form.descuento || 0)
    if (desc < 0 || desc > 100) { setError('El descuento debe estar entre 0 y 100'); return }

    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === 'string' ? v.trim() : v))
      if (mainFile) fd.append('imagen', mainFile)
      else if (editing && mainRemoved) fd.append('quitar_imagen', '1')
      newExtras.forEach(x => fd.append('imagenes_extra', x.file))
      if (editing) {
        fd.append('imagenes_conservar', JSON.stringify(existingExtras.map(x => x.ruta).filter(Boolean)))
      }

      editing ? await productService.update(product.id, fd) : await productService.create(fd)
      onSaved()
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.request && !err.response ? 'Sin conexión con el servidor. Reintentá.' : 'Error al guardar')
      )
    } finally {
      setLoading(false)
    }
  }

  const finalPrice = Number(form.precio || 0) * (1 - Number(form.descuento || 0) / 100)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 animate-[fadeIn_200ms_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}>
      <div role="dialog" aria-modal="true" aria-labelledby="product-modal-title"
        className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-[sheetUp_320ms_cubic-bezier(0.32,0.72,0,1)] sm:animate-[popIn_220ms_cubic-bezier(0.22,1,0.36,1)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="sm:hidden absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"/>
          <h3 id="product-modal-title" className="font-bold text-gray-800 dark:text-white">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar"
            className="w-9 h-9 -mr-2 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"><FiX size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="p-5 flex flex-col gap-5 overflow-y-auto overscroll-contain flex-1">

          {/* ── Imágenes ── */}
          <div className="grid grid-cols-1 sm:grid-cols-[176px_1fr] gap-5">
            {/* Vista previa: misma proporción y tratamiento que la card de la tienda */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vista previa</p>
              <div className="w-44 max-w-full mx-auto sm:mx-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-sm bg-white dark:bg-gray-900">
                <ProductImage src={mainPreview} alt={form.titulo} eager>
                  {Number(form.descuento) > 0 && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {form.descuento}% OFF
                    </span>
                  )}
                </ProductImage>
                <div className="px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2 min-h-[2rem]">{form.titulo || 'Nombre del producto'}</p>
                  <p className="text-sm font-bold text-primary mt-1 tabular-nums">${finalPrice ? finalPrice.toFixed(0) : '0'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-0">
            {/* Imagen principal */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Imagen principal</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-sm text-gray-600 dark:text-gray-300 transition-colors focus-within:ring-2 focus-within:ring-primary/40">
                  <FiImage size={16}/>
                  {mainPreview ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleMainFile}/>
                </label>
                {mainPreview && (
                  <button type="button" onClick={removeMain}
                    className="min-h-[44px] px-3 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Quitar
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Cualquier proporción: se muestra completa dentro de un cuadrado.</p>
            </div>

            {/* Imágenes adicionales */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Fotos adicionales <span className="font-normal normal-case tabular-nums">({totalExtras}/4)</span>
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {existingExtras.map((x, i) => (
                  <ImageThumb key={x.ruta || x.url} src={x.url} label={`Extra ${i+1}`}
                    onRemove={() => removeExistingExtra(i)}/>
                ))}
                {newExtras.map((x, i) => (
                  <ImageThumb key={x.url} src={x.url} label={`Nueva ${i+1}`}
                    onRemove={() => removeNewExtra(i)}/>
                ))}
                {/* Botón agregar */}
                {totalExtras < 4 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-gray-400 transition-colors text-xs gap-1">
                    <FiPlus size={18}/>
                    Agregar
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleExtraFiles}/>
                  </label>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* ── Datos básicos ── */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Título *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} className={inputCls} placeholder="Nombre del producto"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describí las características del producto…"/>
            </div>
          </div>

          {/* ── Código de barras ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Código de barras <span className="text-gray-400 font-normal normal-case">(único, opcional)</span>
            </label>
            <input name="barcode" value={form.barcode} onChange={handleChange} className={inputCls}
              placeholder="Ej: 7791234567890 — escanear o escribir manualmente"/>
          </div>

          {/* ── Precio / Descuento / Categoría ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Precio *</label>
              <input name="precio" type="number" step="0.01" value={form.precio} onChange={handleChange} className={inputCls} placeholder="0.00"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descuento %</label>
              <input name="descuento" type="number" min="0" max="100" value={form.descuento} onChange={handleChange} className={inputCls} placeholder="0"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Categoría *</label>
              <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className={inputCls}>
                <option value="">Seleccionar</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* ── Stock / Costo / Ubicación ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Mínimo</label>
              <input name="stock_minimo" type="number" min="0" value={form.stock_minimo} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Costo</label>
              <input name="costo" type="number" step="0.01" value={form.costo} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Ubicación</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className={inputCls} placeholder="A-1"/>
            </div>
          </div>

          {form.stock === '0' || form.stock === 0 ? (
            <p className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2">
              ⚠️ Stock 0 → el producto quedará inhabilitado para la venta automáticamente.
            </p>
          ) : null}
        </div>

          {/* Footer fijo: siempre visible aunque el teclado virtual esté abierto */}
          <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-gray-800 sm:rounded-b-2xl">
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 mb-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={loading}
                className="flex-1 min-h-[44px] rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-[background-color,transform] active:scale-[0.97]">
                Cancelar
              </button>
              <button type="submit" disabled={loading} aria-busy={loading}
                className="flex-1 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-[0.97]">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                {loading ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function ProdListados() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filtro,     setFiltro]     = useState('Todos')
  const [cat,        setCat]        = useState('Todas')
  const [modal,      setModal]      = useState(null)
  const [loadError,  setLoadError]  = useState('')
  const [busyId,     setBusyId]     = useState(null)   // evita doble click en acciones de fila
  const { toast, showToast } = useToast()

  // silent=true → revalida sin reemplazar la tabla por el spinner
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const [prod, cats] = await Promise.all([
        productService.getAll({ limit: 200 }),
        categoryService.getAll(),
      ])
      setProducts(prod.data)
      setCategories(cats)
      setLoadError('')
    } catch (e) {
      const msg = e.response?.data?.message || 'No se pudieron cargar los productos'
      if (silent) showToast(msg, 'error')
      else setLoadError(msg)
    } finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const handleDelete = async (p) => {
    if (busyId) return
    if (!window.confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return
    setBusyId(p.id)
    try {
      await productService.remove(p.id)
      setProducts(prev => prev.filter(x => x.id !== p.id))   // optimista
      showToast('Producto eliminado')
      load({ silent: true })
    } catch (e) { showToast(e.response?.data?.message || 'Error al eliminar', 'error') }
    finally { setBusyId(null) }
  }

  const handleToggleActivo = async (p) => {
    if (busyId) return
    setBusyId(p.id)
    try {
      const fd = new FormData()
      fd.append('activo', p.activo ? 0 : 1)
      await productService.update(p.id, fd)
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, activo: !p.activo } : x))
      showToast(p.activo ? 'Producto inhabilitado' : 'Producto habilitado')
      load({ silent: true })
    } catch (e) { showToast(e.response?.data?.message || 'Error al actualizar', 'error') }
    finally { setBusyId(null) }
  }

  const CATS = ['Todas', ...categories.map(c => c.nombre)]

  const data = useMemo(() => {
    let d = products
    if (cat   !== 'Todas') d = d.filter(p => p.category === cat)
    if (search)            d = d.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()))
    if (filtro === 'En oferta')   d = d.filter(p => p.discount > 0)
    if (filtro === 'Inhabilitado')d = d.filter(p => !p.activo)
    if (filtro === 'Sin stock')   d = d.filter(p => p.activo && p.stock === 0)
    if (filtro === 'Stock bajo')  d = d.filter(p => p.activo && p.stock > 0 && p.stock < (p.stock_minimo || 5))
    if (filtro === 'Con stock')   d = d.filter(p => p.activo && p.stock >= (p.stock_minimo || 5))
    return d
  }, [products, search, filtro, cat])

  const sinStock    = products.filter(p => p.activo && p.stock === 0).length
  const inhabilitados = products.filter(p => !p.activo).length

  return (
    <div className="flex flex-col gap-5">
      <Toast toast={toast}/>

      {/* Alertas */}
      {(sinStock > 0 || inhabilitados > 0) && (
        <div className="flex flex-wrap gap-3">
          {sinStock > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              <FiAlertTriangle className="text-red-500" size={14}/>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">{sinStock} producto{sinStock !== 1 ? 's' : ''} sin stock</span>
            </div>
          )}
          {inhabilitados > 0 && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5">
              <FiAlertTriangle className="text-gray-500" size={14}/>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{inhabilitados} producto{inhabilitados !== 1 ? 's' : ''} inhabilitado{inhabilitados !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Barra filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
            {/* text-base en mobile evita el zoom automático de iOS al enfocar */}
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto…" aria-label="Buscar producto"
              className="w-full pl-9 pr-4 min-h-[44px] text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
          </div>
          <div className="flex gap-3">
            <select value={cat} onChange={e => setCat(e.target.value)} aria-label="Categoría"
              className="flex-1 sm:flex-none min-w-0 px-3 min-h-[44px] text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => setModal('create')}
              className="flex items-center gap-2 px-4 min-h-[44px] bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.97] flex-shrink-0">
              <FiPlus size={14}/> Nuevo
            </button>
          </div>
        </div>
        {/* Chips: scroll horizontal en mobile en lugar de envolver en 3 filas */}
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} aria-pressed={filtro === f}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
                ${filtro === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          // Skeleton: conserva la forma de la lista mientras carga
          <div className="divide-y divide-gray-100 dark:divide-gray-700" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-700"/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-gray-100 dark:bg-gray-700"/>
                  <div className="h-2.5 w-1/5 rounded bg-gray-100 dark:bg-gray-700"/>
                </div>
                <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-700"/>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-14 px-4">
            <FiAlertTriangle size={28} className="mx-auto mb-3 text-red-400"/>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
            <button onClick={() => load()}
              className="px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['Producto','Cat.','Stock','Precio','Margen','Estado','Oferta',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {data.map(p => {
                    const st     = getStockStatus(p)
                    const margen = p.costo > 0 && p.price > 0 ? Math.round((p.price - p.costo) / p.price * 100) : null
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${!p.activo ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <RowThumb src={p.images?.[0]}/>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white leading-tight">{p.title}</p>
                              {p.images.length > 1 && (
                                <p className="text-[10px] text-gray-400">{p.images.length} fotos</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.category}</td>
                        <td className={`px-4 py-3 font-bold ${st === 'Sin stock' || st === 'Inhabilitado' ? 'text-red-500' : st === 'Stock bajo' ? 'text-orange-500' : 'text-gray-800 dark:text-white'}`}>{p.stock}</td>
                        <td className="px-4 py-3 font-bold text-primary">${p.price}</td>
                        <td className="px-4 py-3">
                          {margen !== null
                            ? <span className={`font-semibold ${margen >= 25 ? 'text-green-600' : margen >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>{margen}%</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={st}/></td>
                        <td className="px-4 py-3">
                          {p.discount > 0
                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">🔥 {p.discount}%</span>
                            : <FiCheckCircle className="text-gray-300" size={14}/>}
                        </td>
                        <td className="px-4 py-3">
                          <RowActions p={p} busy={busyId === p.id} disabled={busyId !== null}
                            onEdit={() => setModal(p)} onToggle={() => handleToggleActivo(p)} onDelete={() => handleDelete(p)}/>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
              {data.map(p => {
                const st = getStockStatus(p)
                return (
                  <div key={p.id} className="p-4 flex flex-col gap-3">
                    <div className={`flex items-start gap-3 ${!p.activo ? 'opacity-60' : ''}`}>
                      <RowThumb src={p.images?.[0]} size="w-14 h-14"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug line-clamp-2">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.category} · Stock <span className="tabular-nums font-semibold">{p.stock}</span></p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <StatusBadge status={st}/>
                          <span className="text-primary font-bold text-sm tabular-nums">${p.price}</span>
                          {p.discount > 0 && <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">-{p.discount}%</span>}
                        </div>
                      </div>
                    </div>
                    <RowActions p={p} busy={busyId === p.id} disabled={busyId !== null} mobile
                      onEdit={() => setModal(p)} onToggle={() => handleToggleActivo(p)} onDelete={() => handleDelete(p)}/>
                  </div>
                )
              })}
            </div>

            {data.length === 0 && (
              <div className="text-center py-14 px-4 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-3 opacity-30"/>
                {products.length === 0 ? (
                  <>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Todavía no cargaste productos</p>
                    <button onClick={() => setModal('create')}
                      className="mt-4 inline-flex items-center gap-2 px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                      <FiPlus size={14}/> Crear el primero
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ningún producto coincide con los filtros</p>
                    <button onClick={() => { setSearch(''); setFiltro('Todos'); setCat('Todas') }}
                      className="mt-3 text-sm font-semibold text-primary hover:underline">Limpiar filtros</button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { showToast(modal === 'create' ? 'Producto creado' : 'Producto actualizado'); load({ silent: true }) }}
        />
      )}
    </div>
  )
}
