import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo/logo.png'

const NAV_ITEMS = [
  { name: 'Inicio',        to: '/',       router: true },
  { name: 'Tienda',        to: '/tienda', router: true },
  { name: 'Quienes Somos', to: '/about',  router: true },
]

const ResponsiveMenu = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-40 px-4 pb-4 lg:hidden"
          >
            <div className="bg-primary rounded-2xl shadow-xl overflow-hidden">
              {/* Logo en menú móvil */}
              <Link to="/" onClick={onClose} className="flex justify-center pt-5 pb-2">
                <img
                  src={logo}
                  alt="ZolImportados"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <ul className="flex flex-col text-white font-semibold uppercase text-lg">
                {NAV_ITEMS.map((item, idx) => (
                  <li key={item.name} className={idx > 0 ? 'border-t border-white/20' : ''}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="block px-6 py-4 hover:bg-white/10 active:bg-white/20 transition-colors duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ResponsiveMenu
