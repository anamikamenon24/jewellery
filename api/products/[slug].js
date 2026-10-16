import { handle, HttpError } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { PRODUCT_SELECT, mapProduct } from '../_lib/catalog.js'

export default handle({
  async GET(req) {
    const slug = String(req.query.slug || '')
    const [row] = await query(`${PRODUCT_SELECT} WHERE p.slug = $1`, [slug])
    if (!row) throw new HttpError(404, 'This piece has vanished — it may have been removed.')

    const [details] = await query('SELECT description, care_tips FROM products WHERE id = $1', [row.id])
    const images = await query('SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order', [row.id])
    const reviews = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
      [row.id]
    )
    const related = await query(`${PRODUCT_SELECT} WHERE p.category = $1 AND p.id <> $2 ORDER BY p.is_trending DESC, p.review_count DESC LIMIT 4`, [
      row.category,
      row.id,
    ])

    return {
      product: {
        ...mapProduct(row),
        dealEndsAt: row.deal_ends_at,
        description: details.description,
        careTips: details.care_tips.split(/(?<=\.)\s+/).filter(Boolean),
        images: images.map((i) => i.url),
      },
      reviews: reviews.map((r) => ({ id: r.id, name: r.full_name, rating: r.rating, comment: r.comment, createdAt: r.created_at })),
      related: related.map(mapProduct),
    }
  },
})
