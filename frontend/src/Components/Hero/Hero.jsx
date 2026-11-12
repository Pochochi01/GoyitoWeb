/**
 * Hero.jsx — Slider principal
 * Lee el contenido dinámico de DesignContext.
 * Si no hay imagen personalizada (imageUrl = null) usa el asset por defecto.
 *
 * Para agregar un nuevo slide desde el admin:
 *  → Dashboard Admin → Diseño → Hero → botón "Agregar slide" (máx. 5)
 */
import React, { useRef } from 'react'
import Slider from 'react-slick'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { TiltCard, EASE_OUT } from '../Motion/motion.jsx'
import headphone from '../../assets/Hero/headphone.png'
import macbook   from '../../assets/Hero/macbook.png'
import vr        from '../../assets/Hero/vr.png'
import Button    from '../../Components/Shared/button.jsx'
import { useDesign } from '../../context/DesignContext.jsx'

// Imágenes de asset por defecto, indexadas por posición del slide
const DEFAULT_IMAGES = [headphone, macbook, vr]

const Hero = ({ handleOrderPopup }) => {
  const { design } = useDesign()
  const slides = design.hero.slides
  const reduce = useReducedMotion()

  // Progreso de salida del hero (0 = arriba, 1 = fuera de pantalla)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const k = reduce ? 0 : 1
  const contentY       = useTransform(scrollYProgress, [0, 1], [0, 120 * k])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.15])
  const cardScale      = useTransform(scrollYProgress, [0, 1], [1, 1 - 0.06 * k])
  const blobY1         = useTransform(scrollYProgress, [0, 1], [0, 220 * k])
  const blobY2         = useTransform(scrollYProgress, [0, 1], [0, -160 * k])

  const settings = {
    dots:           true,
    arrows:         false,
    infinite:       true,
    speed:          800,
    slidesToScroll: 1,
    autoplay:       !reduce,
    autoplaySpeed:  4000,
    cssEase:        'cubic-bezier(0.22, 1, 0.36, 1)',
    pauseOnHover:   false,
    pauseOnFocus:   true,
  }

  return (
    <div ref={heroRef} className="relative overflow-hidden min-h-[420px] sm:min-h-[650px] flex justify-center items-center">
      <div className="container pt-4 px-4 sm:px-6">
        <motion.div style={{ scale: cardScale }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[400px] sm:min-h-[650px]
          hero-bg-color flex justify-center items-center origin-top">
          {/* Capas de profundidad: se mueven a distinta velocidad que el contenido */}
          <motion.div aria-hidden="true" style={{ y: blobY1 }}
            className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-primary/20 blur-3xl"/>
          <motion.div aria-hidden="true" style={{ y: blobY2 }}
            className="pointer-events-none absolute -bottom-32 right-0 w-80 h-80 sm:w-[32rem] sm:h-[32rem] rounded-full bg-brandYellow/25 dark:bg-brandBlue/20 blur-3xl"/>
          <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container pb-6 sm:pb-0 px-4 relative">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}>
            <Slider {...settings}>
              {slides.map((slide, i) => {
                // Usa imagen personalizada (base64) o el asset por defecto según posición
                const imgSrc = slide.imageUrl || DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]
                return (
                  <div key={slide.id}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Texto */}
                      <div className="flex flex-col justify-center gap-3 sm:gap-4 sm:pl-3 pt-8 sm:pt-0
                        text-center sm:text-left order-2 sm:order-1 relative z-10">
                        <h1 className="text-base sm:text-2xl lg:text-2xl font-bold">
                          {slide.subtitle}
                        </h1>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                          {slide.title}
                        </h1>
                        <h1 className="text-3xl sm:text-5xl md:text-[80px] lg:text-[100px] xl:text-[125px]
                          uppercase text-white dark:text-white/5 font-bold leading-none break-words">
                          {slide.bg}
                        </h1>
                        <div>
                          <Button text="Comprar Ahora" bgColor="bg-primary"
                            textColor="text-white" handleOrderPopup={handleOrderPopup}/>
                        </div>
                      </div>
                      {/* Imagen */}
                      <div className="order-1 sm:order-2 flex justify-center items-center">
                        <TiltCard max={12} lift={40} glare={false}
                          className="w-full max-w-[220px] sm:max-w-[400px] lg:max-w-[480px] mx-auto relative z-40">
                          <img src={imgSrc} alt={slide.title} draggable={false}
                            className="w-full h-auto aspect-square object-contain select-none
                              sm:scale-105 lg:scale-110
                              drop-shadow-[-12px_18px_24px_rgba(0,0,0,.35)]"/>
                        </TiltCard>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Slider>
          </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
