import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles, Gem, Heart, Gift } from 'lucide-react'
import Logo from '../components/Logo'
import JewelArt from '../components/JewelArt'
import { ThemeToggle } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { useToast } from '../context/ToastContext'
import { firstName } from '../lib/format'

const ease = [0.22, 1, 0.36, 1]

function Field({ icon: Icon, label, error, right, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className={`input pl-11 ${right ? 'pr-12' : ''} ${error ? '!border-red-400/70' : ''}`} {...rest} />
        {right}
      </span>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

function PasswordToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

function AuthShell({ title, subtitle, children, footer }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blush-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-gold-400/20 blur-[120px]" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo to="/" />
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-4 sm:px-8 lg:grid-cols-2 lg:pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="glass mx-auto w-full max-w-md rounded-[2rem] p-6 shadow-soft sm:p-8">
          <p className="eyebrow">Glimmora account</p>
          <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease }} className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          <div className="absolute inset-[6%] rounded-full border border-dashed border-gold-300/25 animate-spin-slow" />
          <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-glow animate-float">
            <JewelArt category="Sets" finish="Kundan" gem="#C0392B" className="h-full w-full" />
          </div>
          {[
            [Heart, 'Save favourites', 'left-0 top-[18%]'],
            [Gem, 'Earn sparkle points', 'right-0 top-[44%]'],
            [Gift, 'Send gift boxes', 'left-[8%] bottom-[10%]'],
          ].map(([Icon, text, pos], i) => (
            <motion.div key={text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }} className={`glass-strong absolute ${pos} flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-soft`}>
              <Icon className="h-4 w-4 text-blush-300" /> {text}
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

function useAfterAuth() {
  const { runPendingAction } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  return async (user, verb) => {
    toast({ title: `${verb}, ${firstName(user.fullName)} ✨`, message: 'Your bag and wishlist are synced.' })
    const returnTo = await runPendingAction()
    navigate(returnTo || location.state?.from || '/home', { replace: true })
  }
}

export function Login() {
  const { user, ready, login } = useAuth()
  const location = useLocation()
  const afterAuth = useAfterAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (ready && user && !busy) return <Navigate to={location.state?.from || '/home'} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(form.email, form.password)
      if (!u) throw new Error('We couldn’t sign you in. Please try again.')
      await afterAuth(u, 'Welcome back')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your bag, wishlist and orders."
      footer={
        <>
          New to Glimmora?{' '}
          <Link to="/signup" state={location.state} className="font-semibold text-blush-300 hover:text-gold-300">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field icon={Mail} label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        <Field
          icon={Lock}
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Your password"
          required
          right={<PasswordToggle show={show} onToggle={() => setShow((s) => !s)} />}
        />
        {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">{error}</p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={busy} className="btn-primary w-full py-3.5">
          {busy ? 'Signing in…' : (<>Sign in <ArrowRight className="h-4 w-4" /></>)}
        </motion.button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { user, ready, signup } = useAuth()
  const location = useLocation()
  const afterAuth = useAfterAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (ready && user && !busy) return <Navigate to={location.state?.from || '/home'} replace />

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = {}
    if (form.fullName.trim().length < 2) errs.fullName = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) errs.phone = 'Enter a valid 10-digit mobile number.'
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errs.password = 'Use at least 8 characters with a letter and a number.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const u = await signup(form)
      if (!u) throw new Error('We couldn’t create your account. Please try again.')
      await afterAuth(u, 'Welcome to Glimmora')
    } catch (err) {
      setErrors(err.fields || {})
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join free and earn sparkle points on every order."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-blush-300 hover:text-gold-300">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field icon={User} label="Full name" autoComplete="name" value={form.fullName} onChange={set('fullName')} placeholder="Your name" error={errors.fullName} />
        <Field icon={Mail} label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
        <Field icon={Phone} label="Mobile" inputMode="numeric" autoComplete="tel" maxLength={10} value={form.phone} onChange={set('phone')} placeholder="98XXXXXXXX" error={errors.phone} />
        <Field
          icon={Lock}
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          placeholder="8+ characters, with a number"
          error={errors.password}
          right={<PasswordToggle show={show} onToggle={() => setShow((s) => !s)} />}
        />
        {error && !Object.keys(errors).length && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">{error}</p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={busy} className="btn-primary w-full py-3.5">
          {busy ? 'Creating your account…' : (<><Sparkles className="h-4 w-4" /> Create account</>)}
        </motion.button>
      </form>
    </AuthShell>
  )
}
