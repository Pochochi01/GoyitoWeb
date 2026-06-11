/**
 * Hero.jsx — Slider principal
 * Lee el contenido dinámico de DesignContext.
 * Si no hay imagen personalizada (imageUrl = null) usa el asset por defecto.
 *
 * Para agregar un nuevo slide desde el admin:
 *  → Dashboard Admin → Diseño → Hero → botón "Agregar slide" (máx. 5)
 */
import React from 'react'
import Slider from 'react-slick'
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

  const settings = {
    dots:           true,
    arrows:         false,
    infinite:       true,
    speed:          800,
    slidesToScroll: 1,
    autoplay:       true,
    autoplaySpeed:  4000,
    cssEase:        'ease-in-out',
    pauseOnHover:   false,
    pauseOnFocus:   true,
  }

  return (
    <div className="relative overflow-hidden min-h-[420px] sm:min-h-[650px] flex justify-center items-center">
      <div className="container pt-4 px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl min-h-[400px] sm:min-h-[650px]
          hero-bg-color flex justify-center items-center">
          <div className="container pb-6 sm:pb-0 px-4">
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
                        <img src={imgSrc} alt={slide.title}
                          className="w-full max-w-[220px] sm:max-w-[400px] lg:max-w-[480px]
                            h-auto aspect-square
                            sm:scale-105 lg:scale-110 object-contain mx-auto
                            drop-shadow-[-8px_4px_6px_rgba(0,0,0,.4)] relative z-40"/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
