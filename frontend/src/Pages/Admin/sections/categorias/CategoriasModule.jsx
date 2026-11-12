import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiCheckCircle, FiSlash } from 'react-icons/fi'
import categoryService from '../../../../api/services/categoryService'
import AdminModal, { ModalActions, apiErrorMessage } from '../../../../Components/Admin/AdminModal.jsx'
import Toast, { useToast } from '../../../../Components/Shared/Toast.jsx'

const inputCls = 'w-full px-3 min-h-[44px] py-2 text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function ImageThumb({ src, onRemove, label }) {
  return (
    <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <img src={src} alt={label} className="w-full h-full object-cover"/>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Quitar ${label}`}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,background-color]">
          <FiX size={12}/>
        </button>
      )}
    </div>
  )
}

function CategoryModal({ category, onClose, onSaved }) {
  const editing = Boolean(category?.id)

  const [form, setForm] = useState({
    nombre:      category?.nombre      ?? '',
    descripcion: category?.descripcion ?? '',
    orden:       category?.orden       ?? 0,
    activo:      category?.activo === undefined ? true : category.activo,
  })

  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(category?.imagenUrl || null)
  const [imageRemoved, setImageRemoved] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => () => { if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview) }, [imageFile, imagePreview])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setError('')
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageFile = (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('El archivo debe ser una imagen'); return }
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
    setImageRemoved(false)
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    const orden = Number(form.orden)
    if (!Number.isFinite(orden) || orden < 0) { setError('El orden debe ser un número mayor o igual a 0'); return }

    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('nombre',      form.nombre.trim())
      fd.append('descripcion', form.descripcion.trim())
      fd.append('orden',       Math.floor(orden))
      fd.append('activo',      form.activo ? 1 : 0)
      if (imageFile) fd.append('imagen', imageFile)
      else if (editing && imageRemoved) fd.append('quitar_imagen', '1')

      const saved = editing
        ? await categoryService.update(category.id, fd)
        : await categoryService.create(fd)

      onSaved(saved, editing)
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Error al guardar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      title={editing ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onClose} onSubmit={handleSubmit} busy={loading} error={error}
      footer={<ModalActions onCancel={onClose} busy={loading} submitLabel={editing ? 'Guardar cambios' : 'Crear categoría'}/>}
    >
      {/* Imagen */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Imagen de la categoría</p>
        <div className="flex flex-wrap items-center gap-3">
          {imagePreview && (
            <ImageThumb src={imagePreview} label="imagen de categoría"
              onRemove={() => { setImageFile(null); setImagePreview(null); setImageRemoved(true) }}/>
          )}
          <label className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-sm text-gray-500 dark:text-gray-400 transition-colors focus-within:ring-2 focus-within:ring-primary/40">
            <FiImage size={16}/>
            {imagePreview ? 'Cambiar' : 'Subir imagen'}
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageFile}/>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="cat-nombre" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Nombre *</label>
        <input id="cat-nombre" name="nombre" value={form.nombre} onChange={handleChange} className={inputCls}
          placeholder="Ej: Auriculares" autoFocus={!editing}/>
      </div>

      <div>
        <label htmlFor="cat-desc" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descripción</label>
        <textarea id="cat-desc" name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Descripción corta para mostrar en la home (opcional)"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="cat-orden" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Orden</label>
          <input id="cat-orden" name="orden" type="number" inputMode="numeric" min="0" value={form.orden} onChange={handleChange} className={inputCls}/>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Estado</span>
          <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-5 h-5 accent-primary"/>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {form.activo ? 'Activa (visible en la tienda)' : 'Inactiva'}
            </span>
          </label>
        </div>
      </div>
    </AdminModal>
  )
}

export default function CategoriasModule() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null)
  const [loadError,  setLoadError]  = useState('')
  const [busyId,     setBusyId]     = useState(null)
  const { toast, showToast } = useToast()

  // silent → revalida sin reemplazar la tabla por el skeleton
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      setCategories(await categoryService.getAll())
      setLoadError('')
    } catch (e) {
      const msg = apiErrorMessage(e, 'Error al cargar categorías')
      if (silent) showToast(msg, 'error'); else setLoadError(msg)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const handleDelete = async (c) => {
    if (busyId) return
    if (c.productosCount > 0) { showToast(`No se puede eliminar: tiene ${c.productosCount} producto(s)`, 'error'); return }
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return
    setBusyId(c.id)
    try {
      await categoryService.remove(c.id)
      setCategories(prev => prev.filter(x => x.id !== c.id))
      showToast('Categoría eliminada')
      load({ silent: true })
    } catch (e) {
      showToast(apiErrorMessage(e, 'Error al eliminar'), 'error')
    } finally { setBusyId(null) }
  }

  const handleToggleActivo = async (c) => {
    if (busyId) return
    setBusyId(c.id)
    try {
      const fd = new FormData()
      fd.append('activo', c.activo ? 0 : 1)
      await categoryService.update(c.id, fd)
      setCategories(prev => prev.map(x => x.id === c.id ? { ...x, activo: !c.activo } : x))
      showToast(c.activo ? 'Categoría desactivada' : 'Categoría activada')
      load({ silent: true })
    } catch (e) {
      showToast(apiErrorMessage(e, 'Error al actualizar'), 'error')
    } finally { setBusyId(null) }
  }

  const data = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter(c =>
      (c.nombre || '').toLowerCase().includes(q) || (c.descripcion || '').toLowerCase().includes(q)
    )
  }, [categories, search])

  const activas   = categories.filter(c => c.activo).length
  const inactivas = categories.length - activas
  const anyBusy   = busyId !== null

  return (
    <div className="flex flex-col gap-5">
      <Toast toast={toast}/>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ['Total', categories.length, 'text-gray-800 dark:text-white'],
          ['Activas', activas, 'text-green-600'],
          ['Inactivas', inactivas, 'text-gray-500'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Barra superior */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar categoría…" aria-label="Buscar categoría"
            className="w-full pl-9 pr-4 min-h-[44px] text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center justify-center gap-2 px-4 min-h-[44px] bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.97] flex-shrink-0">
          <FiPlus size={14}/> Nueva categoría
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700" aria-busy="true" aria-label="Cargando categorías">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700"/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-700"/>
                  <div className="h-2.5 w-1/5 rounded bg-gray-100 dark:bg-gray-700"/>
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-14 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
            <button onClick={() => load()} className="px-5 min-h-[44px] rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold transition-colors">Reintentar</button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40">
                  <tr>
                    {['Imagen','Nombre','Descripción','Productos','Orden','Estado',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {data.map(c => (
                    <tr key={c.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${!c.activo ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        {c.imagenUrl ? (
                          <img src={c.imagenUrl} alt={c.nombre} loading="lazy" className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"/>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <FiImage size={16} className="text-gray-400"/>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 dark:text-white">{c.nombre}</p>
                        <p className="text-[10px] text-gray-400">slug: {c.slug || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                        {c.descripcion || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{c.productosCount}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">{c.orden}</td>
                      <td className="px-4 py-3">
                        {c.activo ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            <FiCheckCircle size={11}/> Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            <FiSlash size={11}/> Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal(c)} disabled={anyBusy} aria-label={`Editar ${c.nombre}`} title="Editar"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40">
                            <FiEdit2 size={14}/>
                          </button>
                          <button onClick={() => handleToggleActivo(c)} disabled={anyBusy}
                            className={`h-8 px-2.5 text-xs font-semibold rounded-full border transition-colors disabled:opacity-40 ${c.activo ? 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500' : 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                            {busyId === c.id ? '…' : c.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => handleDelete(c)} aria-label={`Eliminar ${c.nombre}`}
                            title={c.productosCount > 0 ? 'Tiene productos asociados' : 'Eliminar'}
                            disabled={c.productosCount > 0 || anyBusy}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed">
                            <FiTrash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
              {data.map(c => (
                <div key={c.id} className="p-4 flex flex-col gap-3">
                  <div className={`flex items-start gap-3 ${!c.activo ? 'opacity-60' : ''}`}>
                    {c.imagenUrl ? (
                      <img src={c.imagenUrl} alt="" loading="lazy" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700"/>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <FiImage size={18} className="text-gray-400"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.nombre}</p>
                      <p className="text-xs text-gray-400">{c.productosCount} producto(s) · Orden {c.orden}</p>
                      <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.activo ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                        {c.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(c)} disabled={anyBusy}
                      className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 disabled:opacity-40">
                      <FiEdit2 size={14}/> Editar
                    </button>
                    <button onClick={() => handleToggleActivo(c)} disabled={anyBusy}
                      className="flex-1 min-h-[40px] rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40">
                      {busyId === c.id ? '…' : c.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleDelete(c)} disabled={c.productosCount > 0 || anyBusy}
                      aria-label={`Eliminar ${c.nombre}`}
                      className="min-h-[40px] w-11 inline-flex items-center justify-center rounded-full text-red-500 bg-red-50/60 dark:bg-red-900/10 disabled:opacity-40">
                      <FiTrash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {data.length === 0 && (
              <div className="text-center py-14 px-4 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">{categories.length === 0 ? 'Todavía no hay categorías' : 'Ninguna categoría coincide con la búsqueda'}</p>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <CategoryModal
          category={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(saved, editing) => { showToast(editing ? 'Categoría actualizada' : 'Categoría creada'); load({ silent: true }) }}
        />
      )}
    </div>
  )
}
