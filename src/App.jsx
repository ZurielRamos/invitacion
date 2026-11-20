import { motion } from 'framer-motion'
import Botanical from './Botanical'
import { wedding } from './data'
import './App.css'

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease: 'easeOut' },
})

function Divider({ delay }) {
  return (
    <motion.div
      className="divider"
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.9, ease: 'easeOut' }}
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
  return (
    <main className="poster">
      <Botanical />

      <div className="content">
        <motion.h2 className="script" {...fadeUp(0.5)}>
          reserva la fecha
        </motion.h2>

        <Divider delay={0.8} />

        <motion.p className="message" {...fadeUp(1.0)}>
          {wedding.mensaje}
        </motion.p>

        <Divider delay={1.3} />

        <motion.h1 className="names" {...fadeUp(1.5)}>
          {wedding.novia} &amp; {wedding.novio}
        </motion.h1>

        <Divider delay={1.8} />

        <motion.div {...fadeUp(2.0)}>
          <p className="date">{wedding.fecha}</p>
          {wedding.ciudad && <p className="city">{wedding.ciudad}</p>}
        </motion.div>

        <motion.p className="note" {...fadeUp(2.3)}>
          {wedding.nota}
        </motion.p>
      </div>
    </main>
  )
}
