import { randomInt } from 'node:crypto'
import { handle, getBody, HttpError, toInt } from '../_lib/http.js'
import { query, tx } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { PRODUCT_SELECT, mapProduct, checkCoupon, totalsFor } from '../_lib/catalog.js'
import { PACKAGING, GIFT_MIN, GIFT_MAX, giftBundleRate, percentOff, pointsFor, tierFor } from '../../shared/constants.js'

function validateShipping(body) {
  const s = body.shipping || {}
  const name = String(s.name || '').trim()
  const phone = String(s.phone || '').replace(/\D/g, '').slice(-10)
  const address = String(s.address || '').trim()
  const pincode = String(s.pincode || '').trim()
  const fields = {}
  if (name.length < 2) fields.name = 'Tell us who to deliver to.'
  if (!/^[6-9]\d{9}$/.test(phone)) fields.phone = 'Enter a valid 10-digit mobile number.'
  if (address.length < 10) fields.address = 'Please add your full address.'
  if (!/^[1-9]\d{5}$/.test(pincode)) fields.pincode = '6-digit pincode, please.'
  if (Object.keys(fields).length) throw new HttpError(400, 'Please check your delivery details.', { fields })
  const payment = body.paymentMethod === 'card' ? 'card' : body.paymentMethod === 'cod' ? 'cod' : null
  if (!payment) throw new HttpError(400, 'Choose a payment method.')
  return { name, phone, address: `${address} - ${pincode}`, payment }
}

export default handle({
  // Order history for the signed-in user only.
  async GET(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    const userId = await requireUser(req)
    const orders = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id DESC', [userId])
    const items = orders.length
      ? await query(
          `SELECT oi.*, p.slug, p.category, p.finish,
                  (SELECT url FROM product_images i WHERE i.product_id = oi.product_id ORDER BY sort_order LIMIT 1) AS image
           FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
           WHERE oi.order_id = ANY($1::int[]) ORDER BY oi.id`,
          [orders.map((o) => o.id)]
        )
      : []
    return {
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        subtotal: o.subtotal,
        discount: o.discount,
        shippingFee: o.shipping_fee,
        total: o.total,
        couponCode: o.coupon_code,
        paymentMethod: o.payment_method,
        giftMessage: o.gift_message,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: items
          .filter((i) => i.order_id === o.id)
          .map((i) => ({ productId: i.product_id, slug: i.slug, name: i.product_name, unitPrice: i.unit_price, quantity: i.quantity, category: i.category, finish: i.finish, image: i.image })),
      })),
    }
  },

  // Place an order from the cart, or a gift box ({ gift: { productIds, packaging, message } }).
  // The browser only sends WHAT to buy; every price and total is recalculated here.
  async POST(req) {
    const userId = await requireUser(req)
    const body = getBody(req)
    const ship = validateShipping(body)
    const gift = body.gift || null

    const result = await tx(async (q) => {
      // 1. Work out the requested lines
      let wanted
      if (gift) {
        const ids = [...new Set((gift.productIds || []).map((x) => toInt(x)).filter(Boolean))]
        if (ids.length < GIFT_MIN || ids.length > GIFT_MAX) throw new HttpError(400, `A gift box needs ${GIFT_MIN}–${GIFT_MAX} different pieces.`)
        wanted = ids.map((id) => ({ productId: id, quantity: 1 }))
      } else {
        wanted = (await q('SELECT product_id, quantity FROM cart_items WHERE user_id = $1 ORDER BY id', [userId])).map((r) => ({
          productId: r.product_id,
          quantity: r.quantity,
        }))
        if (!wanted.length) throw new HttpError(400, 'Your bag is empty.')
      }

      // 2. Lock the products and check stock
      const ids = wanted.map((w) => w.productId)
      const stockRows = await q('SELECT id, name, stock FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE', [ids])
      for (const w of wanted) {
        const p = stockRows.find((r) => r.id === w.productId)
        if (!p) throw new HttpError(409, 'One of the pieces is no longer available.', { code: 'OUT_OF_STOCK' })
        if (p.stock < w.quantity) {
          const msg = p.stock === 0 ? `Sorry — ${p.name} just sold out.` : `Only ${p.stock} left of ${p.name}. Please reduce the quantity.`
          throw new HttpError(409, msg, { code: 'OUT_OF_STOCK', productId: p.id, productName: p.name, available: p.stock })
        }
      }

      // 3. Price everything on the server (includes live deals)
      const priced = await q(`${PRODUCT_SELECT} WHERE p.id = ANY($1::int[])`, [ids])
      const lines = wanted.map((w) => ({ quantity: w.quantity, product: mapProduct(priced.find((r) => r.id === w.productId)) }))
      const base = totalsFor(lines)

      let discount = 0
      let couponCode = null
      let extraFee = 0
      let giftMessage = null
      if (gift) {
        const pack = PACKAGING.find((p) => p.id === gift.packaging) || PACKAGING[0]
        discount = percentOff(base.subtotal, giftBundleRate(lines.length) * 100)
        extraFee = pack.price
        const to = String(gift.to || '').trim().slice(0, 30)
        const msg = String(gift.message || '').trim().slice(0, 140)
        giftMessage = `${to ? `To ${to}: ` : ''}${msg || 'With love'} (Packed in ${pack.name})`
      } else if (body.couponCode) {
        const coupon = await checkCoupon(q, body.couponCode, base.subtotal)
        discount = coupon.discount
        couponCode = coupon.code
      }
      const totals = totalsFor(lines, discount, extraFee)

      // 4. Create the order + items, reduce stock, clear cart, add loyalty points
      let order
      for (let attempt = 0; attempt < 5 && !order; attempt++) {
        const orderNumber = `GLM-${randomInt(100000, 999999)}`
        ;[order] = await q(
          `INSERT INTO orders (user_id, order_number, subtotal, discount, shipping_fee, total, coupon_code, payment_method,
                               shipping_name, shipping_phone, shipping_address, gift_message)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (order_number) DO NOTHING RETURNING *`,
          [userId, orderNumber, totals.subtotal, totals.discount, totals.shipping, totals.total, couponCode, ship.payment, ship.name, ship.phone, ship.address, giftMessage]
        )
      }
      if (!order) throw new Error('Could not allocate an order number')

      for (const l of lines) {
        await q('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES ($1,$2,$3,$4,$5)', [
          order.id,
          l.product.id,
          l.product.name,
          l.product.price,
          l.quantity,
        ])
        await q('UPDATE products SET stock = stock - $2 WHERE id = $1', [l.product.id, l.quantity])
      }
      if (!gift) await q('DELETE FROM cart_items WHERE user_id = $1', [userId])

      const earned = pointsFor(totals.total)
      const [u] = await q('UPDATE users SET loyalty_points = loyalty_points + $2 WHERE id = $1 RETURNING loyalty_points', [userId, earned])
      await q('UPDATE users SET tier = $2 WHERE id = $1', [userId, tierFor(u.loyalty_points)])

      return { order, earned, points: u.loyalty_points }
    })

    const o = result.order
    return {
      order: { id: o.id, orderNumber: o.order_number, status: o.status, total: o.total, paymentMethod: o.payment_method, createdAt: o.created_at },
      pointsEarned: result.earned,
      loyaltyPoints: result.points,
    }
  },
})
