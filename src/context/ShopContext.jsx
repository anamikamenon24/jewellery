import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

// Cart + wishlist state, kept in sync with the server. Every change is applied instantly
// on screen (optimistic) and rolled back with a friendly toast if the server says no.

const ShopContext = createContext(null)
const PENDING_KEY = 'glimmora-pending-action'

const readPending = () => {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null')
  } catch {
    return null
  }
}
const writePending = (v) => {
  try {
    v ? sessionStorage.setItem(PENDING_KEY, JSON.stringify(v)) : sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function ShopProvider({ children }) {
  const { user, session, setSession } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [cart, setCart] = useState({ items: [], totals: null, loading: false, loaded: false, error: null })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const couponRef = useRef('')
  couponRef.current = couponCode

  const wishlistIds = session.wishlistIds
  const cartCount = session.cartCount
  const setCartCount = (fn) => setSession((s) => ({ ...s, cartCount: Math.max(0, typeof fn === 'function' ? fn(s.cartCount) : fn) }))
  const setWishlistIds = (fn) => setSession((s) => ({ ...s, wishlistIds: fn(s.wishlistIds) }))

  // ---- auth gate -------------------------------------------------------
  const requireLogin = (action, message = 'Sign in to continue') => {
    writePending({ ...action, returnTo: location.pathname + location.search })
    toast({ type: 'info', title: message, message: 'We’ll finish this for you right after.' })
    navigate('/login', { state: { from: location.pathname + location.search } })
  }

  // ---- cart ------------------------------------------------------------
  const loadCart = useCallback(
    async (code = couponRef.current) => {
      if (!user) return
      setCart((c) => ({ ...c, loading: !c.loaded, error: null }))
      try {
        const data = await api(`/cart${code ? `?coupon=${encodeURIComponent(code)}` : ''}`)
        setCart({ items: data.items, totals: data.totals, loading: false, loaded: true, error: null })
        setCoupon(data.coupon)
        if (code && data.couponError) {
          setCoupon(null)
          setCouponCode('')
          toast({ type: 'error', title: 'Coupon removed', message: data.couponError })
        }
        setCartCount(data.totals.itemCount)
      } catch (err) {
        setCart((c) => ({ ...c, loading: false, error: err }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  )

  useEffect(() => {
    if (!user) {
      setCart({ items: [], totals: null, loading: false, loaded: false, error: null })
      setCoupon(null)
      setCouponCode('')
    }
  }, [user])

  const addToCart = async (product, quantity = 1, { silent = false } = {}) => {
    if (!user) return requireLogin({ type: 'cart', productId: product.id, quantity, name: product.name }, 'Sign in to add to your bag')
    setCartCount((n) => n + quantity)
    try {
      const res = await api('/cart', { method: 'POST', body: { productId: product.id, quantity } })
      if (!silent) {
        toast(res.capped ? { type: 'info', title: 'Added to cart', message: `That’s all we have — only ${res.stock} of ${product.name} in stock.` } : { title: 'Added to cart ✨', message: product.name })
      }
      if (cart.loaded) loadCart()
      return true
    } catch (err) {
      setCartCount((n) => n - quantity)
      toast({ type: 'error', title: 'Couldn’t add to cart', message: err.message })
      return false
    }
  }

  const updateQty = async (productId, quantity) => {
    const prev = cart
    const nextItems = cart.items.map((l) => (l.product.id === productId ? { ...l, quantity } : l)).filter((l) => l.quantity > 0)
    setCart((c) => ({ ...c, items: nextItems }))
    setCartCount(nextItems.reduce((s, l) => s + l.quantity, 0))
    try {
      const res = await api(`/cart/${productId}`, { method: 'PATCH', body: { quantity } })
      if (res.capped) toast({ type: 'info', title: 'That’s all we have', message: `Only ${res.quantity} in stock.` })
      loadCart()
    } catch (err) {
      setCart(prev)
      setCartCount(prev.items.reduce((s, l) => s + l.quantity, 0))
      toast({ type: 'error', title: 'Couldn’t update your bag', message: err.message })
    }
  }

  const removeFromCart = (productId) => updateQty(productId, 0)

  const clearCart = async () => {
    const prev = cart
    setCart((c) => ({ ...c, items: [] }))
    setCartCount(0)
    try {
      await api('/cart', { method: 'DELETE' })
      loadCart()
    } catch (err) {
      setCart(prev)
      setCartCount(prev.items.reduce((s, l) => s + l.quantity, 0))
      toast({ type: 'error', title: 'Couldn’t clear your bag', message: err.message })
    }
  }

  const applyCoupon = async (code) => {
    const res = await api('/coupons/validate', { method: 'POST', body: { code } })
    setCouponCode(res.coupon.code)
    setCoupon(res.coupon)
    setCart((c) => ({ ...c, totals: res.totals }))
    return res.coupon
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCoupon(null)
    loadCart('')
  }

  // ---- wishlist --------------------------------------------------------
  const isWishlisted = (id) => wishlistIds.includes(id)

  const toggleWishlist = async (product) => {
    if (!user) return requireLogin({ type: 'wishlist', productId: product.id, name: product.name }, 'Sign in to save favourites')
    const adding = !wishlistIds.includes(product.id)
    setWishlistIds((ids) => (adding ? [...ids, product.id] : ids.filter((x) => x !== product.id)))
    try {
      if (adding) await api('/wishlist', { method: 'POST', body: { productId: product.id } })
      else await api(`/wishlist/${product.id}`, { method: 'DELETE' })
      toast({ type: 'wishlist', title: adding ? 'Saved to wishlist' : 'Removed from wishlist', message: product.name })
      return adding
    } catch (err) {
      setWishlistIds((ids) => (adding ? ids.filter((x) => x !== product.id) : [...ids, product.id]))
      toast({ type: 'error', title: 'Couldn’t update your wishlist', message: err.message })
      return !adding
    }
  }

  // ---- orders ----------------------------------------------------------
  const placeOrder = async (payload) => {
    const res = await api('/orders', { method: 'POST', body: { ...payload, couponCode: payload.gift ? undefined : couponCode || undefined } })
    if (!payload.gift) {
      // the cart lines are re-fetched (now empty) by the page after it shows the success screen
      setCouponCode('')
      setCoupon(null)
      setCartCount(0)
    }
    return res
  }

  // ---- finish what the user tapped before signing in --------------------
  const runPendingAction = async () => {
    const pending = readPending()
    writePending(null)
    if (!pending) return null
    const product = { id: pending.productId, name: pending.name }
    if (pending.type === 'wishlist') {
      // after login the session is fresh; only add (never remove) an item the user asked to save
      try {
        await api('/wishlist', { method: 'POST', body: { productId: product.id } })
        setWishlistIds((ids) => (ids.includes(product.id) ? ids : [...ids, product.id]))
        toast({ type: 'wishlist', title: 'Saved to wishlist', message: product.name })
      } catch (err) {
        toast({ type: 'error', title: 'Couldn’t save to wishlist', message: err.message })
      }
    } else if (pending.type === 'cart') {
      try {
        const qty = pending.quantity || 1
        await api('/cart', { method: 'POST', body: { productId: product.id, quantity: qty } })
        setCartCount((n) => n + qty)
        toast({ title: 'Added to cart ✨', message: product.name })
      } catch (err) {
        toast({ type: 'error', title: 'Couldn’t add to cart', message: err.message })
      }
    }
    return pending.returnTo || null
  }

  const value = {
    cart,
    cartCount,
    wishlistIds,
    coupon,
    couponCode,
    loadCart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    isWishlisted,
    placeOrder,
    requireLogin,
    runPendingAction,
  }
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export const useShop = () => useContext(ShopContext)
