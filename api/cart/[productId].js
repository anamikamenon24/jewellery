import { handle, getBody, HttpError, toInt } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'

export default handle({
  // Set an exact quantity (0 removes the line). Capped at available stock.
  async PATCH(req) {
    const userId = await requireUser(req)
    const productId = toInt(req.query.productId)
    const qty = toInt(getBody(req).quantity, 1)
    if (qty <= 0) {
      await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
      return { ok: true, productId, quantity: 0 }
    }
    const [p] = await query('SELECT stock, name FROM products WHERE id = $1', [productId])
    if (!p) throw new HttpError(404, 'That piece no longer exists.')
    const quantity = Math.min(qty, p.stock)
    if (quantity <= 0) throw new HttpError(409, `Sorry, ${p.name} just sold out.`, { code: 'OUT_OF_STOCK' })
    const rows = await query('UPDATE cart_items SET quantity = $3 WHERE user_id = $1 AND product_id = $2 RETURNING quantity', [userId, productId, quantity])
    if (!rows.length) throw new HttpError(404, 'That item is no longer in your bag.')
    return { ok: true, productId, quantity, capped: quantity < qty }
  },

  async DELETE(req) {
    const userId = await requireUser(req)
    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, toInt(req.query.productId)])
    return { ok: true }
  },
})
