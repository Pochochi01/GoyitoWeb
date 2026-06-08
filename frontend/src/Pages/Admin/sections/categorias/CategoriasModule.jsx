import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiCheckCircle, FiSlash } from 'react-icons/fi'
import categoryService from '../../../../api/services/categoryService'

const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function ImageThumb({ src, onRemove, label }) {
  return (
    <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <picture>
        <source srcSet={src} type="image/webp"/>
        <img src={src} alt={label} className="w-full h-full object-cover"/>
      </picture>
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FiX size={10}/>
        </button>
      )}
    </div>
  )
}

function CategoryModal({ category, onClose, onSaved, onError }) {
  const editing = Boolean(category?.id)

  const [form, setForm] = useState({
    nombre:      category?.nombre      || '',
    descripcion: category?.descripcion || '',
    orden:       category?.orden       ?? 0,
    activo:      category?.activo === undefined ? true : category.activo,
  })

  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(category?.imagenUrl || null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('nombre',      form.nombre.trim())
      fd.append('descripcion', form.descripcion || '')
      fd.append('orden',       form.orden || 0)
      fd.append('activo',      form.activo ? 1 : 0)
      if (imageFile) fd.append('imagen', imageFile)

      const saved = editing
        ? await categoryService.update(category.id, fd)
        : await categoryService.create(fd)

      onSaved(saved, editing)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FiX size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Imagen */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Imagen de la categoría
            </label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <ImageThumb src={imagePreview} label="Categoría"
                  onRemove={() => { setImageFile(null); setImagePreview(null) }}/>
              )}
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary cursor-pointer text-sm text-gray-500 dark:text-gray-400 transition-colors">
                <FiImage size={16}/>
                {imagePreview ? 'Cambiar' : 'Subir imagen'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageFile}/>
              </label>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls}
              placeholder="Ej: Auriculares" autoFocus/>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Descripción corta para mostrar en la home (opcional)"/>
          </div>

          {/* Orden + Activo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Orden</label>
              <input name="orden" type="number" min="0" value={form.orden} onChange={handleChange} className={inputCls}/>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Estado</label>
              <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange}
                  className="w-4 h-4 accent-primary"/>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {form.activo ? 'Activa (visible en la tienda)' : 'Inactiva'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : editing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriasModule() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null)
  const [toast,      setToast]      = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const cats = await categoryService.getAll()
      setCategories(cats)
    } catch {
      showToast('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return
    try {
      await categoryService.remove(c.id)
      showToast('Categoría eliminada')
      load()
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleToggleActivo = async (c) => {
    try {
      const fd = new FormData()
      fd.append('activo', c.activo ? 0 : 1)
      await categoryService.update(c.id, fd)
      showToast(c.activo ? 'Categoría desactivada' : 'Categoría activada')
      load()
    } catch {
      showToast('Error al actualizar')
    }
  }

  const data = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter(c =>
      c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q)
    )
  }, [categories, search])

  const activas   = categories.filter(c => c.activo).length
  const inactivas = categories.length - activas

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Activas</p>
          <p className="text-2xl font-bold text-green-600">{activas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Inactivas</p>
          <p className="text-2xl font-bold text-gray-500">{inactivas}</p>
        </div>
      </div>

      {/* Barra superior */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar categoría…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"/>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors flex-shrink-0">
          <FiPlus size={14}/> Nueva categoría
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
                          <picture>
                            <source srcSet={c.imagenUrl} type="image/webp"/>
                            <img src={c.imagenUrl} alt={c.nombre} className="w-12 h-12 object-cover rounded-lg"/>
                          </picture>
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
                      <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                        {c.productosCount}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.orden}</td>
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
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal(c)} className="text-blue-500 hover:text-blue-700" title="Editar">
                            <FiEdit2 size={14}/>
                          </button>
                          <button onClick={() => handleToggleActivo(c)}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors ${c.activo ? 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500' : 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                            title={c.activo ? 'Desactivar' : 'Activar'}>
                            {c.activo ? 'Desact.' : 'Activar'}
                          </button>
                          <button onClick={() => handleDelete(c)}
                            className="text-red-400 hover:text-red-600" title="Eliminar"
                            disabled={c.productosCount > 0}>
                            <FiTrash2 size={14} className={c.productosCount > 0 ? 'opacity-40 cursor-not-allowed' : ''}/>
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
                <div key={c.id} className={`p-4 flex items-start gap-3 ${!c.activo ? 'opacity-60' : ''}`}>
                  {c.imagenUrl ? (
                    <img src={c.imagenUrl} alt={c.nombre} className="w-14 h-14 object-cover rounded-lg flex-shrink-0"/>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FiImage size={18} className="text-gray-400"/>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.productosCount} producto(s)</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setModal(c)} className="text-blue-500"><FiEdit2 size={16}/></button>
                    <button onClick={() => handleDelete(c)} className="text-red-400" disabled={c.productosCount > 0}>
                      <FiTrash2 size={16} className={c.productosCount > 0 ? 'opacity-40' : ''}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {data.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sin categorías</p>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <CategoryModal
          category={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(saved, editing) => showToast(editing ? 'Categoría actualizada' : 'Categoría creada') || load()}
          onError={() => {}}
        />
      )}
    </div>
  )
}
