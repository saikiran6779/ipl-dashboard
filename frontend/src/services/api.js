import axios from 'axios'
import { TOKEN_KEY, REFRESH_KEY } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: `${API_BASE}/api` })

// ── Request interceptor: attach access token ──────────────────────────────────

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────

let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config

    // Skip refresh for auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      const storedRefresh = localStorage.getItem(REFRESH_KEY)
      if (!storedRefresh) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refreshToken: storedRefresh,
        })
        localStorage.setItem(TOKEN_KEY,   data.accessToken)
        localStorage.setItem(REFRESH_KEY, data.refreshToken)
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
        processQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        localStorage.removeItem('ipl_user')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginUser        = (data)          => api.post('/auth/login',           data).then(r => r.data)
export const registerUser     = (data)          => api.post('/auth/register',        data).then(r => r.data)
export const logoutUser       = ()              => api.post('/auth/logout')
export const refreshToken     = (token)         => api.post('/auth/refresh',         { refreshToken: token }).then(r => r.data)
export const forgotPassword   = (data)          => api.post('/auth/forgot-password', data).then(r => r.data)
export const resetPassword    = (data)          => api.post('/auth/reset-password',  data).then(r => r.data)

// ── Super-admin ───────────────────────────────────────────────────────────────

export const getAllUsers   = ()        => api.get('/super-admin/users').then(r => r.data)
export const promoteUser  = (userId)  => api.put(`/super-admin/users/${userId}/promote`).then(r => r.data)
export const demoteUser   = (userId)  => api.put(`/super-admin/users/${userId}/demote`).then(r => r.data)

// ── Venues ────────────────────────────────────────────────────────────────────

export const getVenues      = ()             => api.get('/venues').then(r => r.data)
export const createVenue    = (data)         => api.post('/venues', data).then(r => r.data)
export const updateVenue    = (id, data)     => api.put(`/venues/${id}`, data).then(r => r.data)
export const deleteVenue    = (id)           => api.delete(`/venues/${id}`)

// ── Teams ─────────────────────────────────────────────────────────────────────

export const getTeams       = ()             => api.get('/teams').then(r => r.data)

// ── Matches ───────────────────────────────────────────────────────────────────

export const getMatches  = ()           => api.get('/matches').then(r => r.data)
export const getMatch    = (id)         => api.get(`/matches/${id}`).then(r => r.data)
export const createMatch = (data)       => api.post('/matches', data).then(r => r.data)
export const updateMatch = (id, data)   => api.put(`/matches/${id}`, data).then(r => r.data)
export const deleteMatch = (id)         => api.delete(`/matches/${id}`)

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getStats = ()              => api.get('/stats').then(r => r.data)

// ── Players ───────────────────────────────────────────────────────────────────

export const getPlayers   = ()         => api.get('/players').then(r => r.data)
export const getSquad     = (teamId)   => api.get(`/teams/${teamId}/squad`).then(r => r.data)
export const createPlayer = (data)     => api.post('/players', data).then(r => r.data)
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data).then(r => r.data)
export const deletePlayer = (id)       => api.delete(`/players/${id}`)
export const getProfile   = (id)       => api.get(`/players/${id}/profile`).then(r => r.data)

// ── Scorecards ────────────────────────────────────────────────────────────────

export const getScorecard  = (matchId)       => api.get(`/matches/${matchId}/scorecard`).then(r => r.data)
export const saveScorecard = (matchId, data) => api.post(`/matches/${matchId}/scorecard`, data).then(r => r.data)

// ── Leaderboards ──────────────────────────────────────────────────────────────

export const getTopBatters = ()              => api.get('/leaderboard/batting').then(r => r.data)
export const getTopBowlers = ()              => api.get('/leaderboard/bowling').then(r => r.data)

export default api
