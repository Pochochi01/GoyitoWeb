import React, { useState, useEffect } from 'react'
import { FiImage } from 'react-icons/fi'

/**
 * Imagen de producto con proporción fija.
 *
 * - El contenedor fija el aspect-ratio → la grilla nunca se desalinea,
 *   sin importar si la foto es vertical, horizontal o cuadrada.
 * - La foto se muestra completa (object-contain) sobre una versión desenfocada
 *   de sí misma: no se recorta el producto y no quedan franjas vacías.
 * - Carga diferida con fade-in y placeholder limpio si falta o falla.
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
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => { setLoaded(false); setFailed(false) }, [src])

  const showImage = src && !failed

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700/60 ${ratio} ${className}`}>
      {showImage ? (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl saturate-150
                        transition-opacity duration-500 ${loaded ? 'opacity-40 dark:opacity-30' : 'opacity-0'}`}
          />
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`relative w-full h-full object-contain object-center
                        transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                        ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'} ${imgClassName}`}
          />
          {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200/60 dark:bg-gray-600/40"/>}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-300 dark:text-gray-500">
          <FiImage size={28} strokeWidth={1.5}/>
          <span className="text-[11px] font-medium tracking-wide">Sin imagen</span>
        </div>
      )}
      {children}
    </div>
  )
}
