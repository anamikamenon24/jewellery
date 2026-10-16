import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Banknote, CreditCard, CheckCircle2, Lock, PartyPopper, Package, AlertTriangle } from 'lucide-react'
import { formatINR } from '../lib/format'
import { useAuth } from '../context/AuthContext'

const GOLD = ['#F6DFA0', '#EBCB7E', '#DDB25A', '#C8973C', '#F4B4C6', '#FFF6DD']

export const celebrate = () => {
  const end = Date.now() + 1600
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: GOLD, scalar: 1.1 })
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: GOLD })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: GOLD })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  setTimeout(() => confetti({ particleCount: 80, spread: 120, startVelocity: 25, origin: { y: 0.3 }, colors: GOLD, shapes: ['star'], scalar: 1.4 }), 500)
}

const PAYMENTS = [
  { id: 'cod', label: 'Cash on delivery', desc: 'Pay when your sparkle arrives', icon: Banknote },
  { id: 'card', label: 'Card', desc: 'Credit / debit (demo — no real charge)', icon: CreditCard },
]

// Collects delivery details + payment method and calls onSubmit(payload).
// onSubmit should throw an ApiError on failure; field errors and stock problems are shown inline.
export function CheckoutForm({ total, onSubmit, submitLabel = 'Place order' }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.fullName || '', phone: user?.phone || '', address: '', pincode: '' })
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [problem, setProblem] = useState(null)
  const [placing, setPlacing] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setProblem(null)
    const errs = {}
    if (form.name.trim().length < 2) errs.name = 'Tell us who to deliver to.'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) errs.phone = 'Enter a valid 10-digit mobile number.'
    if (form.address.trim().length < 10) errs.address = 'Please add your full address.'
    if (!/^[1-9]\d{5}$/.test(form.pincode)) errs.pincode = '6-digit pincode, please.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setPlacing(true)
    try {
      await onSubmit({ shipping: form, paymentMethod: payment })
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      setProblem(err)
      setPlacing(false)
    }
  }

  const field = (k, label, props = {}) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <input value={form[k]} onChange={set(k)} className={`input ${errors[k] ? '!border-red-400/70' : ''}`} {...props} />
      {errors[k] && <span className="mt-1 block text-xs text-red-400">{errors[k]}</span>}
    </label>
  )

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="glass space-y-4 rounded-[2rem] p-5 sm:p-6">
        <h2 className="text-2xl font-semibold">Delivery details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'Full name', { autoComplete: 'name' })}
          {field('phone', 'Mobile', { inputMode: 'numeric', placeholder: '98XXXXXXXX', maxLength: 10, autoComplete: 'tel' })}
        </div>
        {field('address', 'Address', { placeholder: 'House no., street, area, city', autoComplete: 'street-address' })}
        {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6, placeholder: '560001', autoComplete: 'postal-code' })}
      </div>
      <div className="glass space-y-3 rounded-[2rem] p-5 sm:p-6">
        <h2 className="text-2xl font-semibold">Payment</h2>
        {PAYMENTS.map(({ id, label, desc, icon: Icon }) => (
          <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${payment === id ? 'border-blush-400/60 bg-blush-400/10 shadow-glow' : 'border-line/10 hover:border-line/25'}`}>
            <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="sr-only" />
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${payment === id ? 'bg-brand text-[#2A1824]' : 'bg-line/5'}`}><Icon className="h-5 w-5" /></span>
            <span className="flex-1">
              <span className="block font-semibold">{label}</span>
              <span className="text-xs text-muted">{desc}</span>
            </span>
            <span className={`h-5 w-5 rounded-full border-2 ${payment === id ? 'border-blush-400 bg-blush-400 shadow-[inset_0_0_0_3px_rgb(var(--bg))]' : 'border-line/30'}`} />
          </label>
        ))}
      </div>
      {problem && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold">{problem.code === 'OUT_OF_STOCK' ? 'Something just sold out' : 'We couldn’t place your order'}</p>
            <p className="mt-0.5 text-muted">{problem.message}</p>
          </div>
        </motion.div>
      )}
      <motion.button whileTap={{ scale: 0.97 }} disabled={placing} className="btn-primary w-full py-4 text-base">
        {placing ? (
          <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-5 w-5 rounded-full border-2 border-[#2A1824]/30 border-t-[#2A1824]" /> Placing your order…</>
        ) : (
          <><Lock className="h-4 w-4" /> {submitLabel}{total != null ? ` · ${formatINR(total)}` : ''}</>
        )}
      </motion.button>
    </form>
  )
}

export function OrderSuccess({ result, gift = false }) {
  const { order, pointsEarned } = result
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="glass relative mx-auto max-w-lg overflow-hidden rounded-[2.5rem] p-8 text-center sm:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-300/20 via-transparent to-blush-400/20" />
      <div className="relative">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand shadow-gold">
          <CheckCircle2 className="h-12 w-12 text-[#2A1824]" />
        </motion.div>
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{gift ? 'Your gift box is on its way!' : 'Your sparkle is on its way!'}</h1>
        <p className="mt-3 text-muted">
          Order <b className="text-ink">{order.orderNumber}</b> · {formatINR(order.total)} · {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card'}
        </p>
        <p className="mt-1 text-sm text-muted">Arriving in 3–5 days. We’ll WhatsApp you tracking updates.</p>
        {pointsEarned > 0 && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-300/15 px-4 py-2 text-sm text-gold-300"><PartyPopper className="h-4 w-4" /> +{pointsEarned} sparkle points earned</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/profile" className="btn-primary"><Package className="h-4 w-4" /> Track order</Link>
          <Link to="/collections" className="btn-ghost">Keep shopping</Link>
        </div>
      </div>
    </motion.div>
  )
}
