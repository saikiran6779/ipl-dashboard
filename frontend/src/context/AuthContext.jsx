import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, logoutUser, refreshToken } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY   = 'ipl_access_token'
const REFRESH_KEY = 'ipl_refresh_token'
const USER_KEY    = 'ipl_user'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const persist = (data) => {
    localStorage.setItem(TOKEN_KEY,   data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    localStorage.setItem(USER_KEY,    JSON.stringify(data.user))
    setUser(data.user)
  }

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginUser({ email, password })
      persist(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const data = await registerUser({ name, email, password })
      persist(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await logoutUser() } catch { /* ignore */ }
    clear()
  }

  // Called by Axios interceptor on 401
  const doRefresh = useCallback(async () => {
    const storedRefresh = localStorage.getItem(REFRESH_KEY)
    if (!storedRefresh) { clear(); return null }
    try {
      const data = await refreshToken(storedRefresh)
      persist(data)
      return data.accessToken
    } catch {
      clear()
      return null
    }
  }, [])

  // ── Role helpers ──────────────────────────────────────────────────────────

  const isAdmin      = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, doRefresh, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { TOKEN_KEY, REFRESH_KEY }
