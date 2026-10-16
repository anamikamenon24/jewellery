import { handle } from './_lib/http.js'
import { query } from './_lib/db.js'
import { getUserId } from './_lib/auth.js'
import { PRODUCT_SELECT, mapProduct } from './_lib/catalog.js'
import { loyaltyFor } from './_lib/loyalty.js'

export default handle({
  async GET(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const [dealRow] = await query(
      `SELECT prod.*, d.ends_at AS ends_at, d.deal_price AS dp FROM deals d
       JOIN (${PRODUCT_SELECT}) prod ON prod.id = d.product_id
       WHERE now() BETWEEN d.starts_at AND d.ends_at
       ORDER BY d.ends_at LIMIT 1`
    )
    const trending = await query(`${PRODUCT_SELECT} WHERE p.is_trending ORDER BY p.review_count DESC LIMIT 12`)
    const occasionRows = await query('SELECT occasion, count(*)::int AS n FROM products GROUP BY occasion')

    let loyalty = null
    const userId = await getUserId(req)
    if (userId) {
      const [u] = await query('SELECT full_name, loyalty_points FROM users WHERE id = $1', [userId])
      if (u) loyalty = { ...loyaltyFor(u.loyalty_points), firstName: u.full_name.split(' ')[0] }
    }

    return {
      deal: dealRow ? { product: mapProduct(dealRow), dealPrice: dealRow.dp, endsAt: dealRow.ends_at } : null,
      trending: trending.map(mapProduct),
      occasionCounts: Object.fromEntries(occasionRows.map((r) => [r.occasion, r.n])),
      loyalty,
    }
  },
})
