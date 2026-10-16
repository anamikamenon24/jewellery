// Business constants shared by the frontend and the /api functions.
// Money is always stored in paise (1 rupee = 100 paise).

export const CATEGORIES = ['Earrings', 'Necklaces', 'Rings', 'Bangles', 'Anklets', 'Sets']
export const FINISHES = ['Gold-plated', 'Silver', 'Rose Gold', 'Oxidised', 'Kundan', 'Pearl']
export const OCCASION_IDS = ['Wedding', 'Festive', 'Office', 'Party', 'Everyday']

export const TIERS = [
  { name: 'Silver', min: 0, color: '#C5CAD4' },
  { name: 'Gold', min: 1500, color: '#DDB25A' },
  { name: 'Diamond', min: 3000, color: '#B9E3FF' },
]

export const tierFor = (points) => [...TIERS].reverse().find((t) => points >= t.min).name

export const PACKAGING = [
  { id: 'velvet', name: 'Blush Velvet Box', price: 14900, desc: 'Plush velvet with a gold-foil lid', colors: ['#E06F92', '#F4B4C6'] },
  { id: 'kraft', name: 'Eco Kraft Box', price: 4900, desc: 'Recycled kraft with dried florals', colors: ['#B08968', '#DDB892'] },
  { id: 'luxe', name: 'Midnight Luxe Chest', price: 29900, desc: 'Lacquered chest with LED glow', colors: ['#2A1824', '#DDB25A'] },
]

export const GIFT_MIN = 2
export const GIFT_MAX = 4
export const giftBundleRate = (n) => (n >= 4 ? 0.1 : n === 3 ? 0.05 : 0)

// Percentage discounts are rounded to whole rupees so totals never show paise.
export const percentOff = (paise, percent) => Math.round((paise * percent) / 100 / 100) * 100

export const FREE_SHIPPING_FROM = 49900
export const SHIPPING_FEE = 4900
export const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE)

// 1 loyalty point for every ₹10 spent
export const pointsFor = (totalPaise) => Math.floor(totalPaise / 1000)

export const ORDER_STEPS = [
  { id: 'placed', label: 'Placed' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
]
