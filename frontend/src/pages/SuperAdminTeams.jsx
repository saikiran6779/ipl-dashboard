import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTeams, getSquad, updateTeamLogo, updateTeamCaptain } from '../services/api'
import { Card, CardHeader, Spinner, PlayerCombobox } from '../components/UI'

export default function SuperAdminTeams() {
  const [teams,   setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  // logoUrls: { [teamId]: string } — tracks draft values before saving
  const [logoUrls,   setLogoUrls]   = useState({})
  const [captainIds, setCaptainIds] = useState({})  // draft captainId per team
  const [squads,     setSquads]     = useState({})  // players per team for combobox
  const [busy,       setBusy]       = useState(null)   // teamId being saved
  const [imgErrors,  setImgErrors]  = useState({})     // teamIds whose preview failed

  useEffect(() => {
    getTeams()
      .then(data => {
        setTeams(data)
        // seed draft values from current DB values
        const initLogos    = {}
        const initCaptains = {}
        data.forEach(t => {
          initLogos[t.id]    = t.logoUrl    ?? ''
          initCaptains[t.id] = t.captainId  ?? null
        })
        setLogoUrls(initLogos)
        setCaptainIds(initCaptains)
        // Load squad for each team in parallel
        Promise.all(data.map(t => getSquad(t.id).then(sq => ({ id: t.id, sq })).catch(() => ({ id: t.id, sq: [] }))))
          .then(results => {
            const map = {}
            results.forEach(({ id, sq }) => { map[id] = sq })
            setSquads(map)
          })
      })
      .catch(() => toast.error('Failed to load teams'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (teamId) => {
    setBusy(teamId)
    try {
      await Promise.all([
        updateTeamLogo(teamId, logoUrls[teamId]),
        updateTeamCaptain(teamId, captainIds[teamId] ?? null),
      ])
      toast.success(`${teamId} updated`)
      // reflect saved values back into teams list
      const newCaptain = (squads[teamId] || []).find(p => p.id === captainIds[teamId]) || null
      setTeams(prev => prev.map(t => t.id === teamId ? {
        ...t,
        logoUrl:     logoUrls[teamId] || null,
        captainId:   captainIds[teamId] ?? null,
        captainName: newCaptain?.name ?? null,
      } : t))
      setImgErrors(prev => ({ ...prev, [teamId]: false }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update team')
    } finally {
      setBusy(null)
    }
  }

  const isDirty = (teamId) => {
    const logoChanged    = (logoUrls[teamId]    ?? '') !== (teams.find(t => t.id === teamId)?.logoUrl    ?? '')
    const captainChanged = (captainIds[teamId]  ?? null) !== (teams.find(t => t.id === teamId)?.captainId ?? null)
    return logoChanged || captainChanged
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: '#f97316', letterSpacing: 2, lineHeight: 1 }}>
          Team Settings
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Set logo URL and default captain for each team.
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <CardHeader title={`Teams (${teams.length})`} subtitle="Update logo URL and captain, then click Save" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {teams.map((team, i) => (
              <div
                key={team.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 80px 1fr 1fr auto',
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
                    border: `1px solid var(--border-input)`,
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    outline: 'none', fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#f97316')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-input)')}
                />

                {/* Captain combobox */}
                <div>
                  <PlayerCombobox
                    players={squads[team.id] || []}
                    value={captainIds[team.id] ?? null}
                    onChange={id => setCaptainIds(prev => ({ ...prev, [team.id]: id }))}
                    placeholder="Select captain…"
                  />
                  {team.captainName && (captainIds[team.id] ?? null) === (team.captainId ?? null) && (
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3, paddingLeft: 2 }}>
                      Current: {team.captainName}
                    </div>
                  )}
                </div>

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
                    fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
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
