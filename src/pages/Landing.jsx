import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Gem, Sparkles, Heart, Gift, ShoppingBag, Truck, Star } from 'lucide-react'
import Logo from '../components/Logo'
import JewelArt from '../components/JewelArt'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { AnimatedCounter, ThemeToggle, Reveal, formatINR } from '../components/ui'
import ProductImage from '../components/ProductImage'
import { UserMenu } from '../components/Navigation'
import { CATEGORIES } from '../data/ui'
import { useApi } from '../lib/api'

const ease = [0.22, 1, 0.36, 1]

const heroSlots = [
  { className: 'left-[2%] top-[8%] w-[46%] rotate-[-8deg]', delay: 0.3, float: 0 },
  { className: 'right-[0%] top-[0%] w-[42%] rotate-[7deg]', delay: 0.45, float: 1.2 },
  { className: 'left-[24%] bottom-[0%] w-[50%] rotate-[3deg]', delay: 0.6, float: 2.2 },
]

const STAT_ICONS = [Heart, Truck, Sparkles]

export default function Landing() {
  const { data: stats, error: statsError } = useApi('/stats')
  const { data: home } = useApi('/home')
  // one trending piece per category, for a varied collage
  const heroPieces = (home?.trending || []).filter((p, i, all) => all.findIndex((x) => x.category === p.category) === i).slice(0, 3)
  const STATS = [
    { label: 'Happy customers', value: stats?.customers },
    { label: 'Orders delivered', value: stats?.ordersDelivered },
    { label: 'New arrivals this week', value: stats?.newArrivalsThisWeek },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blush-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full bg-gold-400/20 blur-[120px]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo to="/" />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link to="/collections" className="hover:text-ink transition-colors">Collections</Link>
          <Link to="/gift-studio" className="hover:text-ink transition-colors">Gift Studio</Link>
          <Link to="/home" className="hover:text-ink transition-colors">Deals</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/home" className="btn-ghost hidden md:inline-flex text-sm"><ShoppingBag className="h-4 w-4" /> Enter store</Link>
          <UserMenu compact />
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-300" />
            {stats ? `${stats.newArrivalsThisWeek} new arrivals this week · up to ${stats.maxDiscount}% off` : 'New arrivals every week'}
          </motion.div>

          <h1 className="mt-6 font-display font-semibold leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="block text-gradient animate-gradient italic text-5xl sm:text-6xl"
              style={{ textShadow: '0 0 40px rgba(238,147,173,0.35)' }}
            >
              Glimmora
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="mt-2 block text-[3.4rem] sm:text-7xl xl:text-8xl"
            >
              Shine brighter.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="block text-[3.4rem] italic text-muted sm:text-7xl xl:text-8xl"
            >
              Spend <span className="text-gradient">smarter.</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 max-w-lg text-base text-muted sm:text-lg"
          >
            Trend-led artificial jewellery that looks like heirloom gold — kundan, pearls, rose gold and more, styled for every occasion from your 9-to-5 to your best friend’s sangeet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/collections" className="btn-primary px-8 py-4 text-base">
              <Gem className="h-5 w-5" /> Explore Collections <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/gift-studio" className="btn-ghost px-6 py-4"><Gift className="h-4 w-4 text-blush-300" /> Build a gift box</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex items-center gap-3 text-sm text-muted">
            <div className="flex -space-x-2">
              {['#F4B4C6', '#EBCB7E', '#E06F92', '#C8973C'].map((c, i) => (
                <span key={c} className="grid h-8 w-8 place-items-center rounded-full border-2 border-bg text-[11px] font-bold text-[#2A1824]" style={{ background: c }}>
                  {'PAMZ'[i]}
                </span>
              ))}
            </div>
            {stats && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold-300 text-gold-300" /> {stats.avgRating} from {stats.totalReviews.toLocaleString('en-IN')} reviews
              </span>
            )}
          </motion.div>
        </div>

        {/* floating product collage */}
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="absolute inset-[8%] rounded-full border border-dashed border-gold-300/25 animate-spin-slow" />
          <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-blush-400/30 to-gold-300/20 blur-3xl" />
          {heroSlots.map(({ className, delay, float }, i) => {
            const p = heroPieces[i]
            return (
              <motion.div
                key={p?.id || `slot-${i}`}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay, ease }}
                className={`absolute ${className}`}
              >
                <div className="animate-float" style={{ animationDelay: `${float}s` }}>
                  {p ? (
                    <Link to={`/product/${p.slug}`} className="glass block overflow-hidden rounded-[2rem] p-2 shadow-glow transition-transform duration-500 hover:scale-105">
                      <ProductImage url={p.image} product={p} className="aspect-square w-full rounded-[1.5rem]" />
                      <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-2">
                        <span className="truncate font-display text-sm font-semibold sm:text-base">{p.name}</span>
                        <span className="shrink-0 text-xs font-bold text-gold-300">{formatINR(p.price)}</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="glass overflow-hidden rounded-[2rem] p-2">
                      <JewelArt category={['Earrings', 'Rings', 'Necklaces'][i]} finish={['Kundan', 'Rose Gold', 'Pearl'][i]} className="aspect-square w-full rounded-[1.5rem] opacity-60" />
                      <div className="skeleton mx-2 mb-1 mt-2 h-4 rounded-full" />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* stats */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {STATS.map((s, i) => {
            const Icon = STAT_ICONS[i]
            return (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="glass group flex items-center gap-4 rounded-3xl p-5 transition-all hover:-translate-y-1 hover:shadow-glow sm:p-6">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand">
                    <Icon className="h-5 w-5 text-[#2A1824]" />
                  </div>
                  <div>
                    <div className="font-display text-4xl font-semibold leading-none text-gradient">
                      {s.value == null ? (
                        statsError ? <span className="text-2xl text-muted">—</span> : <span className="skeleton inline-block h-9 w-24 rounded-xl align-middle" />
                      ) : (
                        <AnimatedCounter value={s.value} />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* category marquee */}
      <section className="relative z-10 mt-16 overflow-hidden border-y border-line/10 py-5">
        <motion.div
          className="flex w-max gap-10 whitespace-nowrap font-display text-3xl italic text-muted sm:text-4xl"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={i} className="flex items-center gap-10">
              {c} <Sparkles className="h-5 w-5 text-gold-300" />
            </span>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-8 text-center sm:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-500/20 via-transparent to-gold-400/20" />
            <div className="relative">
              <p className="eyebrow">Members get more</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">Earn sparkle points on every order. Unlock Gold & Diamond perks.</h2>
              <Link to="/home" className="btn-primary mt-8">Start shopping <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="relative z-10 [&>footer]:pb-10">
        <Footer />
      </div>
      <WhatsAppButton />
      <style>{`@media (max-width: 1023px) { a[aria-label="Order on WhatsApp"] { bottom: 1.25rem; } }`}</style>
    </div>
  )
}
