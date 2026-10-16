import { handle, getBody, HttpError, toInt } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { PRODUCT_SELECT, mapProduct } from '../_lib/catalog.js'

export default handle({
  async GET(req) {
    const userId = await requireUser(req)
    const rows = await query(
      `SELECT prod.* FROM wishlist_items w JOIN (${PRODUCT_SELECT}) prod ON prod.id = w.product_id
       WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
      [userId]
    )
    return { items: rows.map(mapProduct) }
  },

  async POST(req) {
    const userId = await requireUser(req)
    const productId = toInt(getBody(req).productId)
    const [p] = await query('SELECT id FROM products WHERE id = $1', [productId])
    if (!p) throw new HttpError(404, 'That piece no longer exists.')
    await query('INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING', [userId, productId])
    return { ok: true, productId }
  },
})
