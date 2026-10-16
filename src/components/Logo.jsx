import { Link } from 'react-router-dom'

export function SparkleMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4B4C6" />
          <stop offset="1" stopColor="#EBCB7E" />
        </linearGradient>
      </defs>
      <path d="M32 4 C34 22 42 30 60 32 C42 34 34 42 32 60 C30 42 22 34 4 32 C22 30 30 22 32 4 Z" fill="url(#logo-mark)" />
      <circle cx="52" cy="12" r="3.5" fill="#FBF1D9" />
    </svg>
  )
}

export default function Logo({ size = 'md', to = '/home' }) {
  const text = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-2xl' : 'text-3xl'
  return (
    <Link to={to} className="group inline-flex items-center gap-2" aria-label="Glimmora home">
      <span className="relative">
        <SparkleMark className={size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'} />
        <span className="absolute inset-0 -z-10 rounded-full bg-blush-400/40 blur-lg transition-opacity group-hover:opacity-100 opacity-60" />
      </span>
      <span
        className={`${text} font-display font-semibold italic leading-none text-gradient animate-gradient`}
        style={{ textShadow: '0 0 28px rgba(238,147,173,0.35)' }}
      >
        Glimmora
      </span>
    </Link>
  )
}
