import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import Botanical, { CoverLeaves } from './Botanical'
import { wedding } from './data'
import './App.css'

// Aparición simple con retraso (se reinicia al volver a la portada).
const fadeUp = (delay, active) => ({
  initial: false,
  animate: active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
  transition: { delay: active ? delay : 0, duration: 0.5, ease: 'easeOut' },
})

const itemVariants = {
  hide: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

// Texto que aparece palabra por palabra o letra por letra.
function Reveal({ text, by = 'word', stagger = 0.06, delay = 0, show = true, as = 'span', className }) {
  const Tag = motion[as]
  const parts = by === 'word' ? text.split(' ') : Array.from(text)
  return (
    <Tag
      className={className}
      aria-label={text}
      style={by === 'char' ? { whiteSpace: 'nowrap' } : undefined}
      initial="hide"
      animate={show ? 'show' : 'hide'}
      variants={{
        hide: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {parts.map((part, i) => (
        <Fragment key={i}>
          <motion.span
            aria-hidden="true"
            variants={itemVariants}
            className={part === '&' ? 'amp-inline' : undefined}
            style={{ display: 'inline-block', whiteSpace: 'pre', willChange: 'transform, opacity' }}
          >
            {part}
          </motion.span>
          {by === 'word' && i < parts.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}

function Rings() {
  const draw = (delay) => ({
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { delay, duration: 1.4, ease: 'easeInOut' },
  })
  return (
    <svg className="rings" viewBox="0 0 110 80" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* argolla izquierda */}
        <motion.ellipse cx="38" cy="52" rx="25" ry="21" transform="rotate(-18 38 52)" {...draw(1.2)} />
        <motion.ellipse cx="38.5" cy="54" rx="21" ry="17" transform="rotate(-18 38 52)" {...draw(1.3)} />
        {/* argolla derecha con diamante */}
        <motion.ellipse cx="70" cy="46" rx="25" ry="21" transform="rotate(12 70 46)" {...draw(1.5)} />
        <motion.ellipse cx="70" cy="48" rx="21" ry="17" transform="rotate(12 70 46)" {...draw(1.6)} />
        <motion.path
          d="M62 12 L66 4 H76 L80 12 L71 24 Z M62 12 H80 M66 4 L71 12 L76 4 M71 12 V24"
          {...draw(2)}
        />
      </g>
    </svg>
  )
}

function Cover({ onNext, progress }) {
  const scale = useTransform(progress, [0, 1], [1, 0.9])
  const opacity = useTransform(progress, [0, 1], [1, 0.25])
  return (
    <motion.header className="cover" style={{ scale, opacity }}>
      <div className="cover-paper">
        <div className="cover-top">
          <CoverLeaves />
          <h1 className="cover-names">
            <Reveal className="name n1" text={wedding.novia} by="char" stagger={0.07} delay={0.2} />
            <Reveal className="amp" text="&" by="char" delay={0.55} />
            <Reveal className="name n2" text={wedding.novio} by="char" stagger={0.07} delay={0.7} />
            <Rings />
          </h1>
        </div>
      </div>
      <div className="cover-frame">
        <div
          className="cover-photo"
          style={{ backgroundImage: `url(${wedding.portada})` }}
        />
      </div>
      <motion.button
        type="button"
        className="cover-hint"
        aria-label="Ver más"
        onClick={onNext}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        ↓
      </motion.button>
    </motion.header>
  )
}

function Divider({ delay, active }) {
  return (
    <motion.div
      className="divider"
      initial={false}
      animate={active ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
      transition={{ delay: active ? delay : 0, duration: 0.5, ease: 'easeOut' }}
    >
      <span className="line" />
      <span className="dots">
        <i />
        <i />
        <i />
      </span>
      <span className="line" />
    </motion.div>
  )
}

export default function App() {
  const scroller = useRef(null)
  const [active, setActive] = useState(false)
  const { scrollYProgress } = useScroll({ container: scroller })

  // Los textos se activan al llegar a la segunda vista y se reinician al volver.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > 0.35) setActive(true)
    else if (v < 0.25) setActive(false)
  })

  // Respaldo: si el scroll se detiene a medias, termina de bajar o subir.
  useEffect(() => {
    const el = scroller.current
    let timer
    let down = false
    const settle = () => {
      const max = el.scrollHeight - el.clientHeight
      if (down || el.scrollTop <= 1 || el.scrollTop >= max - 1) return
      el.scrollTo({ top: el.scrollTop > max / 2 ? max : 0, behavior: 'smooth' })
    }
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(settle, 160)
    }
    const press = () => (down = true)
    const release = () => {
      down = false
      onScroll()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('pointerdown', press)
    el.addEventListener('pointerup', release)
    el.addEventListener('pointercancel', release)
    el.addEventListener('touchend', release)
    return () => {
      clearTimeout(timer)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointerdown', press)
      el.removeEventListener('pointerup', release)
      el.removeEventListener('pointercancel', release)
      el.removeEventListener('touchend', release)
    }
  }, [])

  const scrollTo = (top) =>
    scroller.current?.scrollTo({ top, behavior: 'smooth' })

  return (
    <main className="page" ref={scroller}>
      <div className="snap-top" />
      <Cover
        progress={scrollYProgress}
        onNext={() => scrollTo(scroller.current.clientHeight)}
      />

      <section className="poster">
          <Botanical active={active} />
          <button
            type="button"
            className="back-hint"
            aria-label="Volver a la portada"
            onClick={() => scrollTo(0)}
          >
            ↑
          </button>

          <div className="content">
            <Reveal
              as="h2"
              className="script"
              text="reserva la fecha"
              by="char"
              stagger={0.02}
              delay={0.1}
              show={active}
            />

            <Divider delay={0.2} active={active} />

            <Reveal
              as="p"
              className="message"
              text={wedding.mensaje}
              by="word"
              stagger={0.02}
              delay={0.3}
              show={active}
            />

            <Divider delay={0.8} active={active} />

            <Reveal
              as="h1"
              className="names"
              text={`${wedding.novia} & ${wedding.novio}`}
              by="char"
              stagger={0.03}
              delay={0.9}
              show={active}
            />

            <Divider delay={1.2} active={active} />

            <motion.div
              initial={false}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ delay: active ? 1.3 : 0, duration: 0.5, ease: 'easeOut' }}
            >
              <motion.p
                className="date"
                initial={false}
                animate={{ letterSpacing: active ? '0.2em' : '0.5em' }}
                transition={{ delay: active ? 1.3 : 0, duration: 0.8, ease: 'easeOut' }}
              >
                {wedding.fecha}
              </motion.p>
              {wedding.ciudad && <p className="city">{wedding.ciudad}</p>}
            </motion.div>

            <motion.p className="note" {...fadeUp(1.6, active)}>
              {wedding.nota}
            </motion.p>
          </div>
        </section>
    </main>
  )
}
