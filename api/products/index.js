import { handle, toInt } from '../_lib/http.js'
import { query } from '../_lib/db.js'
import { PRODUCT_SELECT, mapProduct } from '../_lib/catalog.js'
import { CATEGORIES, FINISHES, OCCASION_IDS } from '../../shared/constants.js'

const SORTS = {
  bestsellers: 'prod.review_count DESC, prod.id',
  newest: 'prod.created_at DESC, prod.id',
  price_asc: 'prod.effective_price ASC, prod.id',
  price_desc: 'prod.effective_price DESC, prod.id',
  discount: '(prod.compare_at_price - prod.effective_price)::float / NULLIF(prod.compare_at_price, 0) DESC NULLS LAST, prod.id',
  rating: 'prod.rating DESC, prod.review_count DESC, prod.id',
}

export default handle({
  async GET(req) {
    const { category, finish, occasion, q, sort = 'bestsellers' } = req.query
    const minPrice = toInt(req.query.minPrice, 0) // paise
    const maxPrice = toInt(req.query.maxPrice, 0) // paise, 0 = no max
    const limit = Math.min(Math.max(toInt(req.query.limit, 12), 1), 48)
    const page = Math.max(toInt(req.query.page, 1), 1)

    const where = []
    const params = []
    const add = (sql, value) => {
      params.push(value)
      where.push(sql.replace('?', `$${params.length}`))
    }
    if (CATEGORIES.includes(category)) add('prod.category = ?', category)
    if (FINISHES.includes(finish)) add('prod.finish = ?', finish)
    if (OCCASION_IDS.includes(occasion)) add('prod.occasion = ?', occasion)
    if (minPrice > 0) add('prod.effective_price >= ?', minPrice)
    if (maxPrice > 0) add('prod.effective_price <= ?', maxPrice)
    if (q && String(q).trim()) add("(prod.name || ' ' || prod.category || ' ' || prod.finish || ' ' || prod.occasion) ILIKE ?", `%${String(q).trim().slice(0, 60)}%`)

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const base = `FROM (${PRODUCT_SELECT}) prod ${whereSql}`
    const [{ total }] = await query(`SELECT count(*)::int AS total ${base}`, params)
    const rows = await query(
      `SELECT prod.* ${base} ORDER BY ${SORTS[sort] || SORTS.bestsellers} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params
    )
    return { items: rows.map(mapProduct), total, page, limit, hasMore: page * limit < total }
  },
})
