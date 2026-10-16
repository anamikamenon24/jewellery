import { handle, getBody, HttpError } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { loadCartLines, checkCoupon, totalsFor } from '../_lib/catalog.js'

// Validates a coupon against the user's CURRENT server-side cart.
export default handle({
  async POST(req) {
    const userId = await requireUser(req)
    const items = await loadCartLines(query, userId)
    if (!items.length) throw new HttpError(400, 'Add something to your bag before using a coupon.')
    const { subtotal } = totalsFor(items)
    const coupon = await checkCoupon(query, getBody(req).code, subtotal)
    return { coupon, totals: totalsFor(items, coupon.discount) }
  },
})
