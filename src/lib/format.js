// Money arrives from the API in paise (₹1 = 100 paise).
export const formatINR = (paise) => {
  const rupees = Number(paise || 0) / 100
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export const formatDate = (iso, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-GB', opts)

export const firstName = (name = '') => name.trim().split(/\s+/)[0] || ''

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
