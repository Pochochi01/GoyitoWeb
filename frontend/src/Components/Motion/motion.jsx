/**
 * Kit de movimiento de la landing.
 *
 * Principios:
 *  - Solo transform/opacity (compositor, 60fps).
 *  - Springs críticamente amortiguados: siguen al cursor sin rebotar.
 *  - Tilt 3D únicamente con puntero fino (mouse/trackpad). En táctil no hay
 *    hover real y el efecto se activaría con el scroll del dedo.
 *  - Parallax atenuado en pantallas táctiles y desactivado con
 *    prefers-reduced-motion.
 */
import React, { useEffect, useRef, useState } from 'react'
import {
  motion, useMotionValue, useSpring, useTransform, useScroll,
  useReducedMotion, useMotionTemplate,
} from 'framer-motion'

export const EASE_OUT = [0.22, 1, 0.36, 1]

// ─── Media queries reactivas ─────────────────────────────────
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** true si hay mouse/trackpad y el usuario no pidió reducir movimiento */
export function useFinePointerMotion() {
  const fine   = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduce = useReducedMotion()
  return fine && !reduce
}

// ─── Tilt 3D con reflejo ─────────────────────────────────────
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 }

export function TiltCard({
  children,
  className = '',
  max = 10,          // grados máximos de inclinación
  glare = true,
  lift = 24,         // px de profundidad (translateZ) del contenido
  ...rest
}) {
  const enabled = useFinePointerMotion()
  const ref = useRef(null)

  // posición normalizada del cursor (0..1)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING)
  const glareX  = useTransform(px, v => `${v * 100}%`)
  const glareY  = useTransform(py, v => `${v * 100}%`)
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 30 })
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.35), transparent 55%)`

  if (!enabled) {
    return <div className={className} {...rest}>{children}</div>
  }

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onEnter = () => glareOpacity.set(1)
  const onLeave = () => { px.set(0.5); py.set(0.5); glareOpacity.set(0) }

  return (
    <div style={{ perspective: 1000 }} className={className} {...rest}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full will-change-transform"
      >
        <div style={{ transform: `translateZ(${lift}px)`, transformStyle: 'preserve-3d' }} className="h-full w-full">
          {children}
        </div>
        {glare && (
          <motion.div
            aria-hidden="true"
            style={{ background: glareBg, opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          />
        )}
      </motion.div>
    </div>
  )
}

// ─── Parallax vertical ligado al scroll ──────────────────────
export function Parallax({ children, speed = 0.2, className = '', as = 'div' }) {
  const reduce = useReducedMotion()
  const coarse = useMediaQuery('(pointer: coarse)')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // en táctil, un tercio de la intensidad: evita mareo y trabajo extra
  const factor = reduce ? 0 : coarse ? speed * 0.35 : speed
  const y = useTransform(scrollYProgress, [0, 1], [`${factor * 100}px`, `${-factor * 100}px`])
  const Comp = motion[as] || motion.div
  return <Comp ref={ref} style={{ y }} className={className}>{children}</Comp>
}

// ─── Revelado al hacer scroll con stagger ────────────────────
export function Reveal({ children, className = '', delay = 0, y = 24, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

// ─── Barra de progreso de lectura ────────────────────────────
export function ScrollProgress({ className = '' }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={`fixed top-0 left-0 right-0 h-[3px] origin-left bg-primary z-[60] ${className}`}
    />
  )
}
