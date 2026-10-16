import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ChevronLeft, ChevronRight, Crown, Flame, Briefcase, PartyPopper, Sun, Gift, Award, ArrowRight, LogIn, Clock } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import StyleTip from '../components/StyleTip'
import { ProductCardSkeleton, PanelSkeleton, ErrorState } from '../components/Skeletons'
import { Countdown, ProgressRing, SectionHeader, Reveal, formatINR, Stars } from '../components/ui'
import { OCCASIONS, TIERS } from '../data/ui'
import { useApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { firstName } from '../lib/format'

const OCCASION_ICONS = { Crown, Flame, Briefcase, PartyPopper, Sun }

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function DealCard({ deal }) {
  const { addToCart } = useShop()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const p = deal.product
  const dealOff = Math.round(((p.compareAtPrice - deal.dealPrice) / p.compareAtPrice) * 100)
  const soldOut = p.stock <= 0

  const grab = async () => {
    setBusy(true)
    const ok = await addToCart(p)
    setBusy(false)
    if (ok) navigate('/cart')
  }

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] shadow-soft">
      <div className="absolute inset-0 bg-gradient-to-br from-blush-500/25 via-transparent to-gold-400/25" />
      <div className="relative grid md:grid-cols-[1fr_1.15fr]">
        <Link to={`/product/${p.slug}`} className="relative block">
          <ProductImage url={p.image} product={p} className="aspect-square h-full w-full md:aspect-auto md:min-h-[340px]" />
          <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-[#2A1824] shadow-glow">{dealOff}% OFF TODAY</span>
        </Link>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300">
            <Zap className="h-3.5 w-3.5 fill-current" /> Deal of the day
          </div>
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">{p.name}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Stars rating={p.rating} /> {p.rating} · {p.reviewCount} reviews
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-semibold text-gradient">{formatINR(deal.dealPrice)}</span>
            <span className="text-lg text-muted line-through">{formatINR(p.compareAtPrice)}</span>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted">Ends in</p>
            <Countdown to={new Date(deal.endsAt).getTime()} />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.button whileTap={{ scale: 0.95 }} onClick={grab} disabled={busy || soldOut} className="btn-primary px-8">
              <Zap className="h-4 w-4" /> {soldOut ? 'Sold out' : busy ? 'Grabbing…' : 'Grab It'}
            </motion.button>
            {!soldOut && p.stock <= 5 && <span className="text-xs font-medium text-blush-300">🔥 Only {p.stock} left at this price</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoyaltyCard({ loyalty }) {
  if (!loyalty) {
    return (
      <div className="glass flex h-full flex-col items-center gap-6 rounded-[2rem] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <ProgressRing value={0} max={1} size={150} stroke={12}>
          <Gift className="h-9 w-9 text-blush-300" />
        </ProgressRing>
        <div className="flex-1">
          <p className="eyebrow">Glimmora Rewards</p>
          <h3 className="mt-1 text-3xl font-semibold">Sign in to earn rewards</h3>
          <p className="mt-2 text-sm text-muted">Get 1 sparkle point for every ₹10 you spend. Unlock Gold and Diamond perks.</p>
          <Link to="/login" className="btn-primary mt-4"><LogIn className="h-4 w-4" /> Sign in</Link>
        </div>
      </div>
    )
  }
  const tier = TIERS.find((t) => t.name === loyalty.tier)
  return (
    <div className="glass flex h-full flex-col items-center gap-6 rounded-[2rem] p-6 sm:flex-row sm:p-8">
      <ProgressRing value={loyalty.points} max={loyalty.nextTierAt || Math.max(loyalty.points, 1)} size={170} stroke={13}>
        <div>
          <div className="font-display text-4xl font-semibold text-gradient">{loyalty.points.toLocaleString('en-IN')}</div>
          <div className="text-[11px] uppercase tracking-widest text-muted">points</div>
        </div>
      </ProgressRing>
      <div className="flex-1 text-center sm:text-left">
        <p className="eyebrow">Glimmora Rewards</p>
        <h3 className="mt-1 text-3xl font-semibold">
          You’re a <span style={{ color: tier?.color }}>{loyalty.tier}</span> member
        </h3>
        {loyalty.nextTier ? (
          <>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-ink">{loyalty.pointsToNext.toLocaleString('en-IN')} points</span> to reach {loyalty.nextTier}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-blush-400/10 px-3 py-2 text-sm">
              <Gift className="h-4 w-4 text-blush-300" /> {loyalty.nextTier} unlocks free express shipping
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">You’ve reached our highest tier. Thank you for shining with us!</p>
        )}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted sm:justify-start">
          <Award className="h-3.5 w-3.5" /> 1 point for every ₹10 spent
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const scroller = useRef(null)
  const { user } = useAuth()
  // re-fetch when the user signs in/out so the loyalty ring updates
  const { data, error, loading, reload } = useApi(`/home?u=${user?.id || 0}`)
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  if (error && !data) return <div className="py-10"><ErrorState error={error} onRetry={reload} /></div>

  return (
    <div className="space-y-12">
      <div>
        <p className="text-sm text-muted">{greeting()}{user ? `, ${firstName(user.fullName)}` : ''} ✨</p>
        <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">What will you <span className="italic text-gradient">shine</span> in today?</h1>
      </div>

      <Reveal>
        {loading && !data ? (
          <PanelSkeleton className="h-[420px]" />
        ) : data?.deal ? (
          <DealCard deal={data.deal} />
        ) : (
          <div className="glass flex items-center gap-4 rounded-[2rem] p-6">
            <Clock className="h-6 w-6 text-gold-300" />
            <p className="text-sm text-muted">Today’s deal has ended. A new one drops tomorrow — check back soon!</p>
          </div>
        )}
      </Reveal>

      <section>
        <div className="flex items-end justify-between">
          <SectionHeader eyebrow="Hot right now" title="Trending now" />
          <div className="mb-5 hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-blush-400/15" aria-label="Scroll left"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => scroll(1)} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-blush-400/15" aria-label="Scroll right"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div ref={scroller} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {(data?.trending || Array.from({ length: 4 })).map((p, i) => (
            <div key={p?.id || i} className="w-[62%] shrink-0 snap-start sm:w-[44%] md:w-[31%] xl:w-[23.5%]">
              {p ? <ProductCard product={p} index={i} /> : <ProductCardSkeleton />}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Curated edits" title="Shop by occasion" action="View all" to="/collections" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {OCCASIONS.map((o, i) => {
            const Icon = OCCASION_ICONS[o.icon]
            const count = data?.occasionCounts?.[o.id]
            return (
              <Reveal key={o.id} delay={i * 0.06} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
                <Link
                  to={`/collections?occasion=${o.id}`}
                  className={`group relative flex h-36 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${o.gradient} p-4 text-white shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow md:h-56`}
                >
                  <Icon className="absolute right-3 top-3 h-16 w-16 text-white/15 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-125 md:h-20 md:w-20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="relative">
                    <Icon className="mb-2 h-5 w-5 text-gold-200" />
                    <h3 className="font-display text-2xl font-semibold">{o.label}</h3>
                    <p className="text-xs text-white/75">{count != null ? `${count} pieces · ` : ''}{o.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <Reveal>{loading && !data ? <PanelSkeleton className="h-56" /> : <LoyaltyCard loyalty={data?.loyalty} />}</Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-4">
          <StyleTip />
          <Link to="/gift-studio" className="glass shimmer-host group flex flex-1 items-center justify-between gap-4 rounded-[2rem] p-6 transition-all hover:shadow-gold">
            <div>
              <p className="eyebrow">New · Gift Studio</p>
              <h3 className="mt-1 text-2xl font-semibold">Build a gift they’ll never forget</h3>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5 text-[#2A1824]" />
            </span>
          </Link>
        </Reveal>
      </section>
    </div>
  )
}
