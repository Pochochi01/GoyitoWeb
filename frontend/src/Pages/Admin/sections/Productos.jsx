import React, { useState } from 'react'
import { FiUpload, FiX, FiSave, FiPackage } from 'react-icons/fi'
import { CATEGORIES } from '../../../data/products.js'

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c !== 'Todos')

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
const labelClass = "block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5"

const EMPTY_FORM = {
  name: '', description: '', category: PRODUCT_CATEGORIES[0],
  costPrice: '', salePrice: '', stock: '', location: '',
}

const Productos = () => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([null, null, null, null])
  const [saved, setSaved] = useState(false)
  const [products, setProducts] = useState([])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleImage = (i, e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImages((prev) => prev.map((v, idx) => idx === i ? url : v))
  }

  const removeImage = (i) => setImages((prev) => prev.map((v, idx) => idx === i ? null : v))

  const handleSubmit = (e) => {
    e.preventDefault()
    const newProduct = { ...form, id: Date.now(), images: images.filter(Boolean) }
    setProducts((prev) => [newProduct, ...prev])
    setForm(EMPTY_FORM)
    setImages([null, null, null, null])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
          <FiPackage className="text-primary" /> Cargar nuevo producto
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Image grid */}
          <div>
            <label className={labelClass}>Fotos del producto (máx. 4)</label>
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <label key={i} className={`relative flex items-center justify-center h-24 rounded-xl border-2
                              cursor-pointer transition-all duration-200 overflow-hidden
                              ${img ? 'border-primary' : 'border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:bg-primary/5'}`}>
                  {img ? (
                    <>
                      <img src={img} alt={`foto-${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.preventDefault(); removeImage(i) }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                                   flex items-center justify-center text-xs hover:bg-red-600">
                        <FiX size={10} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <FiUpload size={18} />
                      <span className="text-[10px]">Foto {i + 1}</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImage(i, e)} disabled={!!img} />
                </label>
              ))}
            </div>
          </div>

          {/* Name + category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre del producto</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Ej: Auricular JBL Pro" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describí el producto..." rows={3}
              className={inputClass + ' resize-none'} />
          </div>

          {/* Prices + stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Precio costo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange}
                  placeholder="0.00" required className={inputClass + ' pl-7'} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Precio venta</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange}
                  placeholder="0.00" required className={inputClass + ' pl-7'} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Stock total</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange}
                placeholder="0" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ubicación depósito</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="Ej: Estante A-3" className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
                          text-white transition-colors duration-200
                          ${saved ? 'bg-green-500' : 'bg-primary hover:bg-red-600'}`}>
              <FiSave size={14} />
              {saved ? '¡Producto cargado!' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>

      {/* Product list */}
      {products.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Productos cargados en sesión ({products.length})
          </h3>
          <div className="flex flex-col gap-3">
            {products.map((p) => (
              <div key={p.id}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                {p.images[0]
                  ? <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt={p.name} />
                  : <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                      <FiPackage className="text-gray-400" />
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category} · Stock: {p.stock} · Depósito: {p.location || '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary text-sm">${p.salePrice}</p>
                  <p className="text-xs text-gray-400">costo: ${p.costPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos
