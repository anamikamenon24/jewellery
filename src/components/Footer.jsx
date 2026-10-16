import { Instagram, Mail, Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-10">
      <div className="glass rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-4 border-b border-line/10 pb-6 sm:grid-cols-3">
          {[
            [Truck, 'Free delivery over ₹499'],
            [RotateCcw, '7-day easy returns'],
            [ShieldCheck, 'Skin-safe, nickel-free'],
          ].map(([Icon, t]) => (
            <div key={t} className="flex items-center gap-3 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blush-400/15"><Icon className="h-4 w-4 text-blush-300" /></span>
              {t}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo size="sm" />
            <p className="mt-2 text-xs text-muted">© {new Date().getFullYear()} Glimmora. Shine brighter. Spend smarter.</p>
          </div>
          <div className="flex gap-2">
            <a href="#" onClick={(e) => e.preventDefault()} className="glass grid h-10 w-10 place-items-center rounded-full" aria-label="Glimmora on Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="mailto:hello@glimmora.example" className="glass grid h-10 w-10 place-items-center rounded-full" aria-label="Email Glimmora"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
