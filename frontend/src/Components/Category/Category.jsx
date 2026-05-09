/**
 * Category.jsx — Sección de categorías
 * Lee textos e imágenes de DesignContext (clave 'category').
 * Si imageUrl = null usa el asset importado por defecto.
 *
 * Estructura de la grilla (2 filas):
 *  Fila 1: [card-1 x1] [card-2 x1] [card-3 x2 (doble ancho)]
 *  Fila 2: [card-4 x2] [card-5 x1] [card-6 x1]
 *
 * Para agregar filas nuevas:
 *  1. Añadir los cards necesarios en DEFAULT_DESIGN.category.cards (DesignContext.jsx)
 *  2. Agregar una nueva fila en el JSX con la clase grid correspondiente
 *  3. El editor en Diseno.jsx detecta automáticamente los cards extra
 */
import React from 'react'
import earphone    from '../../assets/Category/earphone.png'
import watch       from '../../assets/Category/watch.png'
import speaker     from '../../assets/Category/speaker.png'
import gaming      from '../../assets/Category/gaming.png'
import macbook     from '../../assets/Category/macbook.png'
import smartwatch2 from '../../assets/Category/smartwatch2.png'
import Button      from '../../Components/Shared/button.jsx'
import { useDesign } from '../../context/DesignContext.jsx'

// Assets por defecto para cada card (por índice, posición 0-5)
const DEFAULT_IMGS = [earphone, watch, speaker, gaming, macbook, smartwatch2]

// Estilos fijos por card (gradiente, posicionamiento de imagen, colores de botón)
const CARD_STYLES = [
  { gradient: 'from-black/90 to-white/50',           imgClass: 'w-[150px] h-[200px] absolute top-0 left-14 rotate-180 sm:left-24 lg:h-[200px] lg:w-[200px] lg:left-40', btnBg: 'bg-primary',  btnTxt: 'text-white'       },
  { gradient: 'from-brandYellow to-brandYellow/70',  imgClass: 'w-[200px] h-[200px] absolute top-[0px] -right-8 lg:top-[4px] sm:top-[4px] lg:h-[210px] lg:w-[210px]', btnBg: 'bg-white',   btnTxt: 'text-brandYellow' },
  { gradient: 'from-primary to-primary/70',          imgClass: 'w-[320px] absolute top-1/2 -translate-y-1/2 -right-0',                                                    btnBg: 'bg-white',   btnTxt: 'text-primary'     },
  { gradient: 'from-gray-400 to-gray-200',           imgClass: 'w-[220px] absolute top-1/2 -translate-y-1/2 right-2',                                                     btnBg: 'bg-primary',  btnTxt: 'text-white'       },
  { gradient: 'from-brandGreen to-brandGreen/70',    imgClass: 'w-[170px] h-[170px] absolute top-[0px] -right-2 lg:top-[4px] sm:top-[4px] lg:h-[220px] lg:w-[220px]',  btnBg: 'bg-white',   btnTxt: 'text-brandGreen'  },
  { gradient: 'from-brandBlue to-brandBlue/50',      imgClass: 'w-[150px] h-[150px] absolute top-[0px] -right-2 lg:top-[4px] sm:top-[4px] lg:w-[200px] lg:h-[200px]',  btnBg: 'bg-white',   btnTxt: 'text-brandBlue'   },
]

const CategoryCard = ({ card, style, defaultImg, span = 1 }) => (
  <div className={`${span === 2 ? 'col-span-2' : ''} py-10 pl-2 sm:pl-5
    bg-gradient-to-br ${style.gradient} text-white rounded-3xl relative h-[320px] flex items-end`}>
    <div className="mb-4 sm:pl-2">
      <p className="mb-[2px] text-gray-200">{card.line1}</p>
      <p className="text-2xl font-semibold mb-[2px]">{card.line2}</p>
      <p className="text-3xl xl:text-4xl font-bold opacity-30 mb-4 relative z-10">{card.name}</p>
      <Button text="Ver" bgColor={style.btnBg} textColor={style.btnTxt}/>
    </div>
    <img src={card.imageUrl || defaultImg} alt={card.name} className={style.imgClass}/>
  </div>
)

const Category = () => {
  const { design } = useDesign()
  const h     = design.category.header
  const cards = design.category.cards

  const c = (id) => cards.find(card => card.id === id) || cards[id - 1] || {}

  return (
    <div className="py-5 relative overflow-hidden min-h-[550px]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">{h.tag}</p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">{h.title}</h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">{h.desc}</p>
        </div>

        {/* Fila 1: 1+1+2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-aos="fade-up">
          <CategoryCard card={c(1)} style={CARD_STYLES[0]} defaultImg={DEFAULT_IMGS[0]} span={1}/>
          <CategoryCard card={c(2)} style={CARD_STYLES[1]} defaultImg={DEFAULT_IMGS[1]} span={1}/>
          <CategoryCard card={c(3)} style={CARD_STYLES[2]} defaultImg={DEFAULT_IMGS[2]} span={2}/>
        </div>

        {/* Fila 2: 2+1+1 columnas */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <CategoryCard card={c(4)} style={CARD_STYLES[3]} defaultImg={DEFAULT_IMGS[3]} span={2}/>
          <CategoryCard card={c(5)} style={CARD_STYLES[4]} defaultImg={DEFAULT_IMGS[4]} span={1}/>
          <CategoryCard card={c(6)} style={CARD_STYLES[5]} defaultImg={DEFAULT_IMGS[5]} span={1}/>
        </div>
      </div>
    </div>
  )
}

export default Category
