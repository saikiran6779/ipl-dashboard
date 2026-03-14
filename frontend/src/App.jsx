import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import MatchForm from './pages/MatchForm'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SuperAdminUsers from './pages/SuperAdminUsers'
import SuperAdminTeams from './pages/SuperAdminTeams'
import Teams from './pages/Teams'
import { getMatches, getStats, createMatch, updateMatch, deleteMatch } from './services/api'
import { useAuth } from './context/AuthContext'

// Detect /reset-password?token=... on initial page load
function getInitialView() {
  if (window.location.search.includes('token=')) return 'reset-password'
  return 'dashboard'
}

export default function App() {
  const { isAdmin, isSuperAdmin } = useAuth()

  const [view,      setView]      = useState(getInitialView)
  const [matches,   setMatches]   = useState([])
  const [stats,     setStats]     = useState(null)
  const [editMatch, setEditMatch] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [profileId,      setProfileId]      = useState(null)
  const [teamId,         setTeamId]         = useState(null)
  const [superAdminTab,  setSuperAdminTab]  = useState('users')  // 'users' | 'teams'

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [m, s] = await Promise.all([getMatches(), getStats()])
      setMatches(m)
      setStats(s)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Navigation with guards ─────────────────────────────────────────────────

  const navigate = useCallback((target) => {
    if (target === 'super-admin' && !isSuperAdmin) { setView('dashboard'); return }
    if (target === 'add'         && !isAdmin)       { return }
    if (target === 'teams') setTeamId(null) // nav to grid, not detail
    setView(target)
  }, [isAdmin, isSuperAdmin])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddClick = () => {
    if (!isAdmin) return
    setEditMatch(null)
    setView('add')
  }

  const handleEdit = (match) => {
    if (!isAdmin) return
    setEditMatch(match)
    setView('add')
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return
    if (!window.confirm('Delete this match?')) return
    try {
      await deleteMatch(id)
      toast.success('Match deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete match')
    }
  }

  const handleSubmit = async (payload) => {
    if (!isAdmin) return
    setSaving(true)
    try {
      if (editMatch) {
        await updateMatch(editMatch.id, payload)
        toast.success('Match updated!')
      } else {
        await createMatch(payload)
        toast.success('Match added!')
      }
      setEditMatch(null)
      setView('dashboard')
      fetchAll()
    } catch (err) {
      const detail = err.response?.data?.error || 'Failed to save match'
      toast.error(detail)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => { setEditMatch(null); setView('dashboard') }

  const handleOpenProfile = (playerId) => { setProfileId(playerId); setView('profile') }
  const handleBackFromProfile = () => { setView('players'); setProfileId(null) }

  const handleOpenTeam = (id) => { setTeamId(id); setView('teams') }
  const handleBackFromTeam = () => { setTeamId(null); setView('teams') }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header view={view} setView={navigate} onAddClick={handleAddClick} />

      <main className="page-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>

        {/* Auth pages */}
        {view === 'login'           && <Login           onNavigate={navigate} />}
        {view === 'register'        && <Register        onNavigate={navigate} />}
        {view === 'forgot-password' && <ForgotPassword  onNavigate={navigate} />}
        {view === 'reset-password'  && <ResetPassword   onNavigate={navigate} />}

        {/* Super-admin panel — guarded */}
        {view === 'super-admin' && isSuperAdmin && (
          <div>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
              {[
                { key: 'users', label: '👥 Users' },
                { key: 'teams', label: '🏏 Team Logos' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSuperAdminTab(tab.key)}
                  style={{
                    padding: '8px 18px', border: 'none', cursor: 'pointer',
                    background: 'transparent', fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600, fontSize: 13,
                    color: superAdminTab === tab.key ? '#f97316' : 'var(--text-secondary)',
                    borderBottom: superAdminTab === tab.key ? '2px solid #f97316' : '2px solid transparent',
                    marginBottom: -1, transition: 'color 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {superAdminTab === 'users'  && <SuperAdminUsers />}
            {superAdminTab === 'teams'  && <SuperAdminTeams />}
          </div>
        )}

        {/* Main app views */}
        {view === 'dashboard' && (
          <Dashboard stats={stats} matches={matches} loading={loading} onOpenProfile={handleOpenProfile} onOpenTeam={handleOpenTeam} />
        )}
        {view === 'teams' && (
          <Teams stats={stats} matches={matches} onOpenProfile={handleOpenProfile} initialTeamId={teamId} onBack={handleBackFromTeam} />
        )}
        {view === 'matches' && (
          <Matches matches={matches} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {view === 'add' && isAdmin && (
          <MatchForm editMatch={editMatch} onSubmit={handleSubmit} onCancel={handleCancel} loading={saving} />
        )}
        {view === 'players' && (
          <Players onOpenProfile={handleOpenProfile} />
        )}
        {view === 'profile' && profileId && (
          <PlayerProfile playerId={profileId} onBack={handleBackFromProfile} />
        )}
      </main>
    </div>
  )
}
