import React from 'react'
import { motion, AnimatePresence } from "framer-motion"

const ResponsiveMenu = ({open}) => {
  return (
    <div className={`transition-all duration-200 ${open ? 'mt-[350px]' : 'mt-0' } md:hidden `}>
        <AnimatePresence mode='wait'>
            {open && (
            <motion.div
                initial={{opacity:0, y:-100}}
                animate={{opacity:1, y: 10}}
                exit={{opacity:0, y:-100}}
                transition={{duration: 0.3}}
                className='absolute top-20 left-0 w-screen h-[380px]'
            >
                <div className=' text-xl font-semibold uppercase bg-primary
                 text-white py-10 m-4 rounded-3xl'>
                    <ul className='flex flex-col justify-center items-center gap-8'>
                        <li>Inicio</li>
                        <li>Tienda</li>
                        <li>Quienes Somos</li>
                        <li>Contactanos</li>
                        <li>Productos</li>
                    </ul>
                    
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}

export default ResponsiveMenu