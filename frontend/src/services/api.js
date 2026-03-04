import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Matches ────────────────────────────────────────────────────────────────
export const getMatches = ()            => api.get('/matches').then(r => r.data)
export const getMatch   = (id)          => api.get(`/matches/${id}`).then(r => r.data)
export const createMatch = (data)       => api.post('/matches', data).then(r => r.data)
export const updateMatch = (id, data)   => api.put(`/matches/${id}`, data).then(r => r.data)
export const deleteMatch = (id)         => api.delete(`/matches/${id}`)

// ── Stats ──────────────────────────────────────────────────────────────────
export const getStats = ()              => api.get('/stats').then(r => r.data)

export default api
