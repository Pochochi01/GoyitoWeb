import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import NavBar from '../Components/NavBar/NavBar.jsx'
import Footer from '../Components/Footer/Footer.jsx'
import WhatsAppButton from '../Components/WhatsAppButton.jsx'

import imgLogistica  from '../assets/about/OIP.jpg'
import imgGlobo      from '../assets/about/OIP (1).jpg'
import imgContenedor from '../assets/about/OIP (2).jpg'

const STATS = [
  { value: '10+',   label: 'Años de experiencia' },
  { value: '5.000+', label: 'Clientes satisfechos' },
  { value: '500+',  label: 'Productos importados' },
  { value: '100%',  label: 'Garantía de calidad' },
]

const VALORES = [
  {
    icon: '🤝',
    title: 'Transparencia',
    desc: 'Precios claros, sin sorpresas. Lo que ves es lo que pagás.',
  },
  {
    icon: '🏆',
    title: 'Compromiso',
    desc: 'Cada producto pasa por nuestro control de calidad antes de llegar a tus manos.',
  },
  {
    icon: '📦',
    title: 'Garantía',
    desc: 'Respaldamos cada artículo con la garantía que prometemos.',
  },
  {
    icon: '💡',
    title: 'Innovación',
    desc: 'Siempre buscamos lo más útil y práctico para tu día a día.',
  },
]

export default function About() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col overflow-hidden">
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo con transparencia */}
        <img
          src={imgLogistica}
          alt="Logística internacional"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay degradado oscuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"/>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto" data-aos="fade-up">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-3">
            Importación directa desde 2014
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Quiénes Somos
          </h1>
          <p className="text-white/80 text-lg sm:text-xl font-light leading-relaxed">
            Más de <span className="text-primary font-bold">10 años</span> acercando productos útiles,
            accesibles y de calidad a cada rincón del país.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/tienda"
              className="bg-primary hover:bg-red-600 text-white font-semibold px-7 py-3 rounded-full transition-colors duration-200 text-sm">
              Ver productos
            </Link>
            <Link to="/"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3 rounded-full transition-colors duration-200 text-sm backdrop-blur-sm">
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="bg-primary py-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
            {STATS.map((s, i) => (
              <div key={i} data-aos="zoom-in" data-aos-delay={i * 80}>
                <p className="text-4xl font-extrabold leading-none">{s.value}</p>
                <p className="text-white/80 text-sm mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HISTORIA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Texto */}
            <div data-aos="fade-right">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">
                Nuestra historia
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mt-2 mb-6 leading-tight">
                ZolImportados,<br/>
                <span className="text-primary">una pasión hecha negocio</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                <p>
                  En <strong className="text-gray-800 dark:text-white">ZolImportados</strong> nos apasiona
                  acercar productos útiles y accesibles para el día a día. Desde hace más de
                  <strong className="text-primary"> 10 años</strong> trabajamos como importadores directos,
                  ofreciendo artículos de calidad que se convierten en aliados prácticos para el hogar,
                  la oficina y el tiempo libre.
                </p>
                <p>
                  Nuestra misión es simple: brindar soluciones a precios competitivos, con productos
                  ideales tanto para uso personal como para regalar. La confianza que hemos construido
                  con nuestros clientes se basa en la <strong className="text-gray-800 dark:text-white">transparencia,
                  el compromiso y la garantía</strong> de que cada artículo cumple con los estándares
                  que prometemos.
                </p>
              </div>
            </div>

            {/* Imagen con transparencia superpuesta */}
            <div className="relative" data-aos="fade-left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={imgGlobo}
                  alt="Importación global"
                  className="w-full h-80 object-cover"
                />
                {/* Capa de transparencia con degradado de marca */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent"/>
              </div>

              {/* Badge flotante */}
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
                <span className="text-3xl">🌍</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Importación directa</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sin intermediarios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISIÓN — fondo con contenedor + transparencia ─────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Imagen de fondo difuminada */}
        <img
          src={imgContenedor}
          alt="Contenedores de carga"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-15 dark:opacity-10"
        />
        {/* Overlay de color */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/95 to-gray-50 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800"/>

        <div className="relative z-10 container">
          <div className="max-w-2xl mx-auto text-center" data-aos="fade-up">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">
              Lo que nos mueve
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mt-2 mb-6">
              Nuestra Misión
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Brindar <strong className="text-gray-800 dark:text-white">soluciones a precios competitivos</strong>,
              con productos ideales tanto para uso personal como para regalar.
              Creemos que la <strong className="text-primary">calidad no tiene por qué ser costosa</strong>,
              y que cada compra debe ser una experiencia confiable y satisfactoria.
            </p>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {VALORES.map((v, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-4xl block mb-3">{v.icon}</span>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIENDA ONLINE ─────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Imagen con transparencia */}
            <div className="relative order-2 lg:order-1" data-aos="fade-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={imgLogistica}
                  alt="Tienda online"
                  className="w-full h-80 object-cover"
                />
                {/* Capa de transparencia */}
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/50 via-primary/20 to-transparent"/>

                {/* Texto sobre imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-bold text-lg">Ahora también online</p>
                  <p className="text-white/70 text-sm">Comprá desde donde estés</p>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">
                Tienda online
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mt-2 mb-6 leading-tight">
                Un nuevo paso:<br/>
                <span className="text-primary">tu tienda en un clic</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                Hoy damos un paso más con el lanzamiento de nuestra tienda online, un espacio pensado
                para que encuentres lo que necesitás de manera <strong className="text-gray-800 dark:text-white">rápida,
                segura y cómoda</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-8">
                En ZolImportados creemos que la calidad no tiene por qué ser costosa, y que cada
                compra debe ser una experiencia confiable y satisfactoria.
              </p>
              <Link to="/tienda"
                className="inline-flex items-center gap-2 bg-primary hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200">
                Explorar tienda →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAGLINE FINAL ─────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Fondo con imagen de globo — muy sutil */}
        <img
          src={imgGlobo}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-900"/>

        <div className="relative z-10 container text-center" data-aos="zoom-in">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            ZolImportados
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight max-w-3xl mx-auto">
            Calidad, confianza y el mejor precio,{' '}
            <span className="text-primary">ahora al alcance de un clic.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/tienda"
              className="bg-primary hover:bg-red-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm shadow-lg shadow-primary/30">
              Ver productos
            </Link>
            <Link to="/"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white hover:border-primary hover:text-primary dark:hover:text-primary font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
