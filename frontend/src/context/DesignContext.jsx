/**
 * DesignContext — CMS frontend-only
 * Persiste en localStorage con la clave 'goyito_design'.
 *
 * Estructura del estado:
 *  {
 *    hero:     { slides: Slide[] }          -- máx. 5 slides
 *    category: { header: Header, cards: Card[] }
 *    services: Service[]
 *  }
 *
 * Para extender en el futuro:
 *  1. Agregar un campo nuevo al DEFAULT_DESIGN
 *  2. Crear un helper `updateMiSeccion` similar a los existentes
 *  3. El contexto guarda automáticamente en localStorage
 */
import React, { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'goyito_design'

// ─── Datos por defecto ───────────────────────────────────────
export const DEFAULT_DESIGN = {
  whatsapp: {
    numero:  '',
    mensaje: 'Hola! Me comunico desde la tienda online de Goyito\'s Digital.',
  },

  hero: {
    // Cada slide: { id, title, subtitle, bg, imageUrl (base64 o null) }
    // imageUrl = null → el componente Hero.jsx usa la imagen de asset por defecto
    slides: [
      { id: 1, title: 'Inalambricos',   subtitle: 'Solo lo Mejor', bg: 'Auriculares',    imageUrl: null },
      { id: 2, title: 'Distintas Marcas', subtitle: 'Solo lo Mejor', bg: 'Notebooks',    imageUrl: null },
      { id: 3, title: 'Inalambricos',   subtitle: 'Solo lo Mejor', bg: 'Virtual',        imageUrl: null },
    ],
  },

  category: {
    header: {
      tag:   'Nuestra Selección de Productos para ti',
      title: 'Productos',
      desc:  'Los productos más adquiridos para usar en casa o al aire libre.',
    },
    // Cada card: { id, line1, line2, name, imageUrl }
    // imageUrl = null → Category.jsx usa el asset importado por defecto
    cards: [
      { id: 1, line1: 'Disfruta', line2: 'Con', name: 'Auriculares', imageUrl: null },
      { id: 2, line1: 'Disfruta', line2: 'Con', name: 'SmartWatch',  imageUrl: null },
      { id: 3, line1: 'Disfruta', line2: 'Con', name: 'Parlantes',   imageUrl: null },
      { id: 4, line1: 'Disfruta', line2: 'Con', name: 'PlayStation', imageUrl: null },
      { id: 5, line1: 'Disfruta', line2: 'Con', name: 'Laptop',      imageUrl: null },
      { id: 6, line1: 'Disfruta', line2: 'Con', name: 'SmartWatch',  imageUrl: null },
    ],
  },

  // Cada service: { id, icon, title, description }
  // icon = nombre de string del componente (ej. 'FaCarSide')
  services: [
    { id: 1, icon: 'FaCarSide',       title: 'Envíos Gratis',   description: 'Para todo tipo de pedidos en nuestra ciudad' },
    { id: 2, icon: 'FaCheckCircle',   title: 'Compra Segura',   description: 'Devolución del producto hasta 30 días' },
    { id: 3, icon: 'FaWallet',        title: 'Pagos Seguros',   description: 'Todos los métodos de pagos asegurados' },
    { id: 4, icon: 'FaHeadphonesAlt', title: 'Soporte Online',  description: 'Ayuda Online 24/7' },
  ],
}

const DesignContext = createContext(null)

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DESIGN
    // Merge con defaults para no perder campos nuevos
    const saved = JSON.parse(raw)
    return {
      whatsapp: { ...DEFAULT_DESIGN.whatsapp, ...(saved.whatsapp ?? {}) },
      hero:     { ...DEFAULT_DESIGN.hero,     ...saved.hero     },
      category: { ...DEFAULT_DESIGN.category, ...saved.category },
      services: saved.services ?? DEFAULT_DESIGN.services,
    }
  } catch {
    return DEFAULT_DESIGN
  }
}

export const DesignProvider = ({ children }) => {
  const [design, setDesign] = useState(load)

  const save = useCallback((next) => {
    setDesign(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* quota exceeded */ }
  }, [])

  // ── Hero ────────────────────────────────────────────────────
  const updateHero = useCallback((heroData) => {
    save(prev => ({ ...prev, hero: heroData }))
  }, [save])

  // ── Category ────────────────────────────────────────────────
  const updateCategory = useCallback((categoryData) => {
    save(prev => ({ ...prev, category: categoryData }))
  }, [save])

  // ── Services ────────────────────────────────────────────────
  const updateServices = useCallback((servicesArray) => {
    save(prev => ({ ...prev, services: servicesArray }))
  }, [save])

  // ── WhatsApp ─────────────────────────────────────────────────
  const updateWhatsapp = useCallback((whatsappData) => {
    save(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, ...whatsappData } }))
  }, [save])

  /** Restablecer todo al estado por defecto */
  const resetDesign = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setDesign(DEFAULT_DESIGN)
  }, [])

  return (
    <DesignContext.Provider value={{ design, updateHero, updateCategory, updateServices, updateWhatsapp, resetDesign }}>
      {children}
    </DesignContext.Provider>
  )
}

export const useDesign = () => useContext(DesignContext)
