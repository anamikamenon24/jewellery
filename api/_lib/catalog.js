// Product queries + the single source of truth for prices, coupons and order totals.
import { HttpError } from './http.js'
import { shippingFor, percentOff } from '../../shared/constants.js'

// Every product row comes with its active deal (if any) and its first image.
export const PRODUCT_SELECT = `
  SELECT p.id, p.slug, p.name, p.category, p.finish, p.occasion, p.price, p.compare_at_price, p.stock,
         p.rating::float8 AS rating, p.review_count, p.is_trending, p.is_new, p.created_at,
         d.deal_price, d.ends_at AS deal_ends_at,
         COALESCE(d.deal_price, p.price) AS effective_price,
         (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image
  FROM products p
  LEFT JOIN LATERAL (
    SELECT deal_price, ends_at FROM deals
    WHERE product_id = p.id AND now() BETWEEN starts_at AND ends_at
    ORDER BY ends_at LIMIT 1
  ) d ON true`

export function mapProduct(r) {
  const price = r.effective_price ?? r.price
  const compareAt = r.compare_at_price ?? r.price
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    finish: r.finish,
    occasion: r.occasion,
    price,
    regularPrice: r.price,
    compareAtPrice: compareAt,
    discount: compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0,
    onDeal: r.deal_price != null,
    stock: r.stock,
    rating: Number(r.rating),
    reviewCount: r.review_count,
    isTrending: r.is_trending,
    isNew: r.is_new,
    image: r.image,
    createdAt: r.created_at,
  }
}

// Cart lines for a user, priced on the server.
export async function loadCartLines(q, userId) {
  const rows = await q(
    `SELECT c.quantity, prod.* FROM cart_items c
     JOIN (${PRODUCT_SELECT}) prod ON prod.id = c.product_id
     WHERE c.user_id = $1 ORDER BY c.created_at, c.id`,
    [userId]
  )
  return rows.map((r) => ({ quantity: r.quantity, product: mapProduct(r) }))
}

const fmt = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`

// Throws a friendly HttpError when the code can't be used.
export async function checkCoupon(q, rawCode, subtotal) {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) throw new HttpError(400, 'Enter a coupon code first.')
  const [c] = await q('SELECT * FROM coupons WHERE upper(code) = $1', [code])
  if (!c || !c.is_active) throw new HttpError(404, `Hmm, “${code}” isn’t a valid code. Check the spelling and try again.`, { reason: 'invalid' })
  if (c.expires_at && new Date(c.expires_at) < new Date()) {
    const when = new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    throw new HttpError(410, `Sorry, ${code} expired on ${when}. Try WELCOME10 instead.`, { reason: 'expired' })
  }
  if (subtotal < c.min_order) {
    throw new HttpError(422, `Add ${fmt(c.min_order - subtotal)} more to use ${code} (minimum order ${fmt(c.min_order)}).`, { reason: 'minimum' })
  }
  const discount = c.discount_type === 'percent' ? percentOff(subtotal, c.discount_value) : c.discount_value
  return {
    code,
    discount: Math.min(discount, subtotal),
    label: c.discount_type === 'percent' ? `${c.discount_value}% off your order` : `${fmt(c.discount_value)} off`,
  }
}

export function totalsFor(lines, discount = 0, extraFee = 0) {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0)
  const compareAtTotal = lines.reduce((s, l) => s + l.product.compareAtPrice * l.quantity, 0)
  const shipping = shippingFor(subtotal) + extraFee
  return {
    subtotal,
    compareAtTotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  }
}
