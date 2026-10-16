import { handle, toInt } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'

export default handle({
  async DELETE(req) {
    const userId = await requireUser(req)
    const productId = toInt(req.query.productId)
    await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
    return { ok: true, productId }
  },
})
