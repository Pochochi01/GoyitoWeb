import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiCheckCircle, FiImage } from 'react-icons/fi'
import StatusBadge   from '../../../../../Components/Admin/StatusBadge.jsx'
import productService from '../../../../../api/services/productService'
import categoryService from '../../../../../api/services/categoryService'

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
      <picture>
        <source srcSet={src} type="image/webp"/>
        <img src={src} alt={label} className="w-full h-full object-cover"/>
      </picture>
      {onRemove && (
        <button onClick={onRemove}
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FiX size={10}/>
        </button>
      )}
    </div>
  )
}

// ─── Modal Producto ───────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product?.id)

  const [form, setForm] = useState({
    titulo:       product?.title       || '',
    precio:       product?.price       || '',
    descuento:    product?.discount    || 0,
    categoria_id: product?.categoria_id|| '',
    barcode:      product?.barcode     || '',
    stock:        product?.stock       || 0,
    stock_minimo: product?.stock_minimo|| 5,
    ubicacion:    product?.ubicacion   || '',
    costo:        product?.costo       || '',
    descripcion:  product?.descripcion || '',
  })

  // Imagen principal
  const [mainFile,    setMainFile]    = useState(null)
  const [mainPreview, setMainPreview] = useState(product?.images?.[0] || null)

  // Imágenes adicionales (hasta 4)
  const [extraFiles,    setExtraFiles]    = useState([])          // File[]
  const [extraPreviews, setExtraPreviews] = useState(
    product?.imagenes_extra || []                                 // string[] URLs existentes
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleMainFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setMainFile(f)
    setMainPreview(URL.createObjectURL(f))
  }

  const handleExtraFiles = (e) => {
    const newFiles = Array.from(e.target.files)
    const remaining = 4 - extraFiles.length - extraPreviews.length
    const toAdd = newFiles.slice(0, remaining)
    setExtraFiles(prev => [...prev, ...toAdd])
    e.target.value = ''
  }

  const removeExtraFile = (idx) => setExtraFiles(prev => prev.filter((_, i) => i !== idx))
  const removeExtraPreview = (idx) => setExtraPreviews(prev => prev.filter((_, i) => i !== idx))

  const totalExtras = extraFiles.length + extraPreviews.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo || !form.precio || !form.categoria_id) {
      setError('Completá título, precio y categoría'); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (mainFile)  fd.append('imagen', mainFile)
      extraFiles.forEach(f => fd.append('imagenes_extra', f))

      editing ? await productService.update(product.id, fd) : await productService.create(fd)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><FiX size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

          {/* ── Imágenes ── */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Imágenes del producto
            </p>

            {/* Imagen principal */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Imagen principal {mainPreview && <span className="text-green-500">✓</span>}
              </label>
              <div className="flex items-center gap-3">
                {mainPreview && (
                  <ImageThumb src={mainPreview} label="Principal"
                    onRemove={() => { setMainFile(null); setMainPreview(null) }}/>
                )}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  <FiImage size={16}/>
                  {mainPreview ? 'Cambiar' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleMainFile}/>
                </label>
              </div>
            </div>

            {/* Imágenes adicionales */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Fotos adicionales ({totalExtras}/4)
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {/* Existentes (al editar) */}
                {extraPreviews.map((url, i) => (
                  <ImageThumb key={`prev-${i}`} src={url} label={`Extra ${i+1}`}
                    onRemove={() => removeExtraPreview(i)}/>
                ))}
                {/* Nuevas seleccionadas */}
                {extraFiles.map((f, i) => (
                  <ImageThumb key={`file-${i}`} src={URL.createObjectURL(f)} label={`Nueva ${i+1}`}
                    onRemove={() => removeExtraFile(i)}/>
                ))}
                {/* Botón agregar */}
                {totalExtras < 4 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-gray-400 transition-colors text-xs gap-1">
                    <FiPlus size={18}/>
                    Agregar
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraFiles}/>
                  </label>
                )}
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
          <div className="grid grid-cols-3 gap-3">
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
          <div className="grid grid-cols-4 gap-3">
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

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
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
  const [toast,      setToast]      = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [prod, cats] = await Promise.all([
        productService.getAll({ limit: 200 }),
        categoryService.getAll(),
      ])
      setProducts(prod.data)
      setCategories(cats)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.title}"?`)) return
    try {
      await productService.remove(p.id)
      showToast('Producto eliminado')
      load()
    } catch (e) { showToast(e.response?.data?.message || 'Error al eliminar') }
  }

  const handleToggleActivo = async (p) => {
    try {
      const fd = new FormData()
      fd.append('activo', p.activo ? 0 : 1)
      await productService.update(p.id, fd)
      showToast(p.activo ? 'Producto inhabilitado' : 'Producto habilitado')
      load()
    } catch { showToast('Error al actualizar') }
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none">
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filtro === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors flex-shrink-0">
          <FiPlus size={14}/> Nuevo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
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
                    const margen = p.costo > 0 ? Math.round((p.price - p.costo) / p.price * 100) : null
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${!p.activo ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {p.images?.[0] ? (
                              <picture>
                                <source srcSet={p.images[0]} type="image/webp"/>
                                <img src={p.images[0]} alt="" className="w-9 h-9 object-cover rounded-lg flex-shrink-0"/>
                              </picture>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <FiImage size={14} className="text-gray-400"/>
                              </div>
                            )}
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
                          <div className="flex items-center gap-2">
                            <button onClick={() => setModal(p)} className="text-blue-500 hover:text-blue-700" title="Editar"><FiEdit2 size={14}/></button>
                            <button onClick={() => handleToggleActivo(p)}
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors ${p.activo ? 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500' : 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                              title={p.activo ? 'Inhabilitar' : 'Habilitar'}>
                              {p.activo ? 'Inhab.' : 'Habilitar'}
                            </button>
                            <button onClick={() => handleDelete(p)} className="text-red-400 hover:text-red-600" title="Eliminar"><FiTrash2 size={14}/></button>
                          </div>
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
                  <div key={p.id} className={`p-4 flex items-start justify-between gap-3 ${!p.activo ? 'opacity-60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                      <div className="flex items-center gap-2 mt-1"><StatusBadge status={st}/><span className="text-primary font-bold text-sm">${p.price}</span></div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setModal(p)} className="text-blue-500"><FiEdit2 size={16}/></button>
                      <button onClick={() => handleDelete(p)} className="text-red-400"><FiTrash2 size={16}/></button>
                    </div>
                  </div>
                )
              })}
            </div>

            {data.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sin resultados</p>
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
          onSaved={() => { showToast(modal === 'create' ? 'Producto creado' : 'Producto actualizado'); load() }}
        />
      )}
    </div>
  )
}
