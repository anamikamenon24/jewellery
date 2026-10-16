import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Star, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export { formatINR } from '../lib/format'

export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCounter({ value, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref}>
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

export function ProgressRing({ value, max, size = 160, stroke = 12, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const id = `ring-${size}-${stroke}`
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EE93AD" />
            <stop offset="1" stopColor="#EBCB7E" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-line/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(238,147,173,0.55))' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function Stars({ rating, size = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(rating) ? 'fill-gold-300 text-gold-300' : 'text-muted/40'}`} />
      ))}
    </span>
  )
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`glass relative grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-105 ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
        {theme === 'dark' ? <Sun className="h-[18px] w-[18px] text-gold-300" /> : <Moon className="h-[18px] w-[18px] text-blush-600" />}
      </motion.span>
    </button>
  )
}

export function SectionHeader({ eyebrow, title, action, to }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
      </div>
      {action && to && (
        <Link to={to} className="shrink-0 text-sm font-medium text-blush-300 hover:text-gold-300 transition-colors">
          {action} →
        </Link>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass mx-auto flex max-w-md flex-col items-center rounded-[2rem] px-8 py-14 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-blush-400/30 blur-2xl" />
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-brand animate-float">
          <Icon className="h-9 w-9 text-[#2A1824]" />
        </div>
      </div>
      <h3 className="text-3xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function Countdown({ to }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, to - now)
  const parts = [
    ['Hrs', Math.floor(diff / 3.6e6)],
    ['Min', Math.floor((diff % 3.6e6) / 6e4)],
    ['Sec', Math.floor((diff % 6e4) / 1000)],
  ]
  return (
    <div className="flex items-center gap-2">
      {parts.map(([label, v], i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="glass-strong min-w-[3.25rem] rounded-xl px-2 py-1.5 text-center">
            <motion.div key={v} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-2xl font-semibold tabular-nums leading-none">
              {String(v).padStart(2, '0')}
            </motion.div>
            <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted">{label}</div>
          </div>
          {i < 2 && <span className="font-display text-xl text-gold-300">:</span>}
        </div>
      ))}
    </div>
  )
}

export function QtyStepper({ value, onChange, max = 10, small = false }) {
  const btn = `grid place-items-center rounded-full transition-colors hover:bg-blush-400/20 disabled:opacity-30 ${small ? 'h-7 w-7' : 'h-9 w-9'}`
  return (
    <div className={`glass inline-flex items-center rounded-full ${small ? 'p-0.5' : 'p-1'}`}>
      <button className={btn} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className={`tabular-nums text-center font-semibold ${small ? 'w-6 text-sm' : 'w-8'}`}>{value}</span>
      <button className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
