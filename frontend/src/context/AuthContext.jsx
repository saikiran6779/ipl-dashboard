import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, logoutUser, refreshToken } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY   = 'ipl_access_token'
const REFRESH_KEY = 'ipl_refresh_token'
const USER_KEY    = 'ipl_user'

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [loading,    setLoading]    = useState(false)
  const [authAction, setAuthAction] = useState(null) // 'login' | 'logout' | 'register' | null

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
    setAuthAction('login')
    try {
      const data = await loginUser({ email, password })
      persist(data)
      // Brief pause to show the "Welcome" animation
      await new Promise(r => setTimeout(r, 800))
      return data
    } finally {
      setLoading(false)
      setAuthAction(null)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setAuthAction('register')
    try {
      const data = await registerUser({ name, email, password })
      persist(data)
      await new Promise(r => setTimeout(r, 800))
      return data
    } finally {
      setLoading(false)
      setAuthAction(null)
    }
  }

  const logout = async () => {
    setAuthAction('logout')
    await new Promise(r => setTimeout(r, 100)) // Let state flush
    try { await logoutUser() } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 600)) // Show logout animation
    clear()
    setAuthAction(null)
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
    <AuthContext.Provider value={{ user, loading, authAction, login, register, logout, doRefresh, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { TOKEN_KEY, REFRESH_KEY }
