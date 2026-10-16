import { handle } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { getUserId, publicUser, clearSession } from '../_lib/auth.js'

// Returns the signed-in user (or null) plus the small bits the navbar needs.
export default handle({
  async GET(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const id = await getUserId(req)
    if (!id) return { user: null }
    const [user] = await query('SELECT * FROM users WHERE id = $1', [id])
    if (!user) {
      clearSession(res)
      return { user: null }
    }
    const [{ n }] = await query('SELECT COALESCE(sum(quantity), 0)::int AS n FROM cart_items WHERE user_id = $1', [id])
    const wish = await query('SELECT product_id FROM wishlist_items WHERE user_id = $1', [id])
    return { user: publicUser(user), cartCount: n, wishlistIds: wish.map((w) => w.product_id) }
  },
})
