import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, Heart, Award, Sparkles, Crown, Gift, Star, Gem, Lock, Check, Truck, Diamond, ShoppingBag, XCircle, LogOut } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import { EmptyState, ProgressRing, formatINR } from '../components/ui'
import { PanelSkeleton, ProductGridSkeleton, ErrorState } from '../components/Skeletons'
import { useLogout } from '../components/Navigation'
import { ORDER_STEPS, TIERS } from '../data/ui'
import { useApi } from '../lib/api'
import { formatDate, initials } from '../lib/format'
import { useShop } from '../context/ShopContext'
import { useTheme } from '../context/ThemeContext'

const BADGE_ICONS = { Sparkles, Crown, Gift, Star, Gem, Award }

function StatusTracker({ status }) {
  const idx = ORDER_STEPS.findIndex((s) => s.id === status)
  const pct = (Math.max(idx, 0) / (ORDER_STEPS.length - 1)) * 100
  return (
    <div className="relative pt-1">
      <div className="absolute left-[12.5%] right-[12.5%] top-[18px] h-1 rounded-full bg-line/10">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-brand shadow-glow" />
      </div>
      <ol className="relative grid grid-cols-4">
        {ORDER_STEPS.map((s, i) => {
          const done = i <= idx
          const current = i === idx && i < ORDER_STEPS.length - 1
          return (
            <li key={s.id} className="flex flex-col items-center gap-1.5 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i }}
                className={`relative grid h-8 w-8 place-items-center rounded-full border-2 ${done ? 'border-transparent bg-brand text-[#2A1824]' : 'border-line/20 bg-bg text-muted'}`}
              >
                {current && <span className="absolute inset-0 animate-ping rounded-full bg-blush-400/40" />}
                {done ? <Check className="relative h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </motion.span>
              <span className={`text-[10px] leading-tight sm:text-xs ${done ? 'font-semibold' : 'text-muted'}`}>{s.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const STATUS_COPY = {
  placed: 'Order placed · arriving in 3–5 days',
  packed: 'Packed with love · ships soon',
  shipped: 'On its way to you',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function OrderCard({ order }) {
  const delivered = order.status === 'delivered'
  const cancelled = order.status === 'cancelled'
  return (
    <div className="glass space-y-5 rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-muted">
            Placed {formatDate(order.createdAt)} · {formatINR(order.total)} · {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card'}
            {order.couponCode && ` · ${order.couponCode}`}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cancelled ? 'bg-red-500/10 text-red-400' : delivered ? 'bg-gold-300/15 text-gold-300' : 'bg-blush-400/15 text-blush-300'}`}>
          {cancelled ? <XCircle className="h-3.5 w-3.5" /> : delivered ? <Check className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />} {STATUS_COPY[order.status]}
        </span>
      </div>
      {order.giftMessage && (
        <p className="flex items-start gap-2 rounded-2xl bg-blush-400/10 px-4 py-3 text-sm">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-blush-300" /> <span className="font-display text-base italic">“{order.giftMessage}”</span>
        </p>
      )}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {order.items.map((it, i) => {
          const body = (
            <>
              <ProductImage url={it.image} product={{ category: it.category || 'Rings', finish: it.finish || 'Gold-plated', name: it.name }} sparkle={false} className="h-12 w-12 rounded-xl" />
              <span className="text-xs">
                <b className="block max-w-[9rem] truncate">{it.name}</b>
                {formatINR(it.unitPrice)} · ×{it.quantity}
              </span>
            </>
          )
          return it.slug ? (
            <Link to={`/product/${it.slug}`} key={i} className="flex shrink-0 items-center gap-2 rounded-2xl bg-line/5 p-2 pr-4 hover:bg-line/10">{body}</Link>
          ) : (
            <div key={i} className="flex shrink-0 items-center gap-2 rounded-2xl bg-line/5 p-2 pr-4">{body}</div>
          )
        })}
      </div>
      {!cancelled && <StatusTracker status={order.status} />}
    </div>
  )
}

function SpendChart({ data }) {
  const { theme } = useTheme()
  const axis = theme === 'dark' ? 'rgba(250,240,243,0.55)' : 'rgba(42,24,36,0.6)'
  const grid = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(60,30,45,0.08)'
  const stroke = theme === 'dark' ? '#EE93AD' : '#C45478'
  const rows = data.map((d) => ({ month: d.month, spend: d.spend / 100 }))
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="month" tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`)} width={52} />
          <Tooltip
            cursor={{ stroke: axis, strokeDasharray: '3 3' }}
            contentStyle={{ background: theme === 'dark' ? '#20151F' : '#fff', border: '1px solid rgba(238,147,173,0.3)', borderRadius: 14, fontSize: 12 }}
            labelStyle={{ color: axis }}
            itemStyle={{ color: theme === 'dark' ? '#FAF0F3' : '#2A1824' }}
            formatter={(v) => [formatINR(v * 100), 'Spent']}
          />
          <Area type="monotone" dataKey="spend" stroke={stroke} strokeWidth={2} fill="url(#spendFill)" activeDot={{ r: 5, stroke: theme === 'dark' ? '#120B12' : '#fff', strokeWidth: 2 }} animationDuration={1400} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function WishlistTab() {
  const { data, error, loading, reload } = useApi('/wishlist')
  const { wishlistIds, addToCart, toggleWishlist } = useShop()
  const [moving, setMoving] = useState(null)
  const items = (data?.items || []).filter((p) => wishlistIds.includes(p.id))

  const moveToCart = async (p) => {
    setMoving(p.id)
    const ok = await addToCart(p, 1, { silent: true })
    if (ok) await toggleWishlist(p)
    setMoving(null)
  }

  if (loading && !data) return <ProductGridSkeleton count={4} />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!items.length) {
    return <EmptyState icon={Heart} title="Your wishlist is waiting" message="Tap the heart on any piece to save it here for later." action={<Link to="/collections" className="btn-primary">Find favourites</Link>} />
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {items.map((p, i) => (
          <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col gap-2">
            <ProductCard product={p} index={i} />
            <button onClick={() => moveToCart(p)} disabled={moving === p.id || p.stock <= 0} className="btn-ghost w-full py-2 text-sm disabled:opacity-50">
              <ShoppingBag className="h-4 w-4 text-blush-300" /> {p.stock <= 0 ? 'Sold out' : moving === p.id ? 'Moving…' : 'Move to Cart'}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function OrdersTab() {
  const { data, error, loading, reload } = useApi('/orders')
  if (loading && !data) return <div className="space-y-4">{[0, 1].map((i) => <PanelSkeleton key={i} className="h-56" />)}</div>
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data.orders.length) {
    return <EmptyState icon={Package} title="No orders yet" message="Your first sparkle is just a tap away." action={<Link to="/collections" className="btn-primary">Start shopping</Link>} />
  }
  return <div className="space-y-4">{data.orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>
}

export default function Profile() {
  const { data, error, loading, reload } = useApi('/profile')
  const { wishlistIds } = useShop()
  const onLogout = useLogout()
  const [tab, setTab] = useState('orders')

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PanelSkeleton className="h-72" />
        <PanelSkeleton className="h-60" />
      </div>
    )
  }
  if (error) return <div className="py-10"><ErrorState error={error} onRetry={reload} /></div>

  const { user, loyalty, badges, spendHistory, stats } = data
  const tier = TIERS.find((t) => t.name === loyalty.tier)
  const earned = badges.filter((b) => b.earned).length
  const hasSpend = spendHistory.some((m) => m.spend > 0)

  const TABS = [
    ['orders', 'Orders', Package, stats.orders],
    ['wishlist', 'Wishlist', Heart, wishlistIds.length],
    ['badges', 'Badges', Award, earned],
  ]

  return (
    <div className="space-y-6">
      <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blush-500/20 via-transparent to-gold-400/20" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,#EE93AD,#EBCB7E,#F4B4C6,#EE93AD)] animate-spin-slow blur-[2px]" />
            <div className="relative grid h-24 w-24 place-items-center rounded-full border-4 border-bg bg-brand font-display text-4xl font-semibold text-[#2A1824]">{initials(user.fullName)}</div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-semibold">{user.fullName}</h1>
            <p className="text-sm text-muted">{user.email} · Member since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-[#2A1824]" style={{ background: `linear-gradient(120deg, ${tier.color}, #FBF1D9)` }}>
                <Crown className="h-4 w-4" /> {loyalty.tier} member
              </span>
              <button onClick={onLogout} className="btn-ghost px-4 py-1.5 text-sm"><LogOut className="h-4 w-4" /> Log out</button>
            </div>
          </div>
          <ProgressRing value={loyalty.points} max={loyalty.nextTierAt || Math.max(loyalty.points, 1)} size={120} stroke={10}>
            <div>
              <div className="font-display text-2xl font-semibold text-gradient">{loyalty.points.toLocaleString('en-IN')}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted">points</div>
            </div>
          </ProgressRing>
        </div>

        <div className="relative mt-8">
          <div className="grid grid-cols-3 gap-2">
            {TIERS.map((t) => {
              const reached = loyalty.points >= t.min
              const Icon = t.name === 'Diamond' ? Diamond : t.name === 'Gold' ? Crown : Star
              return (
                <div key={t.name} className={`rounded-2xl border p-3 text-center transition-all ${t.name === loyalty.tier ? 'border-gold-300/50 bg-gold-300/10 shadow-gold' : 'border-line/10'} ${reached ? '' : 'opacity-50'}`}>
                  <Icon className="mx-auto h-5 w-5" style={{ color: t.color }} />
                  <p className="mt-1 text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted">{t.min.toLocaleString('en-IN')}+ pts</p>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            {loyalty.nextTier ? <>{loyalty.pointsToNext.toLocaleString('en-IN')} points to unlock <b className="text-ink">{loyalty.nextTier}</b> — 1 point for every ₹10 spent.</> : 'You’ve reached Diamond — our highest tier. ✨'}
          </p>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-5 sm:p-6">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="eyebrow">Your sparkle spend</p>
            <h2 className="text-2xl font-semibold">Last 6 months</h2>
          </div>
          <p className="text-sm text-muted">Total <b className="text-ink">{formatINR(spendHistory.reduce((s, x) => s + x.spend, 0))}</b></p>
        </div>
        {hasSpend ? (
          <SpendChart data={spendHistory} />
        ) : (
          <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-line/15 text-center text-sm text-muted">Your spending chart will appear after your first order.</div>
        )}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {TABS.map(([k, l, Icon, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? 'chip-active' : ''}`}>
            <Icon className="h-4 w-4" /> {l} <span className="rounded-full bg-black/10 px-1.5 text-xs">{n}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          {tab === 'orders' && <OrdersTab />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'badges' && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {badges.map((b, i) => {
                const Icon = BADGE_ICONS[b.icon] || Award
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={b.earned ? { y: -4, rotate: -1 } : {}}
                    className={`glass relative flex flex-col items-center rounded-3xl p-5 text-center ${b.earned ? 'shimmer-host' : 'opacity-55'}`}
                  >
                    <div className={`relative mb-3 grid h-16 w-16 place-items-center rounded-full ${b.earned ? 'bg-brand shadow-glow' : 'bg-line/10'}`}>
                      <Icon className={`h-7 w-7 ${b.earned ? 'text-[#2A1824]' : 'text-muted'}`} />
                      {!b.earned && <Lock className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-surface p-1 text-muted" />}
                    </div>
                    <p className="font-display text-lg font-semibold">{b.name}</p>
                    <p className="text-xs text-muted">{b.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
