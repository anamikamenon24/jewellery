import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Check, Sparkles, PenLine, Package, X, ChevronLeft, LogIn } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import { CheckoutForm, OrderSuccess, celebrate } from '../components/Checkout'
import { formatINR } from '../components/ui'
import { Skeleton, ErrorState } from '../components/Skeletons'
import { PACKAGING, CATEGORIES, GIFT_MIN as MIN, GIFT_MAX as MAX, giftBundleRate } from '../data/ui'
import { shippingFor, percentOff } from '../../shared/constants.js'
import { useApi } from '../lib/api'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const DRAFT_KEY = 'glimmora-gift-draft'
const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null')
  } catch {
    return null
  }
}

function Step({ n, title, done, children }) {
  return (
    <section className="glass rounded-[2rem] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full font-display text-lg font-semibold transition-colors ${done ? 'bg-brand text-[#2A1824]' : 'bg-line/10'}`}>
          {done ? <Check className="h-4 w-4" /> : n}
        </span>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function GiftStudio() {
  const draft = readDraft()
  const [pieceIds, setPieceIds] = useState(draft?.pieceIds || [])
  const [cat, setCat] = useState('All')
  const [packaging, setPackaging] = useState(draft?.packaging || 'velvet')
  const [message, setMessage] = useState(draft?.message || '')
  const [to, setTo] = useState(draft?.to || '')
  const [step, setStep] = useState('build')
  const [placed, setPlaced] = useState(null)
  const { data, error, loading, reload } = useApi('/products?limit=48&sort=bestsellers')
  const { placeOrder } = useShop()
  const { user, refresh } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ pieceIds, packaging, message, to }))
    } catch {
      /* storage unavailable */
    }
  }, [pieceIds, packaging, message, to])

  const products = data?.items || []
  const byId = (id) => products.find((p) => p.id === id)
  const pieces = pieceIds.map(byId).filter(Boolean)

  const toggle = (p) => {
    if (pieceIds.includes(p.id)) return setPieceIds(pieceIds.filter((x) => x !== p.id))
    if (p.stock <= 0) return toast({ type: 'error', title: 'Sold out', message: `${p.name} is out of stock right now.` })
    if (pieceIds.length >= MAX) return toast({ type: 'error', title: 'Your box is full!', message: `A gift box holds up to ${MAX} pieces. Remove one to swap.` })
    setPieceIds([...pieceIds, p.id])
  }

  const pack = PACKAGING.find((p) => p.id === packaging)
  const itemsTotal = pieces.reduce((s, p) => s + p.price, 0)
  const discount = percentOff(itemsTotal, giftBundleRate(pieces.length) * 100)
  const delivery = shippingFor(itemsTotal)
  const total = itemsTotal - discount + pack.price + delivery
  const ready = pieces.length >= MIN

  const goCheckout = () => {
    if (!ready) return toast({ type: 'error', title: 'Almost there', message: `Pick at least ${MIN} pieces for your gift box.` })
    if (!user) {
      toast({ type: 'info', title: 'Sign in to send your gift', message: 'Your gift box is saved — we’ll bring you right back.' })
      return navigate('/login', { state: { from: '/gift-studio' } })
    }
    setStep('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitOrder = async (payload) => {
    const res = await placeOrder({ ...payload, gift: { productIds: pieceIds, packaging, message, to } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    celebrate()
    setPlaced(res)
    setPieceIds([])
    setMessage('')
    setTo('')
    refresh()
    reload()
  }

  if (placed) return <div className="py-6"><OrderSuccess result={placed} gift /></div>

  const list = products.filter((p) => cat === 'All' || p.category === cat)

  const preview = (
    <div className="glass sticky top-24 space-y-5 rounded-[2rem] p-5 sm:p-6">
      <p className="eyebrow">Live preview</p>
      <motion.div layout className="relative rounded-3xl p-4 shadow-soft" style={{ background: `linear-gradient(135deg, ${pack.colors[0]}, ${pack.colors[1]})` }}>
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-gold-200/70" />
        <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gold-200/70" />
        <div className="relative grid min-h-[180px] grid-cols-2 gap-2 rounded-2xl bg-black/20 p-2 backdrop-blur-sm">
          {Array.from({ length: MAX }).map((_, i) => {
            const p = pieces[i]
            return (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-white/30">
                <AnimatePresence mode="popLayout">
                  {p ? (
                    <motion.div key={p.id} initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} className="absolute inset-0">
                      <ProductImage url={p.image} product={p} sparkle={false} className="h-full w-full" />
                      {step === 'build' && (
                        <button onClick={() => toggle(p)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white" aria-label={`Remove ${p.name}`}><X className="h-3 w-3" /></button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center text-white/50"><Gift className="h-6 w-6" /></motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
        {(message || to) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mt-3 rotate-[-1deg] rounded-xl bg-[#FFF8EE] p-3 text-[#2A1824] shadow">
            {to && <p className="text-xs font-semibold">To {to},</p>}
            <p className="font-display text-lg italic leading-snug">{message || '…'}</p>
          </motion.div>
        )}
      </motion.div>

      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: MAX }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < pieces.length ? 'bg-brand' : 'bg-line/10'}`} />
        ))}
        <span className="ml-1 text-xs text-muted">{pieces.length}/{MAX}</span>
      </div>

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Pieces ({pieces.length})</dt><dd>{formatINR(itemsTotal)}</dd></div>
        {discount > 0 && <div className="flex justify-between text-gold-300"><dt>Bundle saving ({giftBundleRate(pieces.length) * 100}%)</dt><dd>−{formatINR(discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">{pack.name}</dt><dd>{formatINR(pack.price)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{delivery ? formatINR(delivery) : <span className="text-gold-300">FREE</span>}</dd></div>
        <div className="flex items-baseline justify-between border-t border-line/10 pt-2">
          <dt className="font-semibold">Gift box total</dt>
          <motion.dd key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-3xl font-semibold text-gradient">{formatINR(total)}</motion.dd>
        </div>
      </dl>
      {step === 'build' && (
        <>
          <motion.button whileTap={{ scale: 0.97 }} onClick={goCheckout} className={`btn-primary w-full py-4 ${!ready ? 'opacity-60' : ''}`}>
            {user ? <><Gift className="h-5 w-5" /> Checkout gift box</> : <><LogIn className="h-5 w-5" /> Sign in to checkout</>}
          </motion.button>
          {!ready && <p className="text-center text-xs text-muted">Pick {MIN - pieces.length} more piece{MIN - pieces.length > 1 ? 's' : ''} to continue</p>}
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#5b1a33] via-[#9c3d5e] to-[#d4a24c] p-6 text-white sm:p-10">
        <Sparkles className="absolute right-6 top-6 h-24 w-24 text-white/10" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-100">Glimmora Gift Studio</p>
        <h1 className="mt-2 max-w-xl text-4xl font-semibold sm:text-5xl">Build a box they’ll <span className="italic">treasure</span></h1>
        <p className="mt-2 max-w-lg text-sm text-white/80">Pick {MIN}–{MAX} pieces, choose your packaging and add a heartfelt note. Save 5% on 3 pieces, 10% on 4.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {step === 'checkout' ? (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep('build')} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft className="h-4 w-4" /> Back to your gift box</button>
            <CheckoutForm total={total} onSubmit={submitOrder} submitLabel="Send gift box" />
          </div>
        ) : (
          <div className="space-y-5">
            <Step n={1} title={`Pick ${MIN}–${MAX} pieces`} done={ready}>
              <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
                {['All', ...CATEGORIES].map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? 'chip-active' : ''}`}>{c}</button>
                ))}
              </div>
              {error ? (
                <ErrorState error={error} onRetry={reload} />
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-5">
                  {loading && !data
                    ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
                    : list.map((p) => {
                        const selected = pieceIds.includes(p.id)
                        return (
                          <motion.button
                            key={p.id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => toggle(p)}
                            className={`relative overflow-hidden rounded-2xl text-left ring-2 transition-all ${selected ? 'ring-blush-400 shadow-glow' : 'ring-transparent hover:ring-line/20'} ${p.stock <= 0 ? 'opacity-40' : ''}`}
                            aria-pressed={selected}
                          >
                            <ProductImage url={p.image} product={p} sparkle={false} className="aspect-square w-full" />
                            <div className="glass-strong border-0 p-2">
                              <p className="truncate text-[11px] font-medium">{p.name}</p>
                              <p className="text-xs font-bold">{p.stock <= 0 ? 'Sold out' : formatINR(p.price)}</p>
                            </div>
                            <AnimatePresence>
                              {selected && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-brand text-[#2A1824] shadow">
                                  <Check className="h-4 w-4" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })}
                </div>
              )}
            </Step>

            <Step n={2} title="Choose packaging" done>
              <div className="grid gap-3 sm:grid-cols-3">
                {PACKAGING.map((p) => (
                  <button key={p.id} onClick={() => setPackaging(p.id)} className={`rounded-2xl border p-4 text-left transition-all ${packaging === p.id ? 'border-blush-400/60 bg-blush-400/10 shadow-glow' : 'border-line/10 hover:border-line/25'}`}>
                    <div className="mb-3 grid h-14 w-14 place-items-center rounded-xl shadow-soft" style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}>
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">{p.desc}</p>
                    <p className="mt-2 text-sm font-bold">+{formatINR(p.price)}</p>
                  </button>
                ))}
              </div>
            </Step>

            <Step n={3} title="Add a message" done={message.trim().length > 0}>
              <div className="space-y-3">
                <input value={to} onChange={(e) => setTo(e.target.value.slice(0, 30))} placeholder="To (e.g. Didi, Amma, Bestie)" className="input" aria-label="Gift recipient" />
                <div className="relative">
                  <PenLine className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted" />
                  <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 140))} rows={3} placeholder="Write something from the heart…" className="input resize-none pl-11" aria-label="Gift message" />
                  <span className="absolute bottom-3 right-4 text-[11px] text-muted">{message.length}/140</span>
                </div>
              </div>
            </Step>
          </div>
        )}
        <div>{preview}</div>
      </div>
    </div>
  )
}
