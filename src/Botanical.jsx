import { motion, useReducedMotion } from 'framer-motion'

const GOLD = '#cdb27a'
const STEM = '#8d9b7e'

// Hoja apuntando hacia arriba, base en (0,0), largo 50.
const LEAF = 'M0 0 C 9 -9 11 -30 0 -50 C -11 -30 -9 -9 0 0 Z'
const VEINS = 'M0 -3 L0 -42 M0 -14 L-6 -22 M0 -14 L6 -22 M0 -26 L-5 -33 M0 -26 L5 -33'

// Ramas: curva cúbica P0..P3 en un lienzo de 200x260 anclado en la esquina (0,0).
const branches = [
  {
    id: 'a',
    p: [[-4, 18], [40, 40], [74, 92], [86, 176]],
    pairs: 6,
    size: 1.0,
    tones: ['url(#lf1)', 'url(#lf2)'],
    dur: 7,
  },
  {
    id: 'b',
    p: [[8, -4], [56, 8], [100, 34], [150, 90]],
    pairs: 6,
    size: 0.95,
    tones: ['url(#lf2)', 'url(#lf3)'],
    dur: 8.5,
  },
  {
    id: 'c',
    p: [[-4, 84], [26, 104], [44, 140], [40, 212]],
    pairs: 4,
    size: 0.8,
    tones: ['url(#lf3)', 'url(#lf2)'],
    dur: 9.5,
  },
]

const bez = (p, t) => {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  const x = k[0] * p[0][0] + k[1] * p[1][0] + k[2] * p[2][0] + k[3] * p[3][0]
  const y = k[0] * p[0][1] + k[1] * p[1][1] + k[2] * p[2][1] + k[3] * p[3][1]
  const dx =
    3 * u * u * (p[1][0] - p[0][0]) +
    6 * u * t * (p[2][0] - p[1][0]) +
    3 * t * t * (p[3][0] - p[2][0])
  const dy =
    3 * u * u * (p[1][1] - p[0][1]) +
    6 * u * t * (p[2][1] - p[1][1]) +
    3 * t * t * (p[3][1] - p[2][1])
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

function Leaf({ x, y, rot, s, fill }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(2)})`}>
      <path d={LEAF} fill={fill} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" />
      <path d={VEINS} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.6" />
    </g>
  )
}

function Branch({ branch, still }) {
  const { p, pairs, size, tones, dur } = branch
  const items = []
  for (let i = 0; i < pairs; i++) {
    const t = 0.14 + (i / pairs) * 0.76
    const { x, y, angle } = bez(p, t)
    const s = size * (1.15 - t * 0.55)
    items.push({ x, y, rot: angle + 90 + 48, s, fill: tones[0] })
    items.push({ x, y, rot: angle + 90 - 48, s: s * 0.95, fill: tones[1] })
  }
  const tip = bez(p, 1)
  items.push({ x: tip.x, y: tip.y, rot: tip.angle + 90, s: size * 0.62, fill: tones[0] })

  const d = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`
  return (
    <motion.g
      style={{ transformBox: 'view-box', transformOrigin: `${p[0][0]}px ${p[0][1]}px` }}
      animate={still ? undefined : { rotate: [-1.8, 1.8] }}
      transition={{ duration: dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <path d={d} fill="none" stroke={STEM} strokeWidth="1.1" strokeLinecap="round" />
      {items.map((it, i) => (
        <Leaf key={i} {...it} />
      ))}
    </motion.g>
  )
}

// Rama fina dorada con hojitas de contorno.
function GoldSprig({ still }) {
  const p = [[-4, 46], [34, 60], [70, 110], [104, 196]]
  const leaves = []
  for (let i = 0; i < 6; i++) {
    const t = 0.2 + i * 0.14
    const { x, y, angle } = bez(p, t)
    const side = i % 2 ? 1 : -1
    leaves.push({ x, y, rot: angle + 90 + side * 40, s: 0.85 - t * 0.3 })
  }
  const d = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`
  return (
    <motion.g
      style={{ transformBox: 'view-box', transformOrigin: `${p[0][0]}px ${p[0][1]}px` }}
      animate={still ? undefined : { rotate: [-2.2, 2.2] }}
      transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <path d={d} fill="none" stroke={GOLD} strokeWidth="0.9" />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)}) scale(${l.s.toFixed(2)})`}>
          <path d={LEAF} fill="none" stroke={GOLD} strokeWidth="0.9" />
        </g>
      ))}
    </motion.g>
  )
}

// Gypsophila: ramitas finas que terminan en racimos de florecitas.
function Gypsophila({ x, y, rot = 0, scale = 1, still }) {
  const twigs = [
    [-22, 30],
    [-6, 44],
    [12, 40],
    [26, 24],
    [4, 18],
  ]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <motion.g
        animate={still ? undefined : { rotate: [-3, 3] }}
        style={{ transformOrigin: '0px 0px' }}
        transition={{ duration: 5.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        {twigs.map(([tx, ty], i) => (
          <g key={i}>
            <path
              d={`M0 0 Q ${tx * 0.2} ${ty * 0.6} ${tx} ${ty}`}
              fill="none"
              stroke={STEM}
              strokeWidth="0.7"
              strokeOpacity="0.8"
            />
            {[
              [0, 0],
              [-4.5, -3],
              [4.2, -3.6],
              [-2, 4],
              [4, 3.6],
            ].map(([dx, dy], j) => (
              <circle
                key={j}
                cx={tx + dx}
                cy={ty + dy}
                r={j === 0 ? 3.4 : 2.6}
                fill="#fff"
                stroke="#e0ddcd"
                strokeWidth="0.6"
              />
            ))}
          </g>
        ))}
      </motion.g>
    </g>
  )
}

function Cluster({ flipX, flipY, still }) {
  const sx = flipX ? -1 : 1
  const sy = flipY ? -1 : 1
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <defs>
        <linearGradient id="lf1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7f9a79" />
          <stop offset="1" stopColor="#b4c8a9" />
        </linearGradient>
        <linearGradient id="lf2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#97ae8e" />
          <stop offset="1" stopColor="#c6d6bb" />
        </linearGradient>
        <linearGradient id="lf3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#adc2a2" />
          <stop offset="1" stopColor="#d9e4d0" />
        </linearGradient>
      </defs>
      <g transform={`translate(${flipX ? 200 : 0} ${flipY ? 260 : 0}) scale(${sx} ${sy})`}>
        <GoldSprig still={still} />
        {branches.map((b) => (
          <Branch key={b.id} branch={b} still={still} />
        ))}
        <Gypsophila x={62} y={118} rot={-10} scale={1.1} still={still} />
        <Gypsophila x={122} y={64} rot={-60} scale={0.9} still={still} />
        <Gypsophila x={36} y={150} rot={8} scale={0.85} still={still} />
      </g>
    </svg>
  )
}

const corners = [
  { cls: 'tl', flipX: false, flipY: false },
  { cls: 'tr', flipX: true, flipY: false },
  { cls: 'bl', flipX: false, flipY: true },
  { cls: 'br', flipX: true, flipY: true },
]

export default function Botanical({ active = true }) {
  const still = useReducedMotion()
  return (
    <>
      <div className="wash wash-a" />
      <div className="wash wash-b" />
      {corners.map(({ cls, flipX, flipY }, i) => (
        <motion.div
          key={cls}
          className={`corner ${cls}`}
          initial={false}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.8, delay: active ? 0.05 + i * 0.08 : 0 }}
        >
          <Cluster flipX={flipX} flipY={flipY} still={still} />
        </motion.div>
      ))}
    </>
  )
}

export function CoverLeaves() {
  const still = useReducedMotion()
  return (
    <>
      {[
        { cls: 'l', flipX: false },
        { cls: 'r', flipX: true },
      ].map(({ cls, flipX }, i) => (
        <motion.div
          key={cls}
          className={`cover-leaf ${cls}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2 + i * 0.2 }}
        >
          <Cluster flipX={flipX} flipY={false} still={still} />
        </motion.div>
      ))}
    </>
  )
}
