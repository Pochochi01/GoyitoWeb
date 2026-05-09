/**
 * OtherServices.jsx — Servicios destacados
 * Lee la lista de servicios de DesignContext.
 *
 * Para agregar un nuevo servicio:
 *  → Dashboard Admin → Diseño → Servicios → botón "Agregar servicio"
 *
 * Para extender los iconos disponibles:
 *  1. Importar el nuevo icono en ICON_MAP (Diseno.jsx)
 *  2. Agregarlo al objeto ICON_MAP con su nombre como clave
 *  El selector del admin lo mostrará automáticamente
 */
import React from 'react'
import { FaCarSide, FaHeadphonesAlt, FaWallet, FaCheckCircle,
         FaShippingFast, FaGift, FaPhone, FaStar, FaLock,
         FaTag, FaTruck, FaSync, FaHeart, FaGlobe, FaShieldAlt } from 'react-icons/fa'
import { useDesign } from '../../context/DesignContext.jsx'

// Mapa de nombre → componente icono (usado también en Diseno.jsx)
export const ICON_MAP = {
  FaCarSide:       FaCarSide,
  FaHeadphonesAlt: FaHeadphonesAlt,
  FaWallet:        FaWallet,
  FaCheckCircle:   FaCheckCircle,
  FaShippingFast:  FaShippingFast,
  FaGift:          FaGift,
  FaPhone:         FaPhone,
  FaStar:          FaStar,
  FaLock:          FaLock,
  FaTag:           FaTag,
  FaTruck:         FaTruck,
  FaSync:          FaSync,
  FaHeart:         FaHeart,
  FaGlobe:         FaGlobe,
  FaShieldAlt:     FaShieldAlt,
}

const OtherServices = () => {
  const { design } = useDesign()
  const services = design.services

  return (
    <div className="container my-14 md:my-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8">
        {services.map(svc => {
          const IconComponent = ICON_MAP[svc.icon] || FaCheckCircle
          return (
            <div className="flex flex-col items-start sm:flex-row gap-4" key={svc.id}>
              <IconComponent className="text-4xl md:text-5xl text-primary flex-shrink-0"/>
              <div>
                <h1 className="lg:text-xl font-bold">{svc.title}</h1>
                <p className="text-gray-400 text-sm">{svc.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OtherServices
