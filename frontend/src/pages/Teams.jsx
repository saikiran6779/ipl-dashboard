import { useState, useEffect } from 'react'
import { Spinner } from '../components/UI'
import { getTeams } from '../services/api'
import { TEAMS as FALLBACK_TEAMS } from '../services/constants'

function TeamCard({ team, onClick }) {
  const [hover, setHover] = useState(false)
  const primary = team.primaryColor || team.color || '#444'
  const accent  = team.accentColor  || team.accent || '#fff'

  return (
    <div
      className="fade-up"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${hover ? primary + 'aa' : '#21262d'}`,
        transition: 'all 0.2s',
        transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? `0 8px 32px ${primary}33` : 'none',
        background: '#161b22',
        position: 'relative',
      }}
    >
      {/* colored top band */}
      <div style={{
        height: 6,
        background: `linear-gradient(90deg, ${primary}, ${accent})`,
      }} />

      {/* card body */}
      <div style={{ padding: '20px 20px 16px' }}>

        {/* Team abbreviation badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 14, marginBottom: 14,
          background: `linear-gradient(135deg, ${primary}33, ${primary}11)`,
          border: `2px solid ${primary}55`,
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22, color: primary, letterSpacing: 1,
          }}>{team.id}</span>
        </div>

        <div style={{ fontWeight: 800, fontSize: 15, color: '#e6edf3', marginBottom: 4, lineHeight: 1.3 }}>
          {team.name}
        </div>

        {team.city && (
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 12 }}>
            📍 {team.city}
          </div>
        )}

        {team.homeGround && (
          <div style={{
            fontSize: 11, color: '#8b949e',
            background: '#0d1117', borderRadius: 6,
            padding: '5px 8px', marginTop: 4,
            borderLeft: `3px solid ${primary}`,
          }}>
            🏟 {team.homeGround}
          </div>
        )}
      </div>

      {/* hover chevron */}
      <div style={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        color: primary, fontSize: 18, opacity: hover ? 0.8 : 0,
        transition: 'opacity 0.2s',
      }}>›</div>
    </div>
  )
}

export default function Teams({ onOpenTeam }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setTeams(FALLBACK_TEAMS.map(t => ({
        ...t,
        primaryColor: t.color,
        accentColor: t.accent,
      }))))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: '#e6edf3', lineHeight: 1 }}>
          IPL Teams 2025
        </div>
        <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
          {teams.length} franchises · Click a team to view squad &amp; stats
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 16,
      }}>
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onClick={() => onOpenTeam(team.id)} />
        ))}
      </div>
    </div>
  )
}
