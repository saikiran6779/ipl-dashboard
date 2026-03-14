import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTeams, updateTeamLogo } from '../services/api'
import { Card, CardHeader, Spinner } from '../components/UI'

export default function SuperAdminTeams() {
  const [teams,   setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  // logoUrls: { [teamId]: string } — tracks draft values before saving
  const [logoUrls,   setLogoUrls]   = useState({})
  const [busy,       setBusy]       = useState(null)   // teamId being saved
  const [imgErrors,  setImgErrors]  = useState({})     // teamIds whose preview failed

  useEffect(() => {
    getTeams()
      .then(data => {
        setTeams(data)
        // seed draft values from current DB values
        const initial = {}
        data.forEach(t => { initial[t.id] = t.logoUrl ?? '' })
        setLogoUrls(initial)
      })
      .catch(() => toast.error('Failed to load teams'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (teamId) => {
    setBusy(teamId)
    try {
      await updateTeamLogo(teamId, logoUrls[teamId])
      toast.success(`${teamId} logo updated`)
      // reflect saved value back into teams list and clear any prior load error
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, logoUrl: logoUrls[teamId] || null } : t))
      setImgErrors(prev => ({ ...prev, [teamId]: false }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update logo')
    } finally {
      setBusy(null)
    }
  }

  const isDirty = (teamId) => (logoUrls[teamId] ?? '') !== (teams.find(t => t.id === teamId)?.logoUrl ?? '')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f97316', letterSpacing: 2, lineHeight: 1 }}>
          Team Logos
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Set or update the logo image URL for each team.
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <CardHeader title={`Teams (${teams.length})`} subtitle="Paste a public image URL and click Save" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {teams.map((team, i) => (
              <div
                key={team.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 80px 1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Logo preview */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {team.logoUrl && !imgErrors[team.id] ? (
                    <img
                      src={team.logoUrl}
                      alt={team.id}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={() => setImgErrors(prev => ({ ...prev, [team.id]: true }))}
                    />
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{team.id}</span>
                  )}
                </div>

                {/* Team ID + name */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{team.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{team.name}</div>
                </div>

                {/* URL input */}
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrls[team.id] ?? ''}
                  onChange={e => setLogoUrls(prev => ({ ...prev, [team.id]: e.target.value }))}
                  style={{
                    width: '100%', padding: '7px 10px',
                    borderRadius: 7, fontSize: 12,
                    border: `1px solid ${isDirty(team.id) ? 'rgba(249,115,22,0.5)' : 'var(--border-input)'}`,
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    outline: 'none', fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#f97316')}
                  onBlur={e => (e.target.style.borderColor = isDirty(team.id) ? 'rgba(249,115,22,0.5)' : 'var(--border-input)')}
                />

                {/* Save button */}
                <button
                  onClick={() => handleSave(team.id)}
                  disabled={busy === team.id || !isDirty(team.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 7,
                    border: '1px solid transparent',
                    background: isDirty(team.id) ? '#f97316' : 'var(--bg-subtle)',
                    color:      isDirty(team.id) ? '#fff'    : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 12, cursor: isDirty(team.id) ? 'pointer' : 'default',
                    fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                    transition: 'all 0.15s', opacity: busy === team.id ? 0.6 : 1,
                  }}
                >
                  {busy === team.id ? 'Saving…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
