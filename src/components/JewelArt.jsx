import { useId } from 'react'
import { FINISH_STYLES } from '../data/ui'

// Stylised, finish-aware SVG illustrations so every product has crisp art without external images.
// `view` (0-3) gives the product gallery different angles / crops.

const VIEWS = [
  'translate(0 0) scale(1)',
  'rotate(-14 100 100) translate(-6 6) scale(1)',
  'translate(-60 -50) scale(1.6)',
  'rotate(10 100 100) translate(4 -2) scale(0.92)',
]

const Sparkle = ({ x, y, s = 1, delay = 0 }) => (
  <path
    d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z"
    transform={`translate(${x} ${y}) scale(${s})`}
    fill="#FFF6DD"
    className="jewel-sparkle"
    style={{ animationDelay: `${delay}s`, transformBox: 'fill-box', transformOrigin: 'center' }}
  />
)

export default function JewelArt({ category, finish, gem = '#E06F92', view = 0, className = '', sparkle = true }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const metal = `m${raw}`
  const gemId = `g${raw}`
  const pearl = `p${raw}`
  const glow = `gl${raw}`
  const f = FINISH_STYLES[finish] || FINISH_STYLES['Gold-plated']
  const isPearl = finish === 'Pearl'
  const isKundan = finish === 'Kundan'
  const stone = isPearl ? `url(#${pearl})` : `url(#${gemId})`
  const M = `url(#${metal})`

  const Gem = ({ cx, cy, r = 7 }) =>
    isPearl ? (
      <circle cx={cx} cy={cy} r={r} fill={`url(#${pearl})`} />
    ) : (
      <g>
        <circle cx={cx} cy={cy} r={r + 2} fill={M} />
        <circle cx={cx} cy={cy} r={r} fill={stone} />
        <circle cx={cx - r / 3} cy={cy - r / 3} r={r / 3.5} fill="#fff" opacity="0.75" />
      </g>
    )

  const earring = (x, y = 0) => (
    <g key={x} transform={`translate(${x} ${y})`}>
      <path d="M0 30 C-8 30 -8 18 0 18" fill="none" stroke={M} strokeWidth="2.5" strokeLinecap="round" />
      <Gem cx={0} cy={44} r={8} />
      <path d="M0 52 L0 62" stroke={M} strokeWidth="2.5" />
      <path d="M-26 108 C-26 72 26 72 26 108 Z" fill={M} />
      <path d="M-26 108 C-26 72 26 72 26 108" fill="none" stroke={f.dark} strokeWidth="1.5" opacity="0.6" />
      <path d="M-18 96 C-14 82 14 82 18 96" fill="none" stroke={f.light} strokeWidth="2" opacity="0.8" />
      {isKundan && [-14, 0, 14].map((dx) => <Gem key={dx} cx={dx} cy={92} r={4} />)}
      {[-22, -11, 0, 11, 22].map((dx, i) => (
        <g key={dx}>
          <line x1={dx} y1={108} x2={dx} y2={118 + (i % 2) * 6} stroke={M} strokeWidth="1.5" />
          <circle cx={dx} cy={121 + (i % 2) * 6} r={isPearl ? 4.5 : 3.5} fill={isPearl || isKundan ? `url(#${pearl})` : M} />
        </g>
      ))}
    </g>
  )

  const necklace = (scale = 1, ty = 0) => (
    <g transform={`translate(${100 - 100 * scale} ${ty}) scale(${scale})`}>
      <path d="M28 34 Q100 168 172 34" fill="none" stroke={M} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 36 Q100 150 160 36" fill="none" stroke={f.dark} strokeWidth="1.2" opacity="0.5" />
      {Array.from({ length: 11 }).map((_, i) => {
        const t = (i + 1) / 12
        const x = (1 - t) ** 2 * 28 + 2 * (1 - t) * t * 100 + t ** 2 * 172
        const y = (1 - t) ** 2 * 34 + 2 * (1 - t) * t * 168 + t ** 2 * 34
        return isPearl || isKundan ? (
          <circle key={i} cx={x} cy={y} r={isPearl ? 6 : 4.5} fill={isPearl ? `url(#${pearl})` : i % 2 ? stone : M} />
        ) : (
          <circle key={i} cx={x} cy={y} r={2.6} fill={M} />
        )
      })}
      <path d="M100 104 C88 116 88 132 100 146 C112 132 112 116 100 104Z" fill={M} />
      <path d="M100 112 C93 120 93 130 100 138 C107 130 107 120 100 112Z" fill={stone} />
      <circle cx={97} cy={120} r={2.4} fill="#fff" opacity="0.8" />
      <circle cx={100} cy={152} r={isPearl ? 6 : 4} fill={isPearl || isKundan ? `url(#${pearl})` : M} />
    </g>
  )

  const art = {
    Earrings: <g>{earring(64, 6)}{earring(136, 6)}</g>,
    Necklaces: necklace(1, 8),
    Rings: (
      <g>
        <ellipse cx="100" cy="128" rx="46" ry="44" fill="none" stroke={f.dark} strokeWidth="14" />
        <ellipse cx="100" cy="128" rx="46" ry="44" fill="none" stroke={M} strokeWidth="11" />
        <path d="M62 112 A46 44 0 0 1 100 84" fill="none" stroke={f.light} strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        <path d="M84 86 L92 72 L108 72 L116 86 Z" fill={M} />
        <path d="M78 66 L88 46 L112 46 L122 66 L100 92 Z" fill={stone} stroke={f.mid} strokeWidth="2" />
        <path d="M88 46 L94 66 L106 66 L112 46 M78 66 L122 66 M94 66 L100 92 L106 66" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.55" />
        {[-28, -18, 18, 28].map((dx) => <circle key={dx} cx={100 + dx} cy={86 + Math.abs(dx) / 3} r={2.6} fill="#fff" opacity="0.9" />)}
      </g>
    ),
    Bangles: (
      <g>
        <ellipse cx="82" cy="104" rx="52" ry="54" fill="none" stroke={f.dark} strokeWidth="13" />
        <ellipse cx="82" cy="104" rx="52" ry="54" fill="none" stroke={M} strokeWidth="10" />
        <ellipse cx="122" cy="110" rx="52" ry="54" fill="none" stroke={f.dark} strokeWidth="13" />
        <ellipse cx="122" cy="110" rx="52" ry="54" fill="none" stroke={M} strokeWidth="10" />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return <Gem key={i} cx={122 + Math.cos(a) * 52} cy={110 + Math.sin(a) * 54} r={isPearl ? 5 : 3.2} />
        })}
        <path d="M44 80 A52 54 0 0 1 82 50" fill="none" stroke={f.light} strokeWidth="2.5" opacity="0.8" strokeLinecap="round" />
      </g>
    ),
    Anklets: (
      <g>
        <path d="M16 78 C50 108 80 64 100 92 C120 120 150 74 184 96" fill="none" stroke={M} strokeWidth="3" strokeDasharray="5 3" strokeLinecap="round" />
        <path d="M16 78 C50 108 80 64 100 92 C120 120 150 74 184 96" fill="none" stroke={f.dark} strokeWidth="1" opacity="0.6" />
        {[
          [40, 92],
          [70, 82],
          [100, 92],
          [130, 104],
          [160, 88],
        ].map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={y + 16} stroke={M} strokeWidth="1.5" />
            {i % 2 === 0 ? (
              <path d={`M${x} ${y + 16} l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z`} fill={M} />
            ) : (
              <Gem cx={x} cy={y + 22} r={5.5} />
            )}
          </g>
        ))}
      </g>
    ),
    Sets: (
      <g>
        {necklace(0.78, 4)}
        <g transform="translate(-14 52) scale(0.62)">{earring(40)}</g>
        <g transform="translate(103 52) scale(0.62)">{earring(110)}</g>
      </g>
    ),
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blush-100 via-[#fff5f0] to-gold-100 dark:from-[#2d1528] dark:via-[#1d1019] dark:to-[#2a1d12] ${className}`}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${finish} ${category}`}>
        <defs>
          <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={f.light} />
            <stop offset="0.45" stopColor={f.mid} />
            <stop offset="0.7" stopColor={f.dark} />
            <stop offset="1" stopColor={f.mid} />
          </linearGradient>
          <radialGradient id={gemId} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor={isKundan && gem === '#E06F92' ? '#C0392B' : gem} />
            <stop offset="1" stopColor="#1a0a14" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id={pearl} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#F5EEE3" />
            <stop offset="1" stopColor="#C9B9A0" />
          </radialGradient>
          <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={f.mid} stopOpacity="0.45" />
            <stop offset="1" stopColor={f.mid} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill={`url(#${glow})`} />
        <g transform={VIEWS[view] || VIEWS[0]} style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.28))' }}>
          {art[category] || art.Rings}
        </g>
        {sparkle && (
          <g>
            <Sparkle x={34} y={36} s={0.9} delay={0} />
            <Sparkle x={168} y={52} s={0.7} delay={0.8} />
            <Sparkle x={156} y={164} s={1} delay={1.5} />
            <Sparkle x={44} y={158} s={0.6} delay={2.1} />
          </g>
        )}
      </svg>
    </div>
  )
}
