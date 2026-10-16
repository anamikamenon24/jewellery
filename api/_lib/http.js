// Helpers shared by /api functions. Handlers use the Vercel Node signature (req, res),
// which the local Express dev server also provides.

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

const DB_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '08006', '08001', '3D000', '28P01'])

const isDbDown = (err) =>
  DB_ERROR_CODES.has(err?.code) ||
  /connect|websocket|fetch failed|database .* does not exist|pglite/i.test(err?.message || '') ||
  /relation .* does not exist/i.test(err?.message || '')

export function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'Invalid JSON body')
    }
  }
  return {}
}

// Wrap a map of { GET, POST, ... } handlers with method routing and friendly errors.
export function handle(methods) {
  return async (req, res) => {
    const fn = methods[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '))
      return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
      const result = await fn(req, res)
      if (!res.headersSent) res.status(200).json(result ?? { ok: true })
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, ...err.extra })
      console.error(`[api] ${req.method} ${req.url}`, err)
      if (isDbDown(err)) {
        return res.status(503).json({
          error: 'We can’t reach the jewellery vault right now. Please try again in a moment.',
          code: 'DB_UNAVAILABLE',
        })
      }
      res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  }
}

export const toInt = (v, fallback = 0) => {
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}
