import React, { useState } from 'react'
import { useDesign } from '../context/DesignContext.jsx'
import whatsappIcon from '../assets/whatsapp/whatsappicon.png'

export default function WhatsAppButton() {
  const { design } = useDesign()
  const [tooltip, setTooltip] = useState(false)

  const numero  = (design.whatsapp?.numero  || '').trim()
  const mensaje = (design.whatsapp?.mensaje || '').trim()

  if (!numero) return null

  const clean = numero.replace(/[\s\-\+\(\)]/g, '')
  const url   = `https://wa.me/${clean}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center
                 w-14 h-14 rounded-full cursor-pointer active:scale-95
                 transition-transform duration-200"
    >
      {/* Anillo pulsante — ocupa todo el botón (w-14 h-14) */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none"/>

      {/* Ícono — un escalón menos que el anillo (w-12 h-12 vs w-14 h-14) */}
      <img
        src={whatsappIcon}
        alt="WhatsApp"
        className="w-12 h-12 object-contain relative z-10 drop-shadow-lg hover:scale-110 transition-transform duration-200"
        draggable={false}
      />

      {/* Tooltip */}
      <span
        className={`absolute right-16 whitespace-nowrap
                    bg-gray-900 text-white text-xs font-semibold
                    px-3 py-1.5 rounded-xl shadow-lg
                    pointer-events-none select-none
                    transition-all duration-200
                    ${tooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
      >
        Escribinos por WhatsApp
        <span className="absolute -right-[5px] top-1/2 -translate-y-1/2
                         border-4 border-transparent border-l-gray-900"/>
      </span>
    </a>
  )
}
