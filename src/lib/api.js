import { useCallback, useEffect, useRef, useState } from 'react'

// All data comes from our own /api functions. The database is never touched from the browser.

export class ApiError extends Error {
  constructor(message, { status = 0, code, fields, ...extra } = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
    this.extra = extra
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('We can’t connect to Glimmora right now. Check your connection and try again.', { code: 'NETWORK' })
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty or non-JSON response */
  }
  if (!res.ok) {
    // No JSON body on a 5xx usually means the API server itself isn't reachable (e.g. not started).
    const unreachable = !data && res.status >= 500
    const fallback = unreachable
      ? 'We can’t reach the jewellery vault right now. Please try again in a moment.'
      : 'Something went wrong. Please try again.'
    throw new ApiError(data?.error || fallback, { status: res.status, ...(unreachable ? { code: 'DB_UNAVAILABLE' } : {}), ...(data || {}) })
  }
  return data
}

// Tiny data-loading hook: const { data, error, loading, reload } = useApi('/home')
export function useApi(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled })
  const ctrl = useRef(null)

  const load = useCallback(async () => {
    if (!path || !enabled) return
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path, { signal: c.signal })
      if (!c.signal.aborted) setState({ data, error: null, loading: false })
    } catch (err) {
      if (err.name !== 'AbortError') setState((s) => ({ ...s, error: err, loading: false }))
    }
  }, [path, enabled])

  useEffect(() => {
    load()
    return () => ctrl.current?.abort()
  }, [load])

  return { ...state, reload: load, setData: (fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })) }
}
