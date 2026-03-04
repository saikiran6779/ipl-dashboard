import { useState } from 'react'
import { Card, CardHeader, TeamChip, StatBar, EmptyState, Spinner, Button } from '../components/UI'
import { getTeam } from '../services/constants'

const TABS = [
  { id: 'standings', label: '🏆 Standings' },
  { id: 'batting',   label: '🏏 Batting' },
  { id: 'bowling',   label: '⚡ Bowling' },
  { id: 'mom',       label: '⭐ MOM' },
]

export default function Dashboard({ stats, matches, loading }) {
  const [tab, setTab] = useState('standings')

  if (loading) return <Spinner />

  const summaryCards = [
    { label: 'Matches Played', value: stats?.totalMatches ?? 0,    icon: '🏟️', color: '#3b82f6' },
    { label: 'Total Runs',     value: (stats?.totalRuns ?? 0).toLocaleString(), icon: '🏏', color: '#f97316' },
    { label: 'Highest Score',  value: stats?.highestScore || '—',  icon: '🔥', color: '#ef4444' },
    { label: 'Teams Active',   value: stats?.teamsActive ?? 0,     icon: '🛡️', color: '#8b5cf6' },
  ]

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {summaryCards.map((s, i) => (
          <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.07}s`, background: '#161b22', border: '1px solid #21262d', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: s.color, letterSpacing: 1, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#161b22', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid #21262d' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
            background: tab === t.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'transparent',
            color: tab === t.id ? '#fff' : '#8b949e', transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Standings */}
      {tab === 'standings' && (
        <Card>
          <CardHeader title="Points Table" subtitle="2025 Season" />
          {!stats?.standings?.length ? <EmptyState text="No matches yet" sub='Add matches to see standings' /> : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#0d1117' }}>
                      {['#', 'Team', 'P', 'W', 'L', 'Pts', 'NRR'].map((h, i) => (
                        <th key={i} style={{ padding: '10px 16px', textAlign: i > 1 ? 'center' : 'left', color: '#8b949e', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.standings.map((row, i) => {
                      const team = getTeam(row.teamId)
                      return (
                        <tr key={row.teamId} style={{ borderTop: '1px solid #21262d', transition: 'background 0.15s', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px', color: i < 4 ? '#f97316' : '#8b949e', fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 6, height: 28, borderRadius: 3, background: team.color, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 700 }}>{row.teamId}</div>
                                <div style={{ fontSize: 10, color: '#8b949e' }}>{row.teamName}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#8b949e' }}>{row.played}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{row.won}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>{row.lost}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ background: i < 4 ? 'rgba(249,115,22,0.15)' : 'transparent', color: i < 4 ? '#f97316' : '#e6edf3', fontWeight: 800, padding: '3px 10px', borderRadius: 6, fontSize: 14 }}>
                              {row.points}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: row.nrr >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                            {row.nrr >= 0 ? '+' : ''}{row.nrr?.toFixed(3)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #21262d', fontSize: 11, color: '#8b949e' }}>🟠 Top 4 qualify for playoffs</div>
            </>
          )}
        </Card>
      )}

      {/* Batting */}
      {tab === 'batting' && (
        <Card>
          <CardHeader title="Orange Cap Race 🟠" />
          {!stats?.topBatters?.length ? <EmptyState text="No batting data yet" sub="Fill in top scorer when adding matches" /> : (
            <div style={{ padding: '12px 0' }}>
              {stats.topBatters.map((p, i) => (
                <StatBar key={i} rank={i} name={p.name} value={p.totalRuns} label="runs" max={stats.topBatters[0].totalRuns} color="#f97316" />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Bowling */}
      {tab === 'bowling' && (
        <Card>
          <CardHeader title="Purple Cap Race 🟣" />
          {!stats?.topBowlers?.length ? <EmptyState text="No bowling data yet" sub="Fill in top wicket taker when adding matches" /> : (
            <div style={{ padding: '12px 0' }}>
              {stats.topBowlers.map((p, i) => (
                <StatBar key={i} rank={i} name={p.name} value={p.totalWickets} label="wickets" max={stats.topBowlers[0].totalWickets} color="#8b5cf6" />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MOM */}
      {tab === 'mom' && (
        <Card>
          <CardHeader title="Man of the Match ⭐" />
          {!stats?.topMom?.length ? <EmptyState text="No MOM data yet" sub="Fill in player of the match when adding matches" /> : (
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
              {stats.topMom.map((p, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{i === 0 ? '🌟' : '⭐'}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, wordBreak: 'break-word' }}>{p.name}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#f97316', lineHeight: 1 }}>{p.awards}</div>
                  <div style={{ fontSize: 10, color: '#8b949e' }}>award{p.awards > 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recent Results */}
      {matches?.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <CardHeader title="Recent Results" subtitle={`Last ${Math.min(5, matches.length)} matches`} />
          <div>
            {matches.slice(0, 5).map((m, i) => (
              <div key={m.id} style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #21262d' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 11, color: '#8b949e', minWidth: 60, textAlign: 'center' }}>
                  {m.matchNo ? <div>M{m.matchNo}</div> : null}
                  <div>{m.date}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <TeamChip teamId={m.team1} score={m.team1Score} wickets={m.team1Wickets} overs={m.team1Overs} won={m.winner === m.team1} />
                  <span style={{ color: '#8b949e', fontWeight: 700, fontSize: 12, padding: '0 4px' }}>VS</span>
                  <TeamChip teamId={m.team2} score={m.team2Score} wickets={m.team2Wickets} overs={m.team2Overs} won={m.winner === m.team2} />
                </div>
                <div style={{ fontSize: 11, textAlign: 'right', minWidth: 110 }}>
                  <div style={{ fontWeight: 700, color: '#f97316' }}>{m.winner} won</div>
                  {m.winMargin && <div style={{ color: '#8b949e' }}>by {m.winMargin} {m.winType}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
