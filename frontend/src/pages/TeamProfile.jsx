import { useState, useEffect } from 'react'
import { Spinner, Button, EmptyState } from '../components/UI'
import { getTeam, getSquad } from '../services/api'
import { getTeam as getTeamFallback } from '../services/constants'

const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }

function StatPill({ label, value, color = '#f97316' }) {
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #21262d',
      borderRadius: 10, padding: '12px 18px', textAlign: 'center', minWidth: 80,
    }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function PlayerRow({ player, primary, onOpenProfile }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={() => onOpenProfile && onOpenProfile(player.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 10,
        background: hover ? `${primary}11` : 'transparent',
        cursor: onOpenProfile ? 'pointer' : 'default',
        transition: 'background 0.15s',
        border: `1px solid ${hover ? primary + '33' : 'transparent'}`,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${primary}33, ${primary}11)`,
        border: `1.5px solid ${primary}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {player.profilePictureUrl
          ? <img src={player.profilePictureUrl} alt={player.name}
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: primary }}>
              {player.name.charAt(0)}
            </span>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.name}
        </div>
      </div>

      <div style={{
        fontSize: 10, fontWeight: 700,
        color: ROLE_COLORS[player.role],
        background: ROLE_COLORS[player.role] + '22',
        borderRadius: 4, padding: '2px 7px',
        flexShrink: 0,
      }}>
        {ROLE_LABELS[player.role] || player.role}
      </div>
    </div>
  )
}

export default function TeamProfile({ teamId, onBack, stats, matches, onOpenProfile }) {
  const [team,    setTeam]    = useState(null)
  const [squad,   setSquad]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getTeam(teamId).catch(() => ({ ...getTeamFallback(teamId), primaryColor: getTeamFallback(teamId).color, accentColor: getTeamFallback(teamId).accent })),
      getSquad(teamId).catch(() => []),
    ]).then(([t, s]) => {
      setTeam(t)
      setSquad(s)
    }).finally(() => setLoading(false))
  }, [teamId])

  if (loading) return <Spinner />
  if (!team) return <EmptyState icon="⚠️" text="Team not found" />

  const primary = team.primaryColor || team.color || '#f97316'
  const accent  = team.accentColor  || team.accent || '#fff'

  // derive standing for this team from stats
  const standing = stats?.standings?.find(s => s.teamId === teamId)

  // recent matches for this team (last 5)
  const teamMatches = (matches || [])
    .filter(m => m.team1 === teamId || m.team2 === teamId)
    .slice(0, 5)

  // squad grouped by role
  const byRole = squad.reduce((acc, p) => {
    if (!acc[p.role]) acc[p.role] = []
    acc[p.role].push(p)
    return acc
  }, {})
  const roleOrder = ['BAT', 'WK', 'ALL', 'BOWL']

  return (
    <div>
      {/* ── Team Banner ───────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 18, overflow: 'hidden', marginBottom: 24,
        background: `linear-gradient(135deg, ${primary}cc 0%, ${primary}44 50%, #0d1117 100%)`,
        border: `1px solid ${primary}44`,
        position: 'relative',
      }}>
        {/* noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }} />

        <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
          {/* back button */}
          <Button variant="ghost" onClick={onBack} style={{ marginBottom: 20, fontSize: 12 }}>
            ← All Teams
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Team badge */}
            <div style={{
              width: 80, height: 80, borderRadius: 20, flexShrink: 0,
              background: `linear-gradient(135deg, ${primary}, ${accent}44)`,
              border: `3px solid ${accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${primary}55`,
            }}>
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 28, color: '#fff', letterSpacing: 2,
              }}>{team.id}</span>
            </div>

            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, letterSpacing: 2, color: '#fff', lineHeight: 1, textShadow: `0 0 30px ${primary}` }}>
                {team.name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                {team.city && `📍 ${team.city}`}
                {team.city && team.homeGround && ' · '}
                {team.homeGround && `🏟 ${team.homeGround}`}
              </div>
            </div>
          </div>

          {/* Stats row */}
          {standing && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
              <StatPill label="Points"  value={standing.points}            color={accent.toLowerCase() === '#1b1b1b' ? '#e6edf3' : accent} />
              <StatPill label="Played"  value={standing.played}            color="#8b949e" />
              <StatPill label="Won"     value={standing.won}               color="#22c55e" />
              <StatPill label="Lost"    value={standing.lost}              color="#ef4444" />
              <StatPill label="NRR"     value={standing.nrr?.toFixed(3) ?? '-'} color={standing.nrr >= 0 ? '#22c55e' : '#ef4444'} />
            </div>
          )}
        </div>
      </div>

      {/* ── Body grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: squad.length > 0 ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Squad */}
        {squad.length > 0 && (
          <div style={{
            background: '#161b22', border: '1px solid #21262d',
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #21262d',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Squad</div>
              <div style={{ fontSize: 12, color: '#8b949e' }}>{squad.length} players</div>
            </div>

            <div style={{ padding: '8px 4px' }}>
              {roleOrder.filter(r => byRole[r]).map(role => (
                <div key={role}>
                  <div style={{
                    padding: '6px 14px 2px',
                    fontSize: 10, fontWeight: 700,
                    color: ROLE_COLORS[role],
                    textTransform: 'uppercase', letterSpacing: 1.5,
                  }}>
                    {ROLE_LABELS[role]}s
                  </div>
                  {byRole[role].map(p => (
                    <PlayerRow key={p.id} player={p} primary={primary} onOpenProfile={onOpenProfile} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {squad.length === 0 && (
          <div style={{
            background: '#161b22', border: '1px solid #21262d',
            borderRadius: 14,
          }}>
            <EmptyState icon="👤" text="No squad registered" sub="Add players in the Players page" />
          </div>
        )}

        {/* Recent matches */}
        <div style={{
          background: '#161b22', border: '1px solid #21262d',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #21262d' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Matches</div>
          </div>

          {teamMatches.length === 0 ? (
            <EmptyState icon="📋" text="No matches yet" sub="Matches involving this team appear here" />
          ) : (
            <div>
              {teamMatches.map((m, i) => {
                const isTeam1 = m.team1 === teamId
                const opponentId = isTeam1 ? m.team2 : m.team1
                const won = m.winner === teamId
                const lost = m.winner && m.winner !== teamId

                return (
                  <div key={m.id} style={{
                    padding: '12px 18px',
                    borderTop: i > 0 ? '1px solid #21262d' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: won ? '#22c55e' : lost ? '#ef4444' : '#8b949e',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>
                        vs {opponentId}
                      </div>
                      <div style={{ fontSize: 11, color: '#8b949e' }}>
                        {m.venue?.split(',')[0] || 'Unknown venue'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: won ? '#22c55e' : lost ? '#ef4444' : '#8b949e',
                      }}>
                        {won ? 'WON' : lost ? 'LOST' : 'N/R'}
                      </div>
                      {m.winMargin && (
                        <div style={{ fontSize: 10, color: '#8b949e' }}>
                          by {m.winMargin} {m.winType}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
