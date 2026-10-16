import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState({ cartCount: 0, wishlistIds: [] })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [loggedOut, setLoggedOut] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await api('/auth/me')
      setUser(data.user)
      if (data.user) setLoggedOut(false)
      setSession({ cartCount: data.cartCount || 0, wishlistIds: data.wishlistIds || [] })
      setError(null)
      return data.user
    } catch (err) {
      setError(err)
      return null
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email, password) => {
    await api('/auth/login', { method: 'POST', body: { email, password } })
    return refresh()
  }

  const signup = async (form) => {
    await api('/auth/signup', { method: 'POST', body: form })
    return refresh()
  }

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    setLoggedOut(true)
    setUser(null)
    setSession({ cartCount: 0, wishlistIds: [] })
  }

  return <AuthContext.Provider value={{ user, ready, error, loggedOut, session, setSession, refresh, login, signup, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
