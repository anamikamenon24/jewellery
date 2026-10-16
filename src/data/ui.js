// Visual configuration only. All products, prices, orders and users come from the /api functions.
export { CATEGORIES, FINISHES, TIERS, PACKAGING, GIFT_MIN, GIFT_MAX, giftBundleRate, ORDER_STEPS } from '../../shared/constants.js'

// Metal + accent colours used by the SVG jewellery art and finish swatches
export const FINISH_STYLES = {
  'Gold-plated': { light: '#F6DFA0', mid: '#DDB25A', dark: '#9C6F22', swatch: 'linear-gradient(135deg,#F6DFA0,#C8973C)' },
  Silver: { light: '#F4F6FA', mid: '#C5CAD4', dark: '#7D8494', swatch: 'linear-gradient(135deg,#F4F6FA,#9AA0AE)' },
  'Rose Gold': { light: '#FAD3C6', mid: '#E2A08C', dark: '#A8604E', swatch: 'linear-gradient(135deg,#FAD3C6,#C27A68)' },
  Oxidised: { light: '#B9BEC4', mid: '#7F858D', dark: '#3E4248', swatch: 'linear-gradient(135deg,#B9BEC4,#4A4E55)' },
  Kundan: { light: '#FBE7B0', mid: '#D9A945', dark: '#8E6418', swatch: 'linear-gradient(135deg,#FBE7B0,#C0392B 60%,#1E8449)' },
  Pearl: { light: '#FFFDF8', mid: '#EFE6D8', dark: '#B9A98E', swatch: 'linear-gradient(135deg,#FFFFFF,#E9DFCF)' },
}

export const OCCASIONS = [
  { id: 'Wedding', label: 'Wedding', blurb: 'Heirloom-worthy statements', gradient: 'from-[#5b1a33] via-[#9c3d5e] to-[#d4a24c]', icon: 'Crown' },
  { id: 'Festive', label: 'Festive', blurb: 'Kundan, jhumkas & glow', gradient: 'from-[#5a2a0a] via-[#b0612a] to-[#ebcb7e]', icon: 'Flame' },
  { id: 'Office', label: 'Office', blurb: 'Minimal, polished, daily', gradient: 'from-[#2a2a3a] via-[#5a5a78] to-[#c5cad4]', icon: 'Briefcase' },
  { id: 'Party', label: 'Party', blurb: 'Bold shine after dark', gradient: 'from-[#2b0f3a] via-[#7b2d7a] to-[#ee93ad]', icon: 'PartyPopper' },
  { id: 'Everyday', label: 'Everyday', blurb: 'Light, lovely, all-day', gradient: 'from-[#3a2430] via-[#9a6273] to-[#f4b4c6]', icon: 'Sun' },
]

// Price-range filter chips (paise)
export const PRICE_RANGES = [
  { id: 'all', label: 'Any price', min: 0, max: 0 },
  { id: 'u500', label: 'Under ₹500', min: 0, max: 49900 },
  { id: '500-1000', label: '₹500 – ₹1,000', min: 50000, max: 100000 },
  { id: '1000-2000', label: '₹1,000 – ₹2,000', min: 100000, max: 200000 },
  { id: '2000+', label: '₹2,000+', min: 200000, max: 0 },
]

export const STYLE_TIPS = [
  'Pair statement jhumkas with a sleek bun — let the earrings do the talking.',
  'Layer three chains of different lengths: 16", 18" and 20" for the perfect cascade.',
  'Mixing metals is in! Anchor rose gold and silver with one neutral piece.',
  'Wear oxidised silver with pastels for a soft boho contrast.',
  'Store each piece in a zip pouch to keep the plating bright for longer.',
  'A single pearl stud elevates even a plain white tee.',
  'Stack thin rings on the index and middle fingers for an effortless look.',
]

export const WHATSAPP_NUMBER = '919999999999'
