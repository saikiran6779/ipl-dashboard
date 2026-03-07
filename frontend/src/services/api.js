import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: `${API_BASE}/api` })

// ── Matches ────────────────────────────────────────────────────────────────
export const getMatches  = ()           => api.get('/matches').then(r => r.data)
export const getMatch    = (id)         => api.get(`/matches/${id}`).then(r => r.data)
export const createMatch = (data)       => api.post('/matches', data).then(r => r.data)
export const updateMatch = (id, data)   => api.put(`/matches/${id}`, data).then(r => r.data)
export const deleteMatch = (id)         => api.delete(`/matches/${id}`)

// ── Stats ──────────────────────────────────────────────────────────────────
export const getStats = ()              => api.get('/stats').then(r => r.data)

// ── Players ────────────────────────────────────────────────────────────────
export const getPlayers   = ()         => api.get('/players').then(r => r.data)
export const getSquad     = (teamId)   => api.get(`/teams/${teamId}/squad`).then(r => r.data)
export const createPlayer = (data)     => api.post('/players', data).then(r => r.data)
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data).then(r => r.data)
export const deletePlayer = (id)       => api.delete(`/players/${id}`)
export const getProfile   = (id)       => api.get(`/players/${id}/profile`).then(r => r.data)

// ── Scorecards ─────────────────────────────────────────────────────────────
export const getScorecard  = (matchId)       => api.get(`/matches/${matchId}/scorecard`).then(r => r.data)
export const saveScorecard = (matchId, data) => api.post(`/matches/${matchId}/scorecard`, data).then(r => r.data)

// ── Leaderboards ───────────────────────────────────────────────────────────
export const getTopBatters = ()              => api.get('/leaderboard/batting').then(r => r.data)
export const getTopBowlers = ()              => api.get('/leaderboard/bowling').then(r => r.data)

export default api