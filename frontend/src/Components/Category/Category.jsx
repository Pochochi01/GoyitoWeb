/**
 * Category.jsx — Sección de categorías
 *
 * Lee las categorías activas desde la API (`/categories`). El header
 * (tag/title/desc) sigue siendo configurable desde DesignContext.
 *
 * Estructura de la grilla (2 filas):
 *  Fila 1: [cat-1 x1] [cat-2 x1] [cat-3 x2 (doble ancho)]
 *  Fila 2: [cat-4 x2] [cat-5 x1] [cat-6 x1]
 *
 * Si hay menos de 6 categorías activas, los slots vacíos se ocultan.
 * Si hay más, solo se muestran las primeras 6 (ordenadas por `orden`).
 *
 * El botón "Ver" navega a /tienda?categoria=<nombre> y la tienda
 * aplica ese filtro automáticamente.
 */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import earphone    from '../../assets/Category/earphone.png'
import watch       from '../../assets/Category/watch.png'
import speaker     from '../../assets/Category/speaker.png'
import gaming      from '../../assets/Category/gaming.png'
import macbook     from '../../assets/Category/macbook.png'
import smartwatch2 from '../../assets/Category/smartwatch2.png'
import { useDesign } from '../../context/DesignContext.jsx'
import categoryService from '../../api/services/categoryService'

// Imágenes de fallback por índice (cuando la categoría no tiene imagen propia)
const DEFAULT_IMGS = [earphone, watch, speaker, gaming, macbook, smartwatch2]

// Estilo visual fijo por posición (gradiente + ubicación de imagen + colores de botón)
// Las imágenes usan tamaños responsivos: w-[Xpx] como base mobile chico,
// sm:w-[Ypx] para tablet, lg:w-[Zpx] para desktop. Esto evita que se desborden.
const CARD_STYLES = [
  { gradient: 'from-black/90 to-white/50',           imgClass: 'w-[120px] h-[160px] sm:w-[150px] sm:h-[200px] lg:w-[200px] lg:h-[200px] absolute top-2 right-2 sm:left-24 sm:right-auto lg:left-40 rotate-180',          btnBg: 'bg-primary',  btnTxt: 'text-white'       },
  { gradient: 'from-brandYellow to-brandYellow/70',  imgClass: 'w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] lg:w-[210px] lg:h-[210px] absolute top-2 -right-4 sm:top-[4px] sm:-right-8',                              btnBg: 'bg-white',   btnTxt: 'text-brandYellow' },
  { gradient: 'from-primary to-primary/70',          imgClass: 'w-[180px] sm:w-[260px] lg:w-[320px] h-auto absolute top-1/2 -translate-y-1/2 -right-4 sm:right-0',                                                       btnBg: 'bg-white',   btnTxt: 'text-primary'     },
  { gradient: 'from-gray-400 to-gray-200',           imgClass: 'w-[160px] sm:w-[200px] lg:w-[220px] h-auto absolute top-1/2 -translate-y-1/2 right-2',                                                                    btnBg: 'bg-primary',  btnTxt: 'text-white'       },
  { gradient: 'from-brandGreen to-brandGreen/70',    imgClass: 'w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] lg:w-[220px] lg:h-[220px] absolute top-2 -right-2 sm:top-[4px]',                                           btnBg: 'bg-white',   btnTxt: 'text-brandGreen'  },
  { gradient: 'from-brandBlue to-brandBlue/50',      imgClass: 'w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] lg:w-[200px] lg:h-[200px] absolute top-2 -right-2 sm:top-[4px]',                                           btnBg: 'bg-white',   btnTxt: 'text-brandBlue'   },
]

const CategoryCard = ({ category, style, defaultImg, span = 1 }) => {
  // En mobile (< sm) NO se aplica col-span-2 — todas las cards ocupan ancho completo.
  // El doble ancho solo importa cuando hay grid de 3+ columnas.
  const spanCls = span === 2 ? 'sm:col-span-2' : ''
  if (!category) {
    return (
      <div className={`${spanCls} rounded-2xl sm:rounded-3xl h-[220px] sm:h-[280px] lg:h-[320px] bg-gray-100 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700`}/>
    )
  }
  const imgSrc = category.imagenUrl || defaultImg
  const target = `/tienda?categoria=${encodeURIComponent(category.nombre)}`
  return (
    <div className={`${spanCls} py-6 sm:py-10 pl-3 sm:pl-5
      bg-gradient-to-br ${style.gradient} text-white rounded-2xl sm:rounded-3xl relative
      h-[220px] sm:h-[280px] lg:h-[320px]
      flex items-end overflow-hidden`}>
      <div className="mb-2 sm:mb-4 sm:pl-2 max-w-[55%] sm:max-w-[60%]">
        <p className="mb-[2px] text-gray-200 text-xs sm:text-sm">Disfruta</p>
        <p className="text-lg sm:text-2xl font-semibold mb-[2px]">Con</p>
        <p className="text-xl sm:text-3xl xl:text-4xl font-bold opacity-30 mb-3 sm:mb-4 relative z-10 line-clamp-2 break-words">{category.nombre}</p>
        <Link to={target}
          className={`${style.btnBg} ${style.btnTxt} inline-flex items-center cursor-pointer hover:scale-105 duration-300
            py-2 px-5 sm:px-8 rounded-full relative z-10 text-xs sm:text-sm font-semibold
            min-h-[40px] sm:min-h-[44px]`}>
          Ver
        </Link>
      </div>
      <img src={imgSrc} alt={category.nombre} className={`${style.imgClass} object-contain pointer-events-none`}/>
    </div>
  )
}

const Category = () => {
  const { design } = useDesign()
  const h = design.category.header

  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    categoryService.getAll()
      .then(cats => setCategories(cats.filter(c => c.activo).slice(0, 6)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  // Acceder a la posición n (0-5); si no existe devuelve null y se renderiza placeholder
  const cat = (i) => categories[i] || null

  return (
    <div className="py-5 relative overflow-hidden min-h-[550px]">
      <div className="container">
        {/* Header — sigue siendo editable desde Diseño */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">{h.tag}</p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">{h.title}</h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">{h.desc}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hay categorías activas para mostrar.
          </div>
        ) : (
          <>
            {/* Fila 1: 1+1+2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-aos="fade-up">
              <CategoryCard category={cat(0)} style={CARD_STYLES[0]} defaultImg={DEFAULT_IMGS[0]} span={1}/>
              <CategoryCard category={cat(1)} style={CARD_STYLES[1]} defaultImg={DEFAULT_IMGS[1]} span={1}/>
              <CategoryCard category={cat(2)} style={CARD_STYLES[2]} defaultImg={DEFAULT_IMGS[2]} span={2}/>
            </div>

            {/* Fila 2: 2+1+1 columnas */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard category={cat(3)} style={CARD_STYLES[3]} defaultImg={DEFAULT_IMGS[3]} span={2}/>
              <CategoryCard category={cat(4)} style={CARD_STYLES[4]} defaultImg={DEFAULT_IMGS[4]} span={1}/>
              <CategoryCard category={cat(5)} style={CARD_STYLES[5]} defaultImg={DEFAULT_IMGS[5]} span={1}/>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Category
