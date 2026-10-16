import { handle } from './_lib/http.js'
import { query } from './_lib/db.js'

export default handle({
  async GET(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    const [row] = await query(`
      SELECT
        (SELECT count(*)::int FROM users) AS customers,
        (SELECT count(*)::int FROM orders WHERE status = 'delivered') AS delivered,
        (SELECT count(*)::int FROM products WHERE is_new AND created_at >= now() - interval '7 days') AS new_this_week,
        (SELECT COALESCE(sum(review_count), 0)::int FROM products) AS total_reviews,
        (SELECT COALESCE(round(sum(rating * review_count) / NULLIF(sum(review_count), 0), 1), 0)::float8 FROM products) AS avg_rating,
        (SELECT COALESCE(max(round((1 - price::float8 / NULLIF(compare_at_price, 0)) * 100)), 0)::int FROM products) AS max_discount`)
    return {
      customers: row.customers,
      ordersDelivered: row.delivered,
      newArrivalsThisWeek: row.new_this_week,
      totalReviews: row.total_reviews,
      avgRating: row.avg_rating,
      maxDiscount: row.max_discount,
    }
  },
})
