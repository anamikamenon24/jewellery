import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Flame } from 'lucide-react'
import ProductImage from './ProductImage'
import { Stars, formatINR } from './ui'
import { useShop } from '../context/ShopContext'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const liked = isWishlisted(product.id)
  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= 5

  const onLike = (e) => {
    e.preventDefault()
    toggleWishlist(product)
  }

  const onAdd = (e) => {
    e.preventDefault()
    if (!soldOut) addToCart(product)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min((index % 12) * 0.04, 0.3) }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="glass shimmer-host flex h-full flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-glow"
      >
        <div className="relative aspect-square">
          <ProductImage url={product.image} product={product} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-[#2A1824] shadow">{product.discount}% OFF</span>
            )}
            {product.isNew && <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">New</span>}
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onLike}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/35 backdrop-blur transition-colors hover:bg-black/50"
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={liked}
          >
            <Heart className={`h-[18px] w-[18px] transition-all ${liked ? 'fill-blush-400 text-blush-400 scale-110' : 'text-white'}`} />
          </motion.button>
          {(lowStock || soldOut) && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#2A1824]/80 px-2.5 py-1 text-[11px] font-semibold text-gold-200 backdrop-blur">
              <Flame className="h-3 w-3" /> {soldOut ? 'Sold out' : `Only ${product.stock} left`}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.category} · {product.finish}</p>
          <h3 className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-tight sm:text-xl">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <Stars rating={product.rating} size="h-3 w-3" />
            <span>{product.rating} ({product.reviewCount})</span>
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="leading-tight">
              <span className="text-lg font-bold">{formatINR(product.price)}</span>
              {product.compareAtPrice > product.price && <span className="ml-1.5 text-xs text-muted line-through">{formatINR(product.compareAtPrice)}</span>}
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onAdd}
              disabled={soldOut}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[#2A1824] shadow-glow transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
              aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
