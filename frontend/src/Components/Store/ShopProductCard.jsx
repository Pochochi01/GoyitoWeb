import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FaCartShopping, FaTag } from 'react-icons/fa6'
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from 'react-icons/fi'
import { useCart } from '../../context/CartContext.jsx'
import ProductImage, { imgFallback } from '../Shared/ProductImage.jsx'

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
            onError={imgFallback}
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
                <img src={img} alt={`${title} ${i + 1}`} onError={imgFallback} className="w-full h-full object-cover"/>
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

  const hasImages  = product.images.length > 0
  const currentIdx = product.images.indexOf(mainImage)
  const startIndex = currentIdx >= 0 ? currentIdx : 0

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/5
                   hover:shadow-xl transition-shadow duration-300 ease-out-expo
                   overflow-hidden flex flex-col group h-full"
        data-aos="fade-up"
        data-aos-delay={product.aosDelay}
      >
        {/* Imagen principal — clickeable para abrir lightbox */}
        <ProductImage
          src={mainImage}
          alt={product.title}
          className={hasImages ? 'cursor-zoom-in' : ''}
          imgClassName="group-hover:scale-[1.04] [@media(hover:none)]:group-hover:scale-100"
        >
          {hasImages && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ampliar imagen de ${product.title}`}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10
                         transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md
                               opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100
                               transition-[opacity,transform] duration-200 ease-out-expo">
                <FiZoomIn size={18} className="text-gray-700"/>
              </span>
            </button>
          )}

          {product.discount > 0 && (
            <span className="pointer-events-none absolute top-3 left-3 bg-primary text-white text-xs font-bold
                             px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <FaTag className="text-[10px]"/>
              {product.discount}%<span className="hidden sm:inline"> OFF</span>
            </span>
          )}
        </ProductImage>

        {/* Miniaturas */}
        {product.images.length > 1 && (
        <div className="flex gap-1.5 sm:gap-2 px-2.5 sm:px-3 pt-2.5 sm:pt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {product.images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200
                ${mainImage === img
                  ? 'border-primary scale-105 shadow-sm'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
            >
              <img
                src={img}
                alt={`${product.title} vista ${idx + 1}`}
                loading="lazy"
                onError={imgFallback}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        )}

        {/* Info */}
        <div className="flex flex-col flex-1 px-3 sm:px-4 pt-3 pb-3 sm:pb-4 gap-2">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug line-clamp-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            {discountedPrice ? (
              <>
                <span className="text-primary font-bold text-base sm:text-lg tabular-nums">${discountedPrice}</span>
                <span className="text-gray-400 line-through text-xs sm:text-sm tabular-nums">${product.price}</span>
              </>
            ) : (
              <span className="text-gray-800 dark:text-white font-bold text-base sm:text-lg tabular-nums">${product.price}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`mt-2 flex items-center justify-center gap-2 w-full
                       font-semibold min-h-[44px] py-2 px-4 rounded-full text-sm transition-[background-color,transform] duration-150 active:scale-[0.97]
                       ${added
                         ? 'bg-brandGreen text-white'
                         : 'bg-primary hover:bg-red-600 text-white'}`}
          >
            <FaCartShopping className="flex-shrink-0"/>
            <span className="truncate">{added ? '¡Agregado!' : <>Agregar<span className="hidden sm:inline"> al carrito</span></>}</span>
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
