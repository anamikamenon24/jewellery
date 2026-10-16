import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gem, Trash2, Tag, X, ChevronLeft, Lock } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import { CheckoutForm, OrderSuccess, celebrate } from '../components/Checkout'
import { EmptyState, QtyStepper, formatINR } from '../components/ui'
import { PanelSkeleton, ErrorState } from '../components/Skeletons'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function CartLine({ line }) {
  const { updateQty, removeFromCart } = useShop()
  const p = line.product
  return (
    <motion.div layout exit={{ opacity: 0, x: -40 }} className="glass flex gap-4 rounded-3xl p-3 sm:p-4">
      <Link to={`/product/${p.slug}`} className="shrink-0 overflow-hidden rounded-2xl">
        <ProductImage url={p.image} product={p} sparkle={false} className="h-24 w-24 sm:h-28 sm:w-28" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${p.slug}`} className="font-display text-xl font-semibold leading-tight hover:text-blush-300">{p.name}</Link>
            <p className="text-xs text-muted">
              {p.finish}
              {p.onDeal && <span className="ml-2 rounded-full bg-gold-300/15 px-2 py-0.5 font-semibold text-gold-300">Deal price</span>}
              {p.stock <= 0 ? (
                <span className="ml-2 font-semibold text-red-400">Sold out — please remove</span>
              ) : line.quantity > p.stock ? (
                <span className="ml-2 font-semibold text-red-400">Only {p.stock} left — reduce quantity</span>
              ) : (
                p.stock <= 5 && <span className="ml-2 text-gold-300">Only {p.stock} left</span>
              )}
            </p>
          </div>
          <button onClick={() => removeFromCart(p.id)} className="text-muted hover:text-red-400" aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QtyStepper small value={line.quantity} onChange={(v) => updateQty(p.id, v)} max={p.stock} />
          <div className="text-right leading-tight">
            <div className="font-bold">{formatINR(p.price * line.quantity)}</div>
            {p.compareAtPrice > p.price && <div className="text-xs text-muted line-through">{formatINR(p.compareAtPrice * line.quantity)}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Summary({ children }) {
  const { cart, coupon, applyCoupon, removeCoupon } = useShop()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const t = cart.totals

  const apply = async (c = code) => {
    if (!c.trim()) return setError('Enter a coupon code first.')
    setBusy(true)
    try {
      const applied = await applyCoupon(c)
      setError('')
      setCode('')
      toast({ title: 'Coupon applied 🎉', message: `${applied.code} · ${applied.label}` })
    } catch (err) {
      setError(err.message)
      toast({ type: 'error', title: 'Coupon not applied', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (!t) return <PanelSkeleton className="h-80" />
  const savings = t.compareAtTotal - t.subtotal + t.discount

  return (
    <div className="glass sticky top-24 space-y-4 rounded-[2rem] p-5 sm:p-6">
      <h2 className="text-2xl font-semibold">Order summary</h2>
      {coupon ? (
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-gold-300/50 bg-gold-300/10 px-4 py-3">
          <span className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-gold-300" /><b>{coupon.code}</b> applied</span>
          <button onClick={removeCoupon} className="text-muted hover:text-ink" aria-label="Remove coupon"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div>
          <form onSubmit={(e) => { e.preventDefault(); apply() }} className="flex gap-2">
            <label className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={code} onChange={(e) => { setCode(e.target.value); setError('') }} placeholder="Coupon code" className="input py-2.5 pl-10 uppercase placeholder:normal-case" aria-label="Coupon code" />
            </label>
            <button disabled={busy} className="btn-ghost px-4 text-sm">{busy ? '…' : 'Apply'}</button>
          </form>
          {error && <p className="mt-2 text-xs text-red-400" role="alert">{error}</p>}
          <p className="mt-2 text-[11px] text-muted">Try <button type="button" onClick={() => apply('WELCOME10')} className="font-semibold text-blush-300 hover:underline">WELCOME10</button> for 10% off.</p>
        </div>
      )}
      <dl className="space-y-2 text-sm">
        {t.compareAtTotal > t.subtotal && <div className="flex justify-between"><dt className="text-muted">MRP total</dt><dd className="text-muted line-through">{formatINR(t.compareAtTotal)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(t.subtotal)}</dd></div>
        {t.discount > 0 && <div className="flex justify-between text-gold-300"><dt>Coupon discount</dt><dd>−{formatINR(t.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{t.shipping ? formatINR(t.shipping) : <span className="text-gold-300">FREE</span>}</dd></div>
        <div className="flex items-baseline justify-between border-t border-line/10 pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-3xl font-semibold text-gradient">{formatINR(t.total)}</dd>
        </div>
      </dl>
      {savings > 0 && <p className="rounded-2xl bg-blush-400/10 px-4 py-2.5 text-center text-sm text-blush-300">✨ You’re saving {formatINR(savings)} on this order</p>}
      <p className="text-center text-[11px] text-muted">Prices and totals are confirmed on our server when you order.</p>
      {children}
    </div>
  )
}

export default function Cart() {
  const { cart, cartCount, loadCart, clearCart, placeOrder } = useShop()
  const { refresh } = useAuth()
  const [step, setStep] = useState('cart')
  const [placed, setPlaced] = useState(null)

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const submitOrder = async (payload) => {
    try {
      const res = await placeOrder(payload)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      celebrate()
      setPlaced(res)
      refresh()
      loadCart('')
    } catch (err) {
      if (err.code === 'OUT_OF_STOCK') loadCart()
      throw err
    }
  }

  const unavailable = cart.items.find((l) => l.quantity > l.product.stock)

  useEffect(() => {
    if (unavailable && step === 'checkout') setStep('cart')
  }, [unavailable, step])

  if (placed) return <div className="py-6"><OrderSuccess result={placed} /></div>
  if (cart.error && !cart.loaded) return <div className="py-10"><ErrorState error={cart.error} onRetry={() => loadCart()} /></div>
  if (!cart.loaded) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">{[0, 1, 2].map((i) => <PanelSkeleton key={i} className="h-32 !rounded-3xl" />)}</div>
        <PanelSkeleton className="h-80" />
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="py-10">
        <EmptyState
          icon={Gem}
          title="Your jewellery box is empty"
          message="Find something that sparkles!"
          action={<Link to="/collections" className="btn-primary">Explore Collections</Link>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">{step === 'cart' ? 'Your cart' : 'Secure checkout'}</p>
          <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">
            {step === 'cart' ? <>{cartCount} {cartCount === 1 ? 'piece' : 'pieces'} of <span className="italic text-gradient">joy</span></> : 'Almost yours'}
          </h1>
        </div>
        {step === 'cart' && <button onClick={clearCart} className="text-sm text-muted hover:text-red-400">Clear cart</button>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AnimatePresence mode="wait">
          {step === 'cart' ? (
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <AnimatePresence initial={false}>
                {cart.items.map((line) => <CartLine key={line.product.id} line={line} />)}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <button type="button" onClick={() => setStep('cart')} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft className="h-4 w-4" /> Back to cart</button>
              <CheckoutForm total={cart.totals?.total} onSubmit={submitOrder} />
            </motion.div>
          )}
        </AnimatePresence>
        <div>
          <Summary>
            {step === 'cart' && (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!!unavailable}
                  onClick={() => { setStep('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="btn-primary w-full py-4"
                >
                  <Lock className="h-4 w-4" /> Proceed to checkout
                </motion.button>
                {unavailable && (
                  <p className="text-center text-xs text-red-400" role="alert">
                    {unavailable.product.name} {unavailable.product.stock <= 0 ? 'has sold out' : `has only ${unavailable.product.stock} left`}. Update your cart to continue.
                  </p>
                )}
              </>
            )}
          </Summary>
        </div>
      </div>
    </div>
  )
}
