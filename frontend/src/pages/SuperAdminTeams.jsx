import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTeams, getSquad, updateTeamLogo, updateTeamCaptain } from '../services/api'
import { Spinner, PlayerCombobox } from '../components/UI'

/* ─── small sub-component: the logo preview box ─────────────────────────── */
function LogoPreview({ logoUrl, teamId, imgError, onError }) {
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 12,
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={teamId}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
          onError={onError}
        />
      ) : (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 1 }}>
          {teamId}
        </span>
      )}
    </div>
  )
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function SuperAdminTeams() {
  const [teams,      setTeams]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [logoUrls,   setLogoUrls]   = useState({})
  const [captainIds, setCaptainIds] = useState({})
  const [squads,     setSquads]     = useState({})
  const [busy,       setBusy]       = useState(null)
  const [imgErrors,  setImgErrors]  = useState({})

  useEffect(() => {
    getTeams()
      .then(data => {
        setTeams(data)
        const initLogos    = {}
        const initCaptains = {}
        data.forEach(t => {
          initLogos[t.id]    = t.logoUrl   ?? ''
          initCaptains[t.id] = t.captainId ?? null
        })
        setLogoUrls(initLogos)
        setCaptainIds(initCaptains)
        Promise.all(
          data.map(t =>
            getSquad(t.id)
              .then(sq => ({ id: t.id, sq }))
              .catch(() => ({ id: t.id, sq: [] }))
          )
        ).then(results => {
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
    const t = teams.find(x => x.id === teamId)
    if (!t) return false
    return (logoUrls[teamId] ?? '') !== (t.logoUrl ?? '') ||
           (captainIds[teamId] ?? null) !== (t.captainId ?? null)
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
          color: '#f97316', letterSpacing: 2, lineHeight: 1,
        }}>
          Team Management
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Configure logo and default captain for each franchise.
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Spinner />
        </div>
      ) : (
        /* ── Responsive 2-column card grid ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {teams.map(team => {
            const dirty    = isDirty(team.id)
            const isBusy   = busy === team.id
            const logoUrl  = logoUrls[team.id] ?? ''
            const captain  = captainIds[team.id] ?? null

            return (
              <div
                key={team.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'border-color 0.15s',
                  ...(dirty ? { borderColor: 'rgba(249,115,22,0.45)' } : {}),
                }}
              >
                {/* Card header: logo + team identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <LogoPreview
                    logoUrl={team.logoUrl}
                    teamId={team.id}
                    imgError={imgErrors[team.id]}
                    onError={() => setImgErrors(prev => ({ ...prev, [team.id]: true }))}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)', fontSize: 15,
                      color: 'var(--text-primary)', letterSpacing: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {team.name}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--text-secondary)',
                      marginTop: 2, fontWeight: 600, letterSpacing: 0.5,
                    }}>
                      {team.id}
                    </div>
                  </div>
                </div>

                {/* ── Identity section ── */}
                <Section title="Identity">
                  <FieldRow label="Logo URL">
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={e => setLogoUrls(prev => ({ ...prev, [team.id]: e.target.value }))}
                      style={{
                        width: '100%', padding: '7px 10px',
                        borderRadius: 7, fontSize: 12,
                        border: '1px solid var(--border-input)',
                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                        outline: 'none', fontFamily: 'monospace',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#f97316')}
                      onBlur={e =>  (e.target.style.borderColor = 'var(--border-input)')}
                    />
                  </FieldRow>

                  <FieldRow label="Default captain">
                    <PlayerCombobox
                      players={squads[team.id] || []}
                      value={captain}
                      onChange={id => setCaptainIds(prev => ({ ...prev, [team.id]: id }))}
                      placeholder={squads[team.id] ? 'Type to search…' : 'Loading squad…'}
                    />
                    {team.captainName && captain === (team.captainId ?? null) && (
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
                        Current: {team.captainName}
                      </div>
                    )}
                  </FieldRow>
                </Section>

                {/* Save button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={() => handleSave(team.id)}
                    disabled={isBusy || !dirty}
                    style={{
                      padding: '8px 20px', borderRadius: 8,
                      border: '1px solid transparent',
                      background: dirty ? '#f97316' : 'var(--bg-subtle)',
                      color:      dirty ? '#fff'    : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: 13,
                      cursor: dirty ? 'pointer' : 'default',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                      opacity: isBusy ? 0.6 : 1,
                    }}
                  >
                    {isBusy ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Layout helpers ─────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
        color: 'var(--text-secondary)', textTransform: 'uppercase',
        marginBottom: 10, paddingBottom: 6,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 5,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
