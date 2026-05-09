import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FaCartShopping, FaTag } from 'react-icons/fa6'
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from 'react-icons/fi'
import { useCart } from '../../context/CartContext.jsx'

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, title, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = saved
      window.removeEventListener('keydown', onKey)
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // Sync idx when images change (shouldn't, but just in case)
  useEffect(() => { setIdx(startIndex) }, [startIndex])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4 py-6"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm"/>

      {/* Panel — stopPropagation para no cerrar al hacer click dentro */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-1 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25
                     text-white flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <FiX size={20}/>
        </button>

        {/* Imagen principal */}
        <div className="relative flex items-center justify-center w-full">
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-0 sm:-left-12 z-10 w-10 h-10 rounded-full
                         bg-white/10 hover:bg-white/25 text-white flex items-center
                         justify-center transition-colors flex-shrink-0"
              aria-label="Imagen anterior"
            >
              <FiChevronLeft size={22}/>
            </button>
          )}

          <img
            src={images[idx]}
            alt={`${title} — imagen ${idx + 1}`}
            className="max-h-[65vh] w-auto max-w-full rounded-xl shadow-2xl object-contain select-none"
            draggable={false}
          />

          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-0 sm:-right-12 z-10 w-10 h-10 rounded-full
                         bg-white/10 hover:bg-white/25 text-white flex items-center
                         justify-center transition-colors flex-shrink-0"
              aria-label="Imagen siguiente"
            >
              <FiChevronRight size={22}/>
            </button>
          )}
        </div>

        {/* Nombre + contador */}
        <div className="text-center">
          <p className="text-white font-semibold text-sm leading-snug">{title}</p>
          {images.length > 1 && (
            <p className="text-white/40 text-xs mt-0.5">{idx + 1} / {images.length}</p>
          )}
        </div>

        {/* Miniaturas (solo si hay más de 1) */}
        {images.length > 1 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0
                            transition-all duration-200
                            ${i === idx
                              ? 'border-white scale-110 shadow-lg opacity-100'
                              : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'}`}
              >
                <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        )}

        {/* Hint teclas */}
        {images.length > 1 && (
          <p className="text-white/25 text-[10px] mt-1 select-none">
            ← → para navegar · ESC para cerrar
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const ShopProductCard = ({ product }) => {
  const [mainImage,    setMainImage]    = useState(product.images[0])
  const [added,        setAdded]        = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const discountedPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(0)
    : null

  const currentIdx = product.images.indexOf(mainImage)
  const startIndex = currentIdx >= 0 ? currentIdx : 0

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl
                   duration-300 overflow-hidden flex flex-col group"
        data-aos="fade-up"
        data-aos-delay={product.aosDelay}
      >
        {/* Imagen principal — clickeable para abrir lightbox */}
        <div
          className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay con icono zoom al hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300
                          flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
                            transition-all duration-300 shadow-md">
              <FiZoomIn size={18} className="text-gray-700"/>
            </div>
          </div>

          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold
                             px-2 py-1 rounded-full flex items-center gap-1">
              <FaTag className="text-[10px]"/>
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Miniaturas */}
        <div className="flex gap-2 px-3 pt-3">
          {product.images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200
                ${mainImage === img
                  ? 'border-primary scale-105 shadow-sm'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
            >
              <img
                src={img}
                alt={`${product.title} vista ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug line-clamp-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            {discountedPrice ? (
              <>
                <span className="text-primary font-bold text-lg">${discountedPrice}</span>
                <span className="text-gray-400 line-through text-sm">${product.price}</span>
              </>
            ) : (
              <span className="text-gray-800 dark:text-white font-bold text-lg">${product.price}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`mt-2 flex items-center justify-center gap-2 w-full
                       font-semibold py-2 px-4 rounded-full text-sm duration-200 active:scale-95
                       ${added
                         ? 'bg-brandGreen text-white'
                         : 'bg-primary hover:bg-red-600 text-white'}`}
          >
            <FaCartShopping/>
            {added ? '¡Agregado!' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>

      {/* Lightbox (portal — fuera del overflow-hidden de la card) */}
      {lightboxOpen && (
        <Lightbox
          images={product.images}
          startIndex={startIndex}
          title={product.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

export default ShopProductCard
