import React, { useState, useEffect, useCallback } from 'react'
import { FiStar, FiPhone, FiMail, FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import supplierService from '../../../../../api/services/supplierService'
import purchaseOrderService from '../../../../../api/services/purchaseOrderService'

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} size={12} className={i<=Math.round(rating)?'text-yellow-400 fill-yellow-400':'text-gray-300'}/>
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating}</span>
  </div>
)

const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

function HistorialModal({ supplier, onClose }) {
  const [historial, setHistorial] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    purchaseOrderService.getAll({ proveedor_id: supplier.id })
      .then(setHistorial).catch(() => setHistorial([]))
      .finally(() => setLoading(false))
  }, [supplier.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">{supplier.nombre}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><FiX size={20}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-400">CUIT</p><p className="font-mono font-semibold dark:text-white">{supplier.cuit}</p></div>
            <div><p className="text-xs text-gray-400">Condición de pago</p><p className="font-semibold dark:text-white">{supplier.cond_pago||'—'}</p></div>
            <div><p className="text-xs text-gray-400">Contacto</p><p className="font-semibold dark:text-white">{supplier.contacto||'—'}</p></div>
            <div><p className="text-xs text-gray-400">Puntaje</p><Stars rating={supplier.puntaje}/></div>
            <div className="flex items-center gap-1.5 text-xs text-blue-500"><FiMail size={12}/>{supplier.email||'—'}</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><FiPhone size={12}/>{supplier.tel||'—'}</div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Historial de órdenes</p>
            {loading ? (
              <div className="flex justify-center py-6"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
            ) : historial.length > 0 ? (
              <div className="flex flex-col gap-2">
                {historial.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/40 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-gray-500">#{c.id}</p>
                      <p className="text-xs text-gray-400">{c.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">${Number(c.total).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.estado==='Recibida'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{c.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Sin órdenes registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SupplierModal({ supplier, onClose, onSaved }) {
  const editing = Boolean(supplier?.id)
  const [form, setForm] = useState({
    nombre:    supplier?.nombre    || '',
    cuit:      supplier?.cuit      || '',
    contacto:  supplier?.contacto  || '',
    email:     supplier?.email     || '',
    tel:       supplier?.tel       || '',
    cond_pago: supplier?.cond_pago || '',
    puntaje:   supplier?.puntaje   || 5,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cuit) { setError('Nombre y CUIT son obligatorios'); return }
    setLoading(true)
    try {
      editing ? await supplierService.update(supplier.id, form) : await supplierService.create(form)
      onSaved(); onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Razón social"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">CUIT *</label>
              <input name="cuit" value={form.cuit} onChange={handleChange} className={inputCls} placeholder="20-12345678-9"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Condición de pago</label>
              <input name="cond_pago" value={form.cond_pago} onChange={handleChange} className={inputCls} placeholder="30 días"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
              <input name="tel" value={form.tel} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Contacto</label>
              <input name="contacto" value={form.contacto} onChange={handleChange} className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Puntaje (1-5)</label>
              <input name="puntaje" type="number" min="1" max="5" step="0.1" value={form.puntaje} onChange={handleChange} className={inputCls}/>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-primary hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CompProveedores() {
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [historial, setHistorial] = useState(null)
  const [toast,     setToast]     = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try { setSuppliers(await supplierService.getAll()) } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar "${s.nombre}"?`)) return
    try { await supplierService.remove(s.id); showToast('Proveedor eliminado'); load() }
    catch (e) { showToast(e.response?.data?.message || 'Error al eliminar') }
  }

  return (
    <>
      {toast && <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}

      <div className="flex flex-col gap-5">
        <div className="flex justify-end">
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors">
            <FiPlus size={14}/> Nuevo proveedor
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{s.nombre}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{s.cuit}</p>
                  </div>
                  <Stars rating={s.puntaje}/>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {s.email && <div className="flex items-center gap-1.5"><FiMail size={11}/>{s.email}</div>}
                  {s.tel   && <div className="flex items-center gap-1.5"><FiPhone size={11}/>{s.tel}</div>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-blue-600">{s.cond_pago||'—'}</p>
                    <p className="text-[10px] text-gray-400">Pago</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl py-1.5">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate">{s.contacto||'—'}</p>
                    <p className="text-[10px] text-gray-400">Contacto</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setHistorial(s)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-all">Ver historial</button>
                  <button onClick={() => setModal(s)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 text-blue-500 hover:border-blue-400 transition-all"><FiEdit2 size={14}/></button>
                  <button onClick={() => handleDelete(s)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 text-red-400 hover:border-red-400 transition-all"><FiTrash2 size={14}/></button>
                </div>
              </div>
            ))}
            {!loading && suppliers.length === 0 && <p className="col-span-3 text-center text-gray-400 py-10">Sin proveedores registrados</p>}
          </div>
        )}
      </div>

      {modal && (
        <SupplierModal
          supplier={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { showToast(modal === 'create' ? 'Proveedor creado' : 'Proveedor actualizado'); load() }}
        />
      )}
      {historial && <HistorialModal supplier={historial} onClose={() => setHistorial(null)}/>}
    </>
  )
}
