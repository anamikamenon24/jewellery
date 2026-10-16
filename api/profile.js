import { handle } from './_lib/http.js'
import { query } from './_lib/db.js'
import { requireUser, publicUser } from './_lib/auth.js'
import { loyaltyFor } from './_lib/loyalty.js'

export default handle({
  async GET(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const userId = await requireUser(req)
    const [user] = await query('SELECT * FROM users WHERE id = $1', [userId])
    const [stats] = await query(
      `SELECT
         (SELECT count(*)::int FROM orders WHERE user_id = $1 AND status <> 'cancelled') AS order_count,
         (SELECT count(*)::int FROM orders WHERE user_id = $1 AND gift_message IS NOT NULL) AS gift_count,
         (SELECT COALESCE(sum(oi.quantity), 0)::int FROM order_items oi JOIN orders o ON o.id = oi.order_id
            WHERE o.user_id = $1 AND o.status <> 'cancelled') AS pieces,
         (SELECT count(*)::int FROM reviews WHERE user_id = $1) AS review_count,
         (SELECT count(*)::int FROM orders o WHERE o.user_id = $1 AND EXISTS (
            SELECT 1 FROM order_items oi JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = o.id AND p.occasion = 'Festive')) AS festive_orders`,
      [userId]
    )

    // Spend per month for the last 6 months (including empty months)
    const spendRows = await query(
      `SELECT to_char(m, 'Mon') AS month, COALESCE(sum(o.total), 0)::int AS spend
       FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') AS m
       LEFT JOIN orders o ON o.user_id = $1 AND o.status <> 'cancelled' AND date_trunc('month', o.created_at) = m
       GROUP BY m ORDER BY m`,
      [userId]
    )

    const loyalty = loyaltyFor(user.loyalty_points)
    const badges = [
      { id: 'first', name: 'First Sparkle', desc: 'Place your first order', icon: 'Sparkles', earned: stats.order_count >= 1 },
      { id: 'festive', name: 'Festive Queen', desc: '3 festive orders', icon: 'Crown', earned: stats.festive_orders >= 3 },
      { id: 'gifter', name: 'Thoughtful Gifter', desc: 'Send a gift box', icon: 'Gift', earned: stats.gift_count >= 1 },
      { id: 'reviewer', name: 'Trusted Voice', desc: 'Write 5 reviews', icon: 'Star', earned: stats.review_count >= 5 },
      { id: 'collector', name: 'Collector', desc: 'Own 10+ pieces', icon: 'Gem', earned: stats.pieces >= 10 },
      { id: 'diamond', name: 'Diamond Circle', desc: 'Reach Diamond tier', icon: 'Award', earned: loyalty.tier === 'Diamond' },
    ]

    return {
      user: publicUser(user),
      loyalty,
      badges,
      spendHistory: spendRows.map((r) => ({ month: r.month, spend: r.spend })),
      stats: { orders: stats.order_count, pieces: stats.pieces },
    }
  },
})
