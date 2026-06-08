/**
 * Diseno.jsx — Panel de edición de contenidos del sitio
 * Usa DesignContext para persistir cambios en localStorage.
 *
 * Secciones:
 *  1. Hero Slider   — hasta 5 slides con imagen, título y subtítulo
 *  2. Category      — header + 6 cards (textos e imágenes)
 *  3. OtherServices — lista de servicios editables (icon, title, description)
 *  4. Banner        — imagen, textos y color (solo frontend por ahora)
 *  5. Blogs         — 3 artículos destacados
 */
import React, { useState, useEffect, useRef } from 'react'
import { FiUpload, FiSave, FiPlus, FiTrash2, FiChevronLeft,
         FiChevronRight, FiRefreshCw, FiImage, FiAlertCircle,
         FiPhone, FiMessageSquare, FiExternalLink, FiCheck } from 'react-icons/fi'
import { useDesign, DEFAULT_DESIGN } from '../../../context/DesignContext.jsx'
import { ICON_MAP } from '../../../Components/OtherServices/OtherServices.jsx'

// ─── Helpers ─────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200'

const MAX_IMG_MB = 1.5

/** Lee un File y lo devuelve como base64. Rechaza si supera MAX_IMG_MB. */
const toBase64 = (file) => new Promise((resolve, reject) => {
  if (file.size > MAX_IMG_MB * 1024 * 1024) {
    reject(new Error(`La imagen supera ${MAX_IMG_MB} MB. Reducí su tamaño.`))
    return
  }
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload  = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Error al leer el archivo'))
})

// ─── Componentes UI ───────────────────────────────────────────
const SectionCard = ({ title, children, tip }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
    <div className="flex items-start justify-between gap-3 mb-5">
      <h3 className="text-base font-bold text-gray-800 dark:text-white">{title}</h3>
      {tip && (
        <div className="flex items-start gap-1.5 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl max-w-xs">
          <FiAlertCircle size={13} className="flex-shrink-0 mt-0.5"/>
          <span>{tip}</span>
        </div>
      )}
    </div>
    {children}
  </div>
)

const SaveBtn = ({ onClick, saved, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors duration-200
      ${saved ? 'bg-green-500' : 'bg-primary hover:bg-red-600'}`}>
    <FiSave size={14}/>
    {saved ? '¡Guardado!' : `Guardar ${label}`}
  </button>
)

const useSaveBtn = () => {
  const [saved, setSaved] = useState(false)
  const trigger = (fn) => { fn(); setSaved(true); setTimeout(() => setSaved(false), 2200) }
  return { saved, trigger }
}

/** Upload de imagen individual → devuelve base64 */
const ImageUpload = ({ preview, onBase64, label, height = 'h-32', imgClass = 'object-cover' }) => {
  const [err, setErr] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setErr('')
    try {
      const b64 = await toBase64(file)
      onBase64(b64)
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>}
      <label className={`flex flex-col items-center justify-center w-full ${height} border-2 border-dashed
                         border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer
                         hover:border-primary hover:bg-primary/5 transition-all duration-200 overflow-hidden relative`}>
        {preview
          ? <img src={preview} alt="" className={`w-full h-full ${imgClass}`}/>
          : <div className="flex flex-col items-center gap-2 text-gray-400">
              <FiImage size={22}/>
              <span className="text-xs">Subir imagen</span>
              <span className="text-[10px] text-gray-300">máx. {MAX_IMG_MB} MB</span>
            </div>
        }
        <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
      </label>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      {preview && (
        <button onClick={() => onBase64(null)}
          className="text-xs text-gray-400 hover:text-red-400 mt-1 transition-colors">
          Quitar imagen
        </button>
      )}
    </div>
  )
}

// ─── 1. HERO EDITOR ──────────────────────────────────────────
/**
 * HeroEditor — Maneja hasta 5 slides.
 * Cada slide: imagen (base64), título, subtítulo, texto de fondo (bg).
 *
 * Para extender:
 *  - Cambiar MAX_SLIDES (máx. recomendado: 8 para no saturar el slider)
 *  - Agregar campos extra en DEFAULT_DESIGN.hero.slides
 */
const MAX_SLIDES = 5

function HeroEditor() {
  const { design, updateHero } = useDesign()
  const { saved, trigger }     = useSaveBtn()
  const [slides, setSlides]    = useState(() => design.hero.slides)
  const [preview, setPreview]  = useState(0)
  const timerRef               = useRef()

  // Auto-avance del preview
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPreview(i => (i + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  const update = (idx, field, val) =>
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))

  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) return
    setSlides(prev => [...prev, {
      id:       Date.now(),
      title:    'Nuevo slide',
      subtitle: 'Subtítulo',
      bg:       'Categoría',
      imageUrl: null,
    }])
  }

  const removeSlide = (idx) => {
    if (slides.length <= 1) return
    setSlides(prev => { const next = prev.filter((_, i) => i !== idx); setPreview(0); return next })
  }

  const handleSave = () => trigger(() => updateHero({ slides }))

  const current = slides[preview] || slides[0]

  return (
    <SectionCard title="🖼️ Hero — Slider principal"
      tip={`Máx. ${MAX_SLIDES} slides. Las imágenes se guardan como base64 en el navegador (máx. ${MAX_IMG_MB} MB c/u).`}>

      {/* Mini preview */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 h-28 mb-5 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-xs text-gray-400">{current.subtitle}</p>
          <p className="text-lg font-bold text-gray-700 dark:text-white">{current.title}</p>
          <p className="text-sm text-gray-400 uppercase opacity-50">{current.bg}</p>
        </div>
        {current.imageUrl && (
          <img src={current.imageUrl} alt="" className="absolute right-4 h-24 object-contain drop-shadow-md"/>
        )}
        {/* Controles */}
        <button onClick={() => setPreview(i => (i - 1 + slides.length) % slides.length)}
          className="absolute left-2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow text-gray-600 hover:text-primary">
          <FiChevronLeft size={16}/>
        </button>
        <button onClick={() => setPreview(i => (i + 1) % slides.length)}
          className="absolute right-2 p-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow text-gray-600 hover:text-primary">
          <FiChevronRight size={16}/>
        </button>
        {/* Dots */}
        <div className="absolute bottom-2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setPreview(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === preview ? 'bg-primary w-4' : 'bg-gray-400'}`}/>
          ))}
        </div>
      </div>

      {/* Lista de slides */}
      <div className="flex flex-col gap-4">
        {slides.map((slide, idx) => (
          <div key={slide.id}
            className={`p-4 rounded-xl border-2 transition-colors ${preview === idx ? 'border-primary/40 bg-primary/5' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Slide {idx + 1} {preview === idx && <span className="text-primary ml-1">● activo</span>}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPreview(idx)}
                  className="text-xs text-blue-500 hover:underline">Vista previa</button>
                {slides.length > 1 && (
                  <button onClick={() => removeSlide(idx)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <FiTrash2 size={11}/> Eliminar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
              {/* Imagen */}
              <div className="sm:col-span-1">
                <ImageUpload
                  preview={slide.imageUrl}
                  onBase64={b64 => update(idx, 'imageUrl', b64)}
                  label="Imagen del slide"
                  height="h-24"
                  imgClass="object-contain"
                />
              </div>
              {/* Textos */}
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título (h1)</label>
                  <input value={slide.title} onChange={e => update(idx, 'title', e.target.value)} className={inputCls} placeholder="Ej: Auriculares"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtítulo (p)</label>
                  <input value={slide.subtitle} onChange={e => update(idx, 'subtitle', e.target.value)} className={inputCls} placeholder="Ej: Solo lo Mejor"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fondo (texto grande)</label>
                  <input value={slide.bg} onChange={e => update(idx, 'bg', e.target.value)} className={inputCls} placeholder="Ej: Auriculares"/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agregar slide */}
      <div className="flex items-center gap-3 mt-4">
        <button onClick={addSlide} disabled={slides.length >= MAX_SLIDES}
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <FiPlus size={14}/> Agregar slide ({slides.length}/{MAX_SLIDES})
        </button>
        <div className="flex-1"/>
        <SaveBtn onClick={handleSave} saved={saved} label="Hero"/>
      </div>
    </SectionCard>
  )
}

// ─── 2. CATEGORY EDITOR ──────────────────────────────────────
/**
 * CategoryEditor — Edita header y 6 cards de la sección de categorías.
 *
 * Para agregar una nueva fila de cards:
 *  1. Agregar los cards en DEFAULT_DESIGN.category.cards (DesignContext.jsx)
 *  2. Agregar la fila en Category.jsx
 *  3. El editor los detecta automáticamente
 */
const CARD_LABELS = ['Auriculares (F1-C1)', 'SmartWatch (F1-C2)', 'Parlantes (F1-C3 doble)',
                     'PlayStation (F2-C1 doble)', 'Laptop (F2-C2)', 'SmartWatch (F2-C3)']

function CategoryEditor() {
  const { design, updateCategory } = useDesign()
  const { saved, trigger }         = useSaveBtn()
  const [cat,   setCat]  = useState(() => design.category)
  const [openCard, setOpenCard] = useState(null)

  const updateHeader = (field, val) =>
    setCat(prev => ({ ...prev, header: { ...prev.header, [field]: val } }))

  const updateCard = (idx, field, val) =>
    setCat(prev => ({
      ...prev,
      cards: prev.cards.map((c, i) => i === idx ? { ...c, [field]: val } : c),
    }))

  const handleSave = () => trigger(() => updateCategory(cat))

  return (
    <SectionCard title="🗂️ Category — Grilla de categorías"
      tip="La estructura de 2 filas y el responsive se mantienen automáticamente. Editás solo los textos y las imágenes.">

      {/* Header */}
      <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Encabezado de sección</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Etiqueta (tag)</label>
            <input value={cat.header.tag} onChange={e => updateHeader('tag', e.target.value)} className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título (h1)</label>
            <input value={cat.header.title} onChange={e => updateHeader('title', e.target.value)} className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Descripción (p)</label>
            <input value={cat.header.desc} onChange={e => updateHeader('desc', e.target.value)} className={inputCls}/>
          </div>
        </div>
      </div>

      {/* Aviso: las cards ahora se gestionan en el módulo Categorías */}
      <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
        💡 Las tarjetas de categorías (imagen, nombre, etc.) se gestionan desde
        el módulo <strong>Categorías</strong> del panel. Acá editás únicamente
        el encabezado de la sección (etiqueta, título y descripción).
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cat.cards.map((card, idx) => (
          <div key={card.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Header card */}
            <button onClick={() => setOpenCard(openCard === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{CARD_LABELS[idx] || `Card ${idx+1}`}</span>
              <span className="text-xs text-gray-400">{openCard === idx ? '▲' : '▼'}</span>
            </button>

            {openCard === idx && (
              <div className="p-4 flex flex-col gap-3">
                {/* Imagen */}
                <ImageUpload
                  preview={card.imageUrl}
                  onBase64={b64 => updateCard(idx, 'imageUrl', b64)}
                  label="Imagen del card"
                  height="h-28"
                  imgClass="object-contain"
                />
                {/* Textos */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Línea 1 (p pequeño)</label>
                  <input value={card.line1} onChange={e => updateCard(idx, 'line1', e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Línea 2 (p mediano)</label>
                  <input value={card.line2} onChange={e => updateCard(idx, 'line2', e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre (texto grande)</label>
                  <input value={card.name} onChange={e => updateCard(idx, 'name', e.target.value)} className={inputCls}/>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end"><SaveBtn onClick={handleSave} saved={saved} label="Categorías"/></div>
    </SectionCard>
  )
}

// ─── 3. SERVICES EDITOR ──────────────────────────────────────
/**
 * ServicesEditor — Edita el arreglo de servicios de OtherServices.
 *
 * Para agregar un nuevo icono al selector:
 *  1. Importarlo en OtherServices.jsx y agregarlo al ICON_MAP
 *  2. El selector lo detecta automáticamente
 */
function ServicesEditor() {
  const { design, updateServices } = useDesign()
  const { saved, trigger }         = useSaveBtn()
  const [services, setServices]    = useState(() => design.services)

  const update = (idx, field, val) =>
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))

  const addService = () => {
    setServices(prev => [...prev, {
      id:          Date.now(),
      icon:        'FaCheckCircle',
      title:       'Nuevo servicio',
      description: 'Descripción del servicio',
    }])
  }

  const removeService = (idx) => {
    if (services.length <= 1) return
    setServices(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => trigger(() => updateServices(services))

  const iconNames = Object.keys(ICON_MAP)

  return (
    <SectionCard title="⭐ Servicios destacados — OtherServices"
      tip="Para agregar iconos nuevos, importá el componente en OtherServices.jsx y añadilo al ICON_MAP.">

      <div className="flex flex-col gap-3">
        {services.map((svc, idx) => {
          const IconComp = ICON_MAP[svc.icon]
          return (
            <div key={svc.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              {/* Preview icono */}
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                {IconComp && <IconComp className="text-3xl text-primary"/>}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Selector de ícono */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Ícono</label>
                  <select value={svc.icon} onChange={e => update(idx, 'icon', e.target.value)}
                    className={inputCls}>
                    {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título</label>
                  <input value={svc.title} onChange={e => update(idx, 'title', e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
                  <input value={svc.description} onChange={e => update(idx, 'description', e.target.value)} className={inputCls}/>
                </div>
              </div>

              <button onClick={() => removeService(idx)} disabled={services.length <= 1}
                className="flex-shrink-0 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors mt-1">
                <FiTrash2 size={16}/>
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={addService}
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
          <FiPlus size={14}/> Agregar servicio
        </button>
        <div className="flex-1"/>
        <SaveBtn onClick={handleSave} saved={saved} label="Servicios"/>
      </div>
    </SectionCard>
  )
}

// ─── 4. BANNER EDITOR (existente, mejorado) ───────────────────
function BannerEditor() {
  const { saved, trigger } = useSaveBtn()
  const [bannerImg, setBannerImg] = useState(null)
  const [banner,    setBanner]    = useState({ title: 'Mejor Sonido', discount: '30% OFF', color: '#f42c37', subtitle: 'Oferta de Verano' })

  return (
    <SectionCard title="🎯 Banner — Promocional">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ImageUpload label="Imagen del banner" preview={bannerImg} onBase64={setBannerImg}/>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título</label>
            <input value={banner.title} onChange={e => setBanner(p => ({ ...p, title: e.target.value }))} className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtítulo</label>
            <input value={banner.subtitle} onChange={e => setBanner(p => ({ ...p, subtitle: e.target.value }))} className={inputCls}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Descuento</label>
              <input value={banner.discount} onChange={e => setBanner(p => ({ ...p, discount: e.target.value }))} placeholder="30% OFF" className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Color de fondo</label>
              <div className="flex items-center gap-2">
                <input type="color" value={banner.color} onChange={e => setBanner(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"/>
                <span className="text-sm text-gray-500 font-mono">{banner.color}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <SaveBtn onClick={() => trigger(() => {})} saved={saved} label="Banner"/>
      </div>
    </SectionCard>
  )
}

// ─── 5. BLOGS EDITOR (existente) ─────────────────────────────
function BlogsEditor() {
  const { saved, trigger } = useSaveBtn()
  const [blogs, setBlogs] = useState([
    { title: 'Los mejores auriculares de 2025', subtitle: 'Guía de compra completa', img: null },
    { title: 'Smartwatches: todo lo que necesitás saber', subtitle: 'Comparativa detallada', img: null },
    { title: 'MacBook vs. Windows: ¿cuál elegir?', subtitle: 'Análisis profesional', img: null },
  ])

  const updateBlog = (i, field, val) =>
    setBlogs(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))

  return (
    <SectionCard title="📰 Blogs — Artículos destacados">
      <div className="flex flex-col gap-5">
        {blogs.map((blog, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
            <div className="sm:w-32 flex-shrink-0">
              <ImageUpload label={`Blog ${i + 1}`} preview={blog.img} onBase64={url => updateBlog(i, 'img', url)} height="h-24"/>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título</label>
                <input value={blog.title} onChange={e => updateBlog(i, 'title', e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtítulo</label>
                <input value={blog.subtitle} onChange={e => updateBlog(i, 'subtitle', e.target.value)} className={inputCls}/>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <SaveBtn onClick={() => trigger(() => {})} saved={saved} label="Blogs"/>
      </div>
    </SectionCard>
  )
}

// ─── 6. WHATSAPP EDITOR ──────────────────────────────────────
function WhatsAppEditor() {
  const { design, updateWhatsapp } = useDesign()
  const { saved, trigger }         = useSaveBtn()

  const [numero,  setNumero]  = useState(() => design.whatsapp?.numero  || '')
  const [mensaje, setMensaje] = useState(() => design.whatsapp?.mensaje || '')
  const [error,   setError]   = useState('')

  const handleSave = () => {
    const num = numero.trim()
    if (!num) { setError('Ingresá un número de WhatsApp.'); return }
    const digits = num.replace(/\D/g, '')
    if (digits.length < 8) { setError('El número parece demasiado corto. Incluí el código de país (ej: 549...).'); return }
    setError('')
    trigger(() => updateWhatsapp({ numero: num, mensaje: mensaje.trim() }))
  }

  const clean      = numero.replace(/[\s\-\+\(\)]/g, '')
  const previewUrl = clean.length >= 8
    ? `https://wa.me/${clean}${mensaje.trim() ? `?text=${encodeURIComponent(mensaje.trim())}` : ''}`
    : null

  return (
    <SectionCard
      title="💬 WhatsApp — Botón flotante"
      tip="El botón aparece en Inicio y Tienda. Si el número está vacío, el botón se oculta automáticamente."
    >
      <div className="flex flex-col gap-5">
        {/* Número */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Número de WhatsApp
          </label>
          <div className="relative">
            <FiPhone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={numero}
              onChange={e => { setNumero(e.target.value); setError('') }}
              placeholder="Ej: 5493512345678  (código de país + área + número)"
              className={`${inputCls} pl-9`}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Sin + ni espacios. Ej: <span className="font-mono">5493515551234</span> → Argentina (549) + Córdoba (351) + número
          </p>
        </div>

        {/* Mensaje predeterminado */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Mensaje predeterminado
          </label>
          <div className="relative">
            <FiMessageSquare size={15} className="absolute left-3 top-3 text-gray-400"/>
            <textarea
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              rows={3}
              placeholder="Hola! Me comunico desde la tienda online..."
              className={`${inputCls} pl-9 resize-none`}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Este texto se pre-carga en el chat de WhatsApp al hacer click en el botón.
          </p>
        </div>

        {/* Preview del link */}
        {previewUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow text-white text-lg">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">Vista previa del enlace</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono mt-0.5">{previewUrl}</p>
            </div>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:underline flex-shrink-0">
              <FiExternalLink size={13}/> Probar
            </a>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-xs text-gray-400 text-center">
            Ingresá un número válido para ver la vista previa del botón
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <FiAlertCircle size={14}/> {error}
          </div>
        )}

        {/* Guardar */}
        <div className="flex justify-end">
          <SaveBtn onClick={handleSave} saved={saved} label="WhatsApp"/>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Componente raíz ─────────────────────────────────────────
const Diseno = () => {
  const { resetDesign } = useDesign()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return }
    resetDesign()
    setConfirmReset(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Editor de Diseño</h2>
          <p className="text-xs text-gray-400 mt-0.5">Los cambios se guardan en el navegador (localStorage).</p>
        </div>
        <button onClick={handleReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors
            ${confirmReset
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-400'}`}>
          <FiRefreshCw size={13}/>
          {confirmReset ? 'Confirmar reset' : 'Restablecer todo'}
        </button>
      </div>

      <WhatsAppEditor/>
      <HeroEditor/>
      <CategoryEditor/>
      <ServicesEditor/>
      <BannerEditor/>
      <BlogsEditor/>
    </div>
  )
}

export default Diseno
