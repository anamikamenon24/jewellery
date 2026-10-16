import { handle, getBody, HttpError, toInt } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { loadCartLines, checkCoupon, totalsFor } from '../_lib/catalog.js'

// Cart with server-calculated totals. Pass ?coupon=CODE to include a coupon.
async function cartPayload(userId, couponCode) {
  const items = await loadCartLines(query, userId)
  const base = totalsFor(items)
  let coupon = null
  let couponError = null
  if (couponCode && items.length) {
    try {
      coupon = await checkCoupon(query, couponCode, base.subtotal)
    } catch (err) {
      if (!(err instanceof HttpError)) throw err
      couponError = err.message
    }
  }
  return { items, totals: totalsFor(items, coupon?.discount ?? 0), coupon, couponError }
}

export default handle({
  async GET(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const userId = await requireUser(req)
    return cartPayload(userId, req.query.coupon)
  },

  // Add to cart (increments quantity). Quantity is capped at available stock.
  async POST(req) {
    const userId = await requireUser(req)
    const body = getBody(req)
    const productId = toInt(body.productId)
    const qty = Math.max(1, Math.min(toInt(body.quantity, 1), 20))
    const [p] = await query('SELECT id, name, stock FROM products WHERE id = $1', [productId])
    if (!p) throw new HttpError(404, 'That piece no longer exists.')
    if (p.stock <= 0) throw new HttpError(409, `Sorry, ${p.name} just sold out.`, { code: 'OUT_OF_STOCK' })
    const [row] = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, LEAST($3::int, $4::int))
       ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = LEAST(cart_items.quantity + $3::int, $4::int)
       RETURNING quantity`,
      [userId, productId, qty, p.stock]
    )
    return { ok: true, productId, quantity: row.quantity, capped: row.quantity >= p.stock, stock: p.stock }
  },

  async DELETE(req) {
    const userId = await requireUser(req)
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId])
    return { ok: true }
  },
})
