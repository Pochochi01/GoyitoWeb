import React, { useState, useRef, useLayoutEffect } from 'react'
import placeholder from '../../assets/placeholder-product.svg'

export const PRODUCT_PLACEHOLDER = placeholder

/** onError para <img> sueltos: reemplaza una sola vez por la imagen predeterminada */
export const imgFallback = (e) => {
  const img = e.currentTarget
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = placeholder
}

/**
 * Imagen de producto con proporción fija.
 *
 * - El contenedor fija el aspect-ratio → la grilla nunca se desalinea.
 * - La foto se muestra completa (object-contain) sobre una versión desenfocada
 *   de sí misma: no se recorta el producto y no quedan franjas vacías.
 * - SIEMPRE muestra algo: si no hay URL o la imagen falla (404, red, archivo
 *   borrado en el servidor) usa la imagen predeterminada.
 * - El estado de carga se guarda por URL: una imagen que ya está en caché
 *   (onLoad disparado antes del efecto, o `complete` al montar) nunca queda
 *   oculta.
 */
export default function ProductImage({
  src,
  alt = '',
  ratio = 'aspect-square',
  className = '',
  imgClassName = '',
  eager = false,
  children,
}) {
  const [failedSrc, setFailedSrc] = useState(null)
  const [loadedSrc, setLoadedSrc] = useState(null)
  const imgRef = useRef(null)

  const usingFallback = !src || failedSrc === src
  const finalSrc = usingFallback ? placeholder : src
  const loaded = usingFallback || loadedSrc === src

  // Imagen ya completa desde caché antes de que React enganche onLoad
  useLayoutEffect(() => {
    const img = imgRef.current
    if (!img || usingFallback || !img.complete) return
    if (img.naturalWidth > 0) setLoadedSrc(src)
    else setFailedSrc(src)
  }, [src, usingFallback])

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700/60 ${ratio} ${className}`}>
      {!usingFallback && (
        <img
          src={finalSrc}
          alt=""
          aria-hidden="true"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl saturate-150
                      transition-opacity duration-500 ${loaded ? 'opacity-40 dark:opacity-30' : 'opacity-0'}`}
        />
      )}
      <img
        ref={imgRef}
        key={finalSrc}
        src={finalSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => { if (!usingFallback) setLoadedSrc(src) }}
        onError={() => { if (!usingFallback) setFailedSrc(src) }}
        className={`relative w-full h-full ${usingFallback ? 'object-cover' : 'object-contain'} object-center
                    transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'} ${imgClassName}`}
      />
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200/60 dark:bg-gray-600/40 pointer-events-none"/>}
      {children}
    </div>
  )
}
