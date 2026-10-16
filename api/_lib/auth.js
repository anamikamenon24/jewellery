import { SignJWT, jwtVerify } from 'jose'
import { HttpError } from './http.js'
import { query } from './db.js'

const COOKIE = 'glimmora_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const secret = () => {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new Error('JWT_SECRET is missing or too short')
  return new TextEncoder().encode(s)
}

export function parseCookies(req) {
  if (req.cookies && typeof req.cookies === 'object') return req.cookies
  const out = {}
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

const cookieString = (value, maxAge) =>
  [
    `${COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')

export async function setSession(res, userId) {
  const token = await new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', cookieString(token, MAX_AGE))
}

export const clearSession = (res) => res.setHeader('Set-Cookie', cookieString('', 0))

export async function getUserId(req) {
  const token = parseCookies(req)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    return Number(payload.sub) || null
  } catch {
    return null
  }
}

export async function requireUser(req) {
  const id = await getUserId(req)
  if (!id) throw new HttpError(401, 'Please sign in to continue.')
  const [user] = await query('SELECT id FROM users WHERE id = $1', [id])
  if (!user) throw new HttpError(401, 'Your session has expired. Please sign in again.')
  return id
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.full_name,
  phone: u.phone,
  loyaltyPoints: u.loyalty_points,
  tier: u.tier,
  createdAt: u.created_at,
})
