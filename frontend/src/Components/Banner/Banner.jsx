import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TiltCard, Parallax, EASE_OUT } from '../Motion/motion.jsx'

const Banner = ({ data }) => {
  const reduce = useReducedMotion()
  // Columnas entran escalonadas: texto → producto → oferta
  const col = (i) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '0px 0px -15% 0px' },
    transition: { duration: 0.7, ease: EASE_OUT, delay: reduce ? 0 : i * 0.08 },
  })

  return (
    <div className='min-h-[400px] md:min-h-[550px] flex justify-center items-center py-8 md:py-12 px-4'>
      <motion.div
        style={{ backgroundColor: data.bgColor }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className='container rounded-2xl md:rounded-3xl relative'
      >
        {/* brillo radial suave para dar volumen al bloque de color */}
        <div aria-hidden="true" className='pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.22),transparent_60%)]'/>
        <div className='relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center text-white'>
          <motion.div {...col(0)} className='p-5 sm:p-8 text-center md:text-left'>
            <p className='text-sm font-semibold tracking-wide'>{data.discount}</p>
            <h2 className='uppercase text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight'>{data.title}</h2>
            <p className='text-sm opacity-90'>{data.date}</p>
          </motion.div>

          <motion.div {...col(1)} className='h-full flex items-center justify-center'>
            <Parallax speed={0.35}>
              <TiltCard max={14} lift={50} glare={false} className='w-full max-w-[200px] sm:max-w-[250px] md:max-w-[340px] mx-auto'>
                <img src={data.image} alt={data.title2} loading='lazy' draggable={false}
                  className='scale-110 sm:scale-125 w-full h-auto object-contain select-none drop-shadow-[0_24px_30px_rgba(0,0,0,0.35)]'/>
              </TiltCard>
            </Parallax>
          </motion.div>

          <motion.div {...col(2)} className='flex flex-col justify-center gap-3 sm:gap-4 p-5 sm:p-8 text-center md:text-left'>
            <p className='font-bold text-lg sm:text-xl'>{data.title2}</p>
            <p className='text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight'>{data.title3}</p>
            <p className='text-sm tracking-wide leading-5 opacity-90'>{data.title4}</p>
            <div>
              <button style={{ color: data.bgColor }}
                className='bg-white py-2 px-6 rounded-full min-h-[44px] text-sm font-semibold shadow-lg shadow-black/10
                           transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97]'>
                Comprar Ahora
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Banner
