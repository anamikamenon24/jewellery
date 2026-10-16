import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, ShoppingBag, Truck, MapPin, ShieldCheck, RotateCcw, Flame, ZoomIn, ChevronLeft, Sparkles, PackageX, Droplets, Zap, MessageCircle } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import { Stars, QtyStepper, formatINR, EmptyState, SectionHeader } from '../components/ui'
import { PanelSkeleton, ErrorState, Skeleton } from '../components/Skeletons'
import { FINISH_STYLES } from '../data/ui'
import { useApi } from '../lib/api'
import { formatDate } from '../lib/format'
import { useShop } from '../context/ShopContext'

function Gallery({ product }) {
  const images = product.images.length ? product.images : [product.image]
  const count = images.length
  const [view, setView] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [dir, setDir] = useState(1)

  const go = (next) => {
    const n = (next + count) % count
    setDir(n > view ? 1 : -1)
    setView(n)
    setZoom(false)
  }

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className="space-y-3">
      <div
        className="glass relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem]"
        onMouseMove={onMove}
        onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onClick={() => !window.matchMedia('(hover: hover)').matches && setZoom((z) => !z)}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={view}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={zoom || count < 2 ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(view + 1)
              else if (info.offset.x > 50) go(view - 1)
            }}
            className="absolute inset-0 touch-pan-y"
          >
            <div className="h-full w-full transition-transform duration-300 ease-out" style={{ transform: zoom ? 'scale(2.1)' : 'scale(1)', transformOrigin: origin }}>
              <ProductImage url={images[view]} product={product} className="h-full w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
        {count > 1 && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === view ? 'w-6 bg-brand' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}
        <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur">
          <ZoomIn className="h-3 w-3" /> <span className="hidden sm:inline">Hover to zoom</span><span className="sm:hidden">Tap to zoom · swipe</span>
        </span>
      </div>
      {count > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((url, i) => (
            <button key={url + i} onClick={() => go(i)} className={`overflow-hidden rounded-2xl ring-2 transition-all ${i === view ? 'ring-blush-400 shadow-glow' : 'ring-transparent opacity-60 hover:opacity-100'}`} aria-label={`Image ${i + 1}`}>
              <ProductImage url={url} product={product} sparkle={false} className="aspect-square w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveryEstimate() {
  const [pin, setPin] = useState('')
  const [result, setResult] = useState(null)

  const check = (e) => {
    e.preventDefault()
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setResult({ error: 'Please enter a valid 6-digit pincode.' })
      return
    }
    const days = 2 + (Number(pin[0]) % 4)
    const d = new Date(Date.now() + days * 86400000)
    setResult({ date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }), cod: Number(pin[5]) !== 9 })
  }

  return (
    <div className="glass rounded-3xl p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-gold-300" /> Delivery estimate</p>
      <form onSubmit={check} className="flex gap-2">
        <label className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Enter pincode" className="input py-2.5 pl-10" aria-label="Pincode" />
        </label>
        <button className="btn-ghost px-4 text-sm">Check</button>
      </form>
      <AnimatePresence mode="wait">
        {result && (
          <motion.p key={result.date || result.error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`mt-2 text-sm ${result.error ? 'text-red-400' : 'text-muted'}`}>
            {result.error || (
              <>
                Get it by <span className="font-semibold text-ink">{result.date}</span> · {result.cod ? 'Cash on delivery available' : 'Prepaid only for this pincode'}
              </>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" role="status" aria-label="Loading">
      <PanelSkeleton className="aspect-square" />
      <div className="space-y-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-14 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full !rounded-full" />
        <Skeleton className="h-12 w-full !rounded-full" />
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data, error, loading, reload } = useApi(`/products/${encodeURIComponent(slug)}`)
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('reviews')
  const [busy, setBusy] = useState(false)

  if (loading && !data) return <DetailSkeleton />
  if (error?.status === 404) {
    return (
      <div className="py-12">
        <EmptyState icon={PackageX} title="This piece has vanished" message="It may have sold out or the link is broken. Let’s find you something just as lovely." action={<Link to="/collections" className="btn-primary">Browse collections</Link>} />
      </div>
    )
  }
  if (error) return <div className="py-10"><ErrorState error={error} onRetry={reload} /></div>

  const { product, reviews, related } = data
  const liked = isWishlisted(product.id)
  const soldOut = product.stock <= 0
  const quantity = Math.min(qty, Math.max(product.stock, 1))

  const add = async (buyNow = false) => {
    setBusy(true)
    const ok = await addToCart(product, quantity)
    setBusy(false)
    if (ok && buyNow) navigate('/cart')
  }

  const distribution = [5, 4, 3, 2, 1].map((s) => (reviews.length ? Math.round((reviews.filter((r) => r.rating === s).length / reviews.length) * 100) : 0))

  return (
    <div className="space-y-14">
      <div>
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="grid gap-8 lg:grid-cols-2">
          <Gallery product={product} />

          <div className="space-y-5">
            <div>
              <p className="eyebrow">{product.category} · {product.occasion}</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <h1 className="text-4xl font-semibold sm:text-5xl">{product.name}</h1>
                <motion.button whileTap={{ scale: 0.75 }} onClick={() => toggleWishlist(product)} className="glass grid h-12 w-12 shrink-0 place-items-center rounded-full" aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={liked}>
                  <motion.span key={String(liked)} initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.3, 1] }}>
                    <Heart className={`h-5 w-5 ${liked ? 'fill-blush-400 text-blush-400' : ''}`} />
                  </motion.span>
                </motion.button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                <Stars rating={product.rating} /> <span className="font-semibold text-ink">{product.rating}</span> · {product.reviewCount} reviews
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-5xl font-semibold text-gradient">{formatINR(product.price)}</span>
              {product.compareAtPrice > product.price && <span className="text-lg text-muted line-through">{formatINR(product.compareAtPrice)}</span>}
              {product.discount > 0 && <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-[#2A1824]">{product.discount}% OFF</span>}
              {product.onDeal && <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/15 px-2.5 py-1 text-xs font-semibold text-gold-300"><Zap className="h-3 w-3 fill-current" /> Deal of the day</span>}
            </div>
            {soldOut ? (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400">Sold out — save it to your wishlist for when it’s back</p>
            ) : product.stock <= 5 ? (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-300/10 px-3 py-1.5 text-sm font-medium text-gold-300">
                <Flame className="h-4 w-4" /> Only {product.stock} left — selling fast
              </p>
            ) : null}
            <p className="text-muted">{product.description}</p>

            <div>
              <p className="mb-2 text-sm font-semibold">Finish: <span className="font-normal text-muted">{product.finish}</span></p>
              <div className="flex flex-wrap gap-2">
                <span className="chip chip-active">
                  <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: FINISH_STYLES[product.finish]?.swatch }} />
                  {product.finish}
                </span>
                <Link to={`/collections?category=${product.category}`} className="chip hover:border-blush-400/50">More {product.category.toLowerCase()} →</Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <QtyStepper value={quantity} onChange={(v) => setQty(Math.max(1, v))} max={Math.max(product.stock, 1)} />
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => add()} disabled={soldOut || busy} className="btn-primary flex-1 py-3.5">
                <ShoppingBag className="h-5 w-5" /> {soldOut ? 'Sold out' : `Add to Cart · ${formatINR(product.price * quantity)}`}
              </motion.button>
            </div>
            <button onClick={() => add(true)} disabled={soldOut || busy} className="btn-ghost w-full py-3.5 disabled:opacity-50"><Sparkles className="h-4 w-4 text-gold-300" /> Buy now</button>

            <DeliveryEstimate />

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted">
              {[[ShieldCheck, 'Nickel-free & skin safe'], [RotateCcw, '7-day returns'], [Truck, 'Free over ₹499']].map(([Icon, t]) => (
                <div key={t} className="glass rounded-2xl p-3"><Icon className="mx-auto mb-1 h-4 w-4 text-blush-300" />{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-5 flex gap-2">
          {[['reviews', `Reviews (${reviews.length})`], ['care', 'Care tips']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? 'chip-active' : ''}`}>{l}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {tab === 'reviews' ? (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-[260px_1fr]">
              <div className="glass rounded-3xl p-6 text-center">
                <div className="font-display text-6xl font-semibold text-gradient">{product.rating}</div>
                <Stars rating={product.rating} size="h-5 w-5" />
                <p className="mt-1 text-sm text-muted">{product.reviewCount} ratings</p>
                {reviews.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((s, i) => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{s}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/10">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${distribution[i]}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.08 }} className="h-full rounded-full bg-brand" />
                        </div>
                        <span className="w-8 text-right text-muted">{distribution[i]}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {reviews.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="glass rounded-3xl p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-semibold text-[#2A1824]">{r.name[0]}</span>
                        <div>
                          <p className="text-sm font-semibold">{r.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted"><Stars rating={r.rating} size="h-3 w-3" /> {formatDate(r.createdAt, { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted">“{r.comment}”</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass flex flex-col items-center justify-center rounded-3xl p-8 text-center">
                  <MessageCircle className="mb-3 h-8 w-8 text-blush-300" />
                  <p className="font-display text-2xl font-semibold">No written reviews yet</p>
                  <p className="mt-1 text-sm text-muted">Be the first to tell others how it sparkles.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="care" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-3 sm:grid-cols-2">
              {product.careTips.map((t, i) => (
                <div key={t} className="glass flex items-start gap-3 rounded-3xl p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-300/15 text-gold-300">
                    {i === 0 ? <Droplets className="h-4 w-4" /> : <span className="font-display text-lg font-semibold">{i + 1}</span>}
                  </span>
                  <p className="text-sm">{t}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {related.length > 0 && (
        <section>
          <SectionHeader eyebrow="Complete the look" title="You may also like" action={`All ${product.category.toLowerCase()}`} to={`/collections?category=${product.category}`} />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  )
}
