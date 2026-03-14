import { useState, useEffect } from 'react'
import { TEAMS, getTeam } from '../services/constants'
import { getSquad, getStats, getMatches } from '../services/api'
import { Spinner, EmptyState } from '../components/UI'

// ── Team Logo (stylized abbreviation badge) ────────────────────────────────
function TeamBadge({ team, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: `linear-gradient(135deg, ${team.color}ee, ${team.color}88)`,
      border: `2px solid ${team.color}`,
      boxShadow: `0 0 20px ${team.color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: size * 0.3,
        color: '#fff',
        letterSpacing: 1,
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}>{team.id}</span>
    </div>
  )
}

// ── Stat Pill ──────────────────────────────────────────────────────────────
function StatPill({ value, label, color = '#f97316' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 26, color, lineHeight: 1,
      }}>{value ?? '—'}</div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Team Card ──────────────────────────────────────────────────────────────
function TeamCard({ team, standing, rank, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isQualified = rank !== null && rank < 4

  return (
    <div
      onClick={() => onClick(team.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${team.color}18, var(--bg-elevated))`
          : 'var(--bg-elevated)',
        border: `1px solid ${hovered ? team.color + '88' : 'var(--border-subtle)'}`,
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 32px ${team.color}22` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: team.color, opacity: hovered ? 0.1 : 0.05,
        filter: 'blur(30px)', pointerEvents: 'none',
        transition: 'opacity 0.25s',
      }} />

      {/* Rank badge */}
      {rank !== null && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: isQualified ? 'rgba(249,115,22,0.15)' : 'var(--bg-subtle)',
          border: `1px solid ${isQualified ? '#f97316' : '#30363d'}`,
          borderRadius: 20, padding: '2px 10px',
          fontSize: 11, fontWeight: 700,
          color: isQualified ? '#f97316' : 'var(--text-secondary)',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 1,
        }}>
          #{rank + 1}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <TeamBadge team={team} size={56} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{team.id}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{team.name}</div>
          {isQualified && (
            <div style={{ fontSize: 10, color: '#f97316', marginTop: 4, fontWeight: 600 }}>
              🏆 Playoff Contender
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, ${team.color}44, transparent)`, marginBottom: 14 }} />

      {/* Stats */}
      {standing ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <StatPill value={standing.played} label="Played" color="var(--text-secondary)" />
          <StatPill value={standing.won} label="Won" color="#22c55e" />
          <StatPill value={standing.lost} label="Lost" color="#ef4444" />
          <StatPill value={standing.points} label="Pts" color={team.color} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, padding: '8px 0' }}>
          No matches yet
        </div>
      )}

      {/* NRR bar */}
      {standing && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>NET RUN RATE</span>
            <span style={{ fontSize: 11, color: standing.nrr >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
              {standing.nrr >= 0 ? '+' : ''}{standing.nrr?.toFixed(3)}
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: standing.nrr >= 0 ? '#22c55e' : '#ef4444',
              width: `${Math.min(100, Math.max(5, ((standing.nrr + 2) / 4) * 100))}%`,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}

      {/* View detail hint */}
      <div style={{
        marginTop: 14, fontSize: 11, color: hovered ? team.color : 'var(--text-secondary)',
        textAlign: 'right', transition: 'color 0.2s', fontWeight: 600,
      }}>
        View Details →
      </div>
    </div>
  )
}

// ── Player Row ─────────────────────────────────────────────────────────────
function PlayerRow({ player, index, onOpenProfile }) {
  const [hovered, setHovered] = useState(false)
  const roleColors = {
    BATSMAN: '#f97316', BOWLER: '#8b5cf6', 'ALL-ROUNDER': '#22c55e',
    'WICKET-KEEPER': '#3b82f6', WK: '#3b82f6',
  }
  const color = roleColors[player.role?.toUpperCase()] || 'var(--text-secondary)'

  return (
    <div
      onClick={() => onOpenProfile && onOpenProfile(player.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        borderTop: index > 0 ? '1px solid var(--border-subtle)' : 'none',
        background: hovered ? 'var(--bg-hover)' : 'transparent',
        cursor: onOpenProfile ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color,
      }}>{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{player.name}</div>
        <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: 1 }}>{player.role}</div>
      </div>
      {player.nationality && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{player.nationality}</div>
      )}
    </div>
  )
}

// ── Team Detail View ───────────────────────────────────────────────────────
function TeamDetail({ teamId, standing, rank, allMatches, onBack, onOpenProfile }) {
  const team = getTeam(teamId)
  const [squad, setSquad] = useState([])
  const [loadingSquad, setLoadingSquad] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setLoadingSquad(true)
    getSquad(teamId)
      .then(setSquad)
      .catch(() => setSquad([]))
      .finally(() => setLoadingSquad(false))
  }, [teamId])

  // Filter matches for this team
  const teamMatches = (allMatches || []).filter(
    m => m.team1 === teamId || m.team2 === teamId
  ).slice(0, 10)

  const isQualified = rank !== null && rank < 4

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'squad', label: `Squad${squad.length ? ` (${squad.length})` : ''}` },
    { id: 'matches', label: `Matches${teamMatches.length ? ` (${teamMatches.length})` : ''}` },
  ]

  return (
    <div className="fade-up">
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 20, padding: '6px 0', fontFamily: 'DM Sans, sans-serif',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        ← Back to Teams
      </button>

      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${team.color}22 0%, var(--bg-elevated) 60%)`,
        border: `1px solid ${team.color}44`,
        borderRadius: 20, padding: '28px 28px',
        marginBottom: 20, position: 'relative', overflow: 'hidden',
      }}>
        {/* Big background text */}
        <div style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 100,
          color: team.color, opacity: 0.07, lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none',
        }}>{team.id}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <TeamBadge team={team} size={80} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: 'var(--text-primary)', letterSpacing: 2, lineHeight: 1 }}>
              {team.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{team.id} · IPL 2025</div>
            {isQualified && (
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#f97316', fontWeight: 600,
              }}>
                🏆 Top 4 · Playoff Qualified
              </div>
            )}
          </div>
          {/* Rank badge */}
          {rank !== null && (
            <div style={{
              textAlign: 'center',
              background: isQualified ? 'rgba(249,115,22,0.1)' : 'var(--bg-subtle)',
              border: `1px solid ${isQualified ? '#f97316' : '#30363d'}`,
              borderRadius: 12, padding: '12px 20px',
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: isQualified ? '#f97316' : 'var(--text-secondary)', lineHeight: 1 }}>
                #{rank + 1}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Rank</div>
            </div>
          )}
        </div>

        {/* Stats row */}
        {standing && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 16, marginTop: 24, paddingTop: 20,
            borderTop: `1px solid ${team.color}22`,
          }}>
            {[
              { value: standing.played, label: 'Matches', color: 'var(--text-secondary)' },
              { value: standing.won, label: 'Won', color: '#22c55e' },
              { value: standing.lost, label: 'Lost', color: '#ef4444' },
              { value: standing.points, label: 'Points', color: team.color },
              { value: `${standing.nrr >= 0 ? '+' : ''}${standing.nrr?.toFixed(3)}`, label: 'NRR', color: standing.nrr >= 0 ? '#22c55e' : '#ef4444' },
              { value: standing.played > 0 ? `${Math.round((standing.won / standing.played) * 100)}%` : '0%', label: 'Win Rate', color: '#3b82f6' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16,
        background: 'var(--bg-elevated)', borderRadius: 10, padding: 4,
        width: 'fit-content', border: '1px solid var(--border-subtle)',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
            background: activeTab === t.id ? `linear-gradient(135deg, ${team.color}, ${team.color}99)` : 'transparent',
            color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {/* Team Identity */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Team Identity</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <TeamBadge team={team} size={52} />
              <div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.2 }}>{team.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {isQualified
                    ? <span style={{ color: '#f97316', fontWeight: 600 }}>🏆 Playoff Contender · Rank #{rank + 1}</span>
                    : `Rank #${rank !== null ? rank + 1 : '—'}`
                  }
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: team.color, boxShadow: `0 2px 8px ${team.color}66` }} title="Primary color" />
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: team.accent, boxShadow: `0 2px 8px ${team.accent}44` }} title="Accent color" />
                </div>
              </div>
            </div>
          </div>

          {/* Season Form */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Season Form</div>
            {teamMatches.length > 0 ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {teamMatches.slice().reverse().map((m, i) => {
                  const won = m.winner === teamId
                  const opp = m.team1 === teamId ? m.team2 : m.team1
                  return (
                    <div key={i} title={`${won ? 'W' : 'L'} vs ${opp}`} style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: won ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      border: `1px solid ${won ? '#22c55e' : '#ef4444'}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: won ? '#22c55e' : '#ef4444',
                    }}>
                      {won ? 'W' : 'L'}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No matches played yet</div>
            )}
          </div>
        </div>
      )}

      {/* Squad tab */}
      {activeTab === 'squad' && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          {loadingSquad ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `3px solid ${team.color}33`, borderTopColor: team.color,
                animation: 'spin 0.7s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : squad.length === 0 ? (
            <EmptyState text="No players registered" sub="Add players to this team from the Players page" />
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Squad</div>
                <div style={{
                  background: `${team.color}22`, border: `1px solid ${team.color}44`,
                  borderRadius: 12, padding: '2px 10px', fontSize: 12, color: team.color, fontWeight: 600,
                }}>{squad.length} players</div>
              </div>
              {squad.map((p, i) => (
                <PlayerRow key={p.id} player={p} index={i} onOpenProfile={onOpenProfile} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Matches tab */}
      {activeTab === 'matches' && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          {teamMatches.length === 0 ? (
            <EmptyState text="No matches yet" sub="This team hasn't played any matches" />
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Matches</div>
              </div>
              {teamMatches.map((m, i) => {
                const opponent = m.team1 === teamId ? m.team2 : m.team1
                const opponentTeam = getTeam(opponent)
                const won = m.winner === teamId
                const myScore = m.team1 === teamId
                  ? `${m.team1Score ?? '—'}${m.team1Wickets != null ? `/${m.team1Wickets}` : ''}${m.team1Overs ? ` (${m.team1Overs})` : ''}`
                  : `${m.team2Score ?? '—'}${m.team2Wickets != null ? `/${m.team2Wickets}` : ''}${m.team2Overs ? ` (${m.team2Overs})` : ''}`
                const oppScore = m.team1 === teamId
                  ? `${m.team2Score ?? '—'}${m.team2Wickets != null ? `/${m.team2Wickets}` : ''}${m.team2Overs ? ` (${m.team2Overs})` : ''}`
                  : `${m.team1Score ?? '—'}${m.team1Wickets != null ? `/${m.team1Wickets}` : ''}${m.team1Overs ? ` (${m.team1Overs})` : ''}`
                return (
                  <div key={m.id} style={{
                    padding: '14px 16px',
                    borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Result badge */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: won ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${won ? '#22c55e' : '#ef4444'}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13,
                      color: won ? '#22c55e' : '#ef4444',
                    }}>{won ? 'W' : 'L'}</div>

                    {/* Match info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: opponentTeam.color }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>vs {opponent}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>· {m.date}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                        {myScore} vs {oppScore}
                      </div>
                    </div>

                    {/* Margin */}
                    {m.winMargin && (
                      <div style={{ fontSize: 11, color: won ? '#22c55e' : '#ef4444', textAlign: 'right' }}>
                        {won ? 'Won' : 'Lost'} by {m.winMargin} {m.winType}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Teams Page ────────────────────────────────────────────────────────
export default function Teams({ stats, matches, onOpenProfile, initialTeamId }) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || null)
  const [loading, setLoading] = useState(false)

  // Build standings map for quick lookup
  const standingsMap = {}
  const rankMap = {}
  if (stats?.standings) {
    stats.standings.forEach((s, i) => {
      standingsMap[s.teamId] = s
      rankMap[s.teamId] = i
    })
  }

  const handleSelectTeam = (teamId) => setSelectedTeamId(teamId)
  const handleBack = () => setSelectedTeamId(null)

  // If a team is selected, show detail view
  if (selectedTeamId) {
    return (
      <TeamDetail
        teamId={selectedTeamId}
        standing={standingsMap[selectedTeamId] || null}
        rank={rankMap[selectedTeamId] ?? null}
        allMatches={matches}
        onBack={handleBack}
        onOpenProfile={onOpenProfile}
      />
    )
  }

  return (
    <div className="fade-up">
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: 'var(--text-primary)', lineHeight: 1 }}>
          IPL Teams
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          All 10 teams · Click to view squad, stats & recent form
        </div>
      </div>

      {/* Team cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {TEAMS.map((team) => {
          const standing = standingsMap[team.id] || null
          const rank = rankMap[team.id] ?? null
          return (
            <TeamCard
              key={team.id}
              team={team}
              standing={standing}
              rank={rank}
              onClick={handleSelectTeam}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 20, padding: '10px 16px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
        width: 'fit-content',
      }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: '#f97316' }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Top 4 teams advance to playoffs</span>
      </div>
    </div>
  )
}
