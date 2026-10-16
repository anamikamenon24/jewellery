import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Gem, Gift, ShoppingBag, User, LogIn, LogOut } from 'lucide-react'
import Logo from './Logo'
import { ThemeToggle } from './ui'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { firstName, initials } from '../lib/format'
import StyleTip from './StyleTip'

export const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/collections', label: 'Collections', short: 'Shop', icon: Gem },
  { to: '/gift-studio', label: 'Gift Studio', short: 'Gifts', icon: Gift },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
  { to: '/profile', label: 'Profile', icon: User },
]

function CartBadge({ className = '' }) {
  const { cartCount } = useShop()
  if (!cartCount) return null
  return (
    <motion.span
      key={cartCount}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      className={`absolute grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#2A1824] ${className}`}
      aria-label={`${cartCount} items in cart`}
    >
      {cartCount}
    </motion.span>
  )
}

export function useLogout() {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  return async () => {
    await logout()
    toast({ type: 'info', title: 'Signed out', message: 'Come back soon — your bag will be waiting.' })
    navigate('/home')
  }
}

function Avatar({ name, className = 'h-9 w-9 text-sm' }) {
  return <span className={`grid shrink-0 place-items-center rounded-full bg-brand font-display font-semibold text-[#2A1824] ${className}`}>{initials(name)}</span>
}

export function UserMenu({ compact = false }) {
  const { user, ready } = useAuth()
  const onLogout = useLogout()
  if (!ready) return <div className="skeleton h-10 w-24 rounded-full" />
  if (!user) {
    return (
      <Link to="/login" className={`btn-ghost text-sm ${compact ? 'px-3 py-2' : ''}`}>
        <LogIn className="h-4 w-4 text-blush-300" /> Sign in
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <Link to="/profile" className="flex items-center gap-2 rounded-full pr-1 hover:opacity-90" aria-label="Your profile">
        <Avatar name={user.fullName} className={compact ? 'h-9 w-9 text-sm' : 'h-9 w-9 text-sm'} />
        <span className={`text-sm font-medium ${compact ? 'hidden sm:inline' : ''}`}>Hi, {firstName(user.fullName)}</span>
      </Link>
      <button onClick={onLogout} className="glass grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-ink" aria-label="Log out" title="Log out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

function SidebarUser() {
  const { user, ready } = useAuth()
  const onLogout = useLogout()
  if (!ready) return <div className="skeleton h-14 rounded-2xl" />
  if (!user) {
    return (
      <Link to="/login" className="btn-primary w-full py-2.5 text-sm">
        <LogIn className="h-4 w-4" /> Sign in
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line/10 p-2.5">
      <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={user.fullName} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{user.fullName}</span>
          <span className="block text-[11px] text-muted">{user.tier} · {user.loyaltyPoints} pts</span>
        </span>
      </Link>
      <button onClick={onLogout} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-blush-400/10 hover:text-ink" aria-label="Log out" title="Log out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="glass fixed inset-y-4 left-4 z-40 hidden w-64 flex-col overflow-y-auto no-scrollbar rounded-[2rem] p-6 lg:flex">
      <Logo />
      <p className="mt-1 pl-9 text-[11px] tracking-[0.2em] uppercase text-muted">Fine fashion jewellery</p>
      <nav className="mt-8 flex flex-col gap-1.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="relative">
            {({ isActive }) => (
              <div className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-[#2A1824]' : 'text-muted hover:text-ink hover:bg-blush-400/10'}`}>
                {isActive && <motion.div layoutId="sidebar-pill" className="absolute inset-0 rounded-2xl bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  <Icon className="h-[18px] w-[18px]" />
                  {to === '/cart' && <CartBadge className="-right-3 -top-2.5" />}
                </span>
                <span className="relative">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-4 pt-6">
        <StyleTip compact />
        <SidebarUser />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  return (
    <header className="glass-strong sticky top-0 z-40 flex items-center justify-between border-x-0 border-t-0 px-4 py-3 lg:hidden">
      <Logo size="sm" />
      <div className="flex items-center gap-2">
        <UserMenu compact />
        <ThemeToggle />
      </div>
    </header>
  )
}

export function BottomNav() {
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[1.75rem] px-2 py-2 pb-safe shadow-soft lg:hidden">
      {NAV.map(({ to, label, short, icon: Icon }) => (
        <NavLink key={to} to={to} className="relative flex-1">
          {({ isActive }) => (
            <div className="relative flex flex-col items-center gap-0.5 py-1.5">
              {isActive && <motion.div layoutId="bottom-pill" className="absolute inset-x-2 inset-y-0 rounded-2xl bg-blush-400/15" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blush-300' : 'text-muted'}`} />
                {to === '/cart' && <CartBadge className="-right-2.5 -top-2" />}
              </span>
              <span className={`relative text-[10px] font-medium ${isActive ? 'text-ink' : 'text-muted'}`}>{short || label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
