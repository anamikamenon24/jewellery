import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, SearchX, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { EmptyState } from '../components/ui'
import { ProductGridSkeleton, ErrorState } from '../components/Skeletons'
import { CATEGORIES, FINISHES, FINISH_STYLES, OCCASIONS, PRICE_RANGES } from '../data/ui'
import { api } from '../lib/api'

const SORTS = [
  ['bestsellers', 'Bestsellers'],
  ['newest', 'Newest'],
  ['price_asc', 'Price: low → high'],
  ['price_desc', 'Price: high → low'],
]
const PAGE_SIZE = 12

export default function Collections() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'All'
  const finish = params.get('finish') || 'All'
  const occasion = params.get('occasion') || 'All'
  const price = params.get('price') || 'all'
  const sort = params.get('sort') || 'bestsellers'
  const [query, setQuery] = useState(params.get('q') || '')
  const [debounced, setDebounced] = useState(query)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const reqId = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const setParam = (key, value, empty = 'All') => {
    const next = new URLSearchParams(params)
    if (value === empty || !value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const buildQuery = (p) => {
    const range = PRICE_RANGES.find((r) => r.id === price) || PRICE_RANGES[0]
    const q = new URLSearchParams({ sort, page: String(p), limit: String(PAGE_SIZE) })
    if (category !== 'All') q.set('category', category)
    if (finish !== 'All') q.set('finish', finish)
    if (occasion !== 'All') q.set('occasion', occasion)
    if (range.min) q.set('minPrice', String(range.min))
    if (range.max) q.set('maxPrice', String(range.max))
    if (debounced) q.set('q', debounced)
    return q.toString()
  }

  const load = async (p = 1) => {
    const id = ++reqId.current
    p === 1 ? setLoading(true) : setLoadingMore(true)
    setError(null)
    try {
      const data = await api(`/products?${buildQuery(p)}`)
      if (id !== reqId.current) return
      setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]))
      setTotal(data.total)
      setPage(data.page)
      setHasMore(data.hasMore)
    } catch (err) {
      if (id === reqId.current) setError(err)
    } finally {
      if (id === reqId.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, finish, occasion, price, sort, debounced])

  const activeCount = [category, finish, occasion].filter((x) => x !== 'All').length + (price !== 'all' ? 1 : 0) + (debounced ? 1 : 0)
  const clearAll = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">The collection library</p>
        <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">
          {occasion !== 'All' ? <>For your <span className="italic text-gradient">{occasion.toLowerCase()}</span> moments</> : <>Find your <span className="italic text-gradient">sparkle</span></>}
        </h1>
      </div>

      <div className="glass space-y-4 rounded-[2rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jhumkas, pearls, kundan…" className="input pl-11" aria-label="Search products" />
          </label>
          <div className="flex gap-2">
            <label className="relative flex-1 sm:flex-none">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select value={sort} onChange={(e) => setParam('sort', e.target.value, 'bestsellers')} className="input appearance-none pl-11 pr-8 sm:w-56" aria-label="Sort products">
                {SORTS.map(([k, label]) => (
                  <option key={k} value={k} className="bg-surface text-ink">{label}</option>
                ))}
              </select>
            </label>
            <select value={occasion} onChange={(e) => setParam('occasion', e.target.value)} className="input w-auto appearance-none pr-6" aria-label="Filter by occasion">
              <option value="All" className="bg-surface text-ink">Any occasion</option>
              {OCCASIONS.map((o) => <option key={o.id} value={o.id} className="bg-surface text-ink">{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Category</p>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {['All', ...CATEGORIES].map((c) => (
              <motion.button whileTap={{ scale: 0.94 }} key={c} onClick={() => setParam('category', c)} className={`chip ${category === c ? 'chip-active' : 'hover:border-blush-400/50'}`}>
                {c}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Finish</p>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {['All', ...FINISHES].map((f) => (
              <motion.button whileTap={{ scale: 0.94 }} key={f} onClick={() => setParam('finish', f)} className={`chip ${finish === f ? 'chip-active' : 'hover:border-blush-400/50'}`}>
                {f !== 'All' && <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: FINISH_STYLES[f].swatch }} />}
                {f}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Price</p>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {PRICE_RANGES.map((r) => (
              <motion.button whileTap={{ scale: 0.94 }} key={r.id} onClick={() => setParam('price', r.id, 'all')} className={`chip ${price === r.id ? 'chip-active' : 'hover:border-blush-400/50'}`}>
                {r.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted">
          {loading ? 'Finding pieces…' : <><span className="font-semibold text-ink">{total}</span> pieces found</>}
        </p>
        {activeCount > 0 && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 text-blush-300 hover:text-gold-300">
            <X className="h-4 w-4" /> Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {error && !items.length ? (
        <ErrorState error={error} onRetry={() => load(1)} />
      ) : loading ? (
        <ProductGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No sparkle here… yet"
          message="We couldn’t find pieces matching those filters. Try a different finish, price or category."
          action={<button onClick={clearAll} className="btn-primary">Clear all filters</button>}
        />
      ) : (
        <>
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence initial={false}>
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
          {loadingMore && <ProductGridSkeleton count={4} />}
          {hasMore && !loadingMore && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <button onClick={() => load(page + 1)} className="btn-ghost px-8 py-3">
                <ChevronDown className="h-4 w-4 text-blush-300" /> Load more
              </button>
              <p className="text-xs text-muted">Showing {items.length} of {total}</p>
            </div>
          )}
          {error && items.length > 0 && <p className="text-center text-sm text-red-400">{error.message}</p>}
        </>
      )}
    </div>
  )
}
