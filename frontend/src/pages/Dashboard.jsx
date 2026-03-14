import { useState, useEffect, useRef, Fragment } from 'react'
import { Card, CardHeader, EmptyState, Spinner, TeamLogo } from '../components/UI'
import { getTeam, formatDate } from '../services/constants'
import { Trophy, Flame, Zap, Star, Medal, MapPin, Activity, Shield, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'standings', label: 'Standings',  Icon: Trophy },
  { id: 'batting',   label: 'Orange Cap', Icon: Flame },
  { id: 'bowling',   label: 'Purple Cap', Icon: Zap },
  { id: 'mom',       label: 'MOM',        Icon: Star },
]

// ── Count-up hook ─────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target || isNaN(target)) { setValue(target); return }
    const num = parseFloat(String(target).replace(/,/g, ''))
    if (isNaN(num)) { setValue(target); return }
    const start = performance.now()
    const frame = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * num))
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [target, duration])
  return typeof target === 'string' && isNaN(parseFloat(target)) ? target : value.toLocaleString()
}

// ── Summary Card ──────────────────────────────────────────────────────────
function SummaryCard({ label, value, Icon, color, delay }) {
  const display = useCountUp(typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')))
  return (
    <div className="fade-up" style={{
      animationDelay: `${delay}s`, position: 'relative', overflow: 'hidden',
      background: 'var(--bg-card)', border: `1px solid var(--border)`,
      borderRadius: 16, padding: '20px 22px',
      transition: 'border-color 0.3s, transform 0.25s, box-shadow 0.3s', cursor: 'default',
      backdropFilter: 'blur(8px)',
      boxShadow: 'var(--shadow-card)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + 'aa'
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%',
        background: color, opacity: 0.1, filter: 'blur(28px)', pointerEvents: 'none' }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 10, marginBottom: 12,
        background: `${color}18`, border: `1px solid ${color}33`,
        color,
      }}>
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        color, letterSpacing: 1, lineHeight: 1,
      }}>
        {display}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8, fontWeight: 700,
      }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}66, ${color}00)` }} />
    </div>
  )
}

// ── Form guide (last N results for a team from matches list) ──────────────
function computeForm(matches, teamId, count = 5) {
  return (matches || [])
    .filter(m => (m.team1 === teamId || m.team2 === teamId) && (m.winner || m.noResult))
    .slice(-count)
    .map(m => m.noResult ? 'NR' : m.winner === teamId ? 'W' : 'L')
}

// ── NRR display ───────────────────────────────────────────────────────────
function NRRCell({ nrr }) {
  const clamped = Math.max(-2, Math.min(2, nrr ?? 0))
  const pct = ((clamped + 2) / 4) * 100
  const color = nrr >= 0 ? '#22c55e' : '#ef4444'
  const sign = nrr >= 0 ? '+' : ''
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color,
        fontWeight: 700, letterSpacing: 0.5,
      }}>
        {sign}{nrr?.toFixed(3)}
      </span>
      <div style={{ width: 56, height: 4, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-subtle)' }} />
        <div style={{
          position: 'absolute',
          left: nrr >= 0 ? '50%' : `${pct}%`,
          width: nrr >= 0 ? `${pct - 50}%` : `${50 - pct}%`,
          height: '100%', background: color,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  )
}

// ── Medal helper ──────────────────────────────────────────────────────────
const MEDAL_COLORS = ['#F59E0B', '#9CA3AF', '#D97706']

function RankMedal({ rank }) {
  if (rank >= 3) return null
  return <Medal size={28} strokeWidth={1.5} color={MEDAL_COLORS[rank]} />
}

// ── Enhanced Stat Bar ─────────────────────────────────────────────────────
function EnhancedStatBar({ rank, name, value, label, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const isTop3 = rank < 3
  return (
    <div style={{ padding: '12px 20px', borderTop: rank > 0 ? '1px solid var(--border-subtle)' : 'none',
      transition: 'background 0.15s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 28, textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isTop3
            ? <RankMedal rank={rank} />
            : <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 700,
              }}>{rank + 1}</span>
          }
        </div>
        <div style={{
          flex: 1,
          fontFamily: 'var(--font-body)',
          fontWeight: 600, fontSize: 'var(--text-base)', color: isTop3 ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)', color, lineHeight: 1,
          }}>{value}</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginLeft: 4,
          }}>{label}</span>
        </div>
      </div>
      <div style={{ marginLeft: 40, height: 6, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 4,
          background: rank === 0
            ? `linear-gradient(90deg, ${color}, #fff8)`
            : rank === 1 ? `linear-gradient(90deg, ${color}cc, ${color}44)`
              : `linear-gradient(90deg, ${color}88, ${color}22)`,
          transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: rank === 0 ? `0 0 8px ${color}88` : 'none',
        }} />
      </div>
      {rank === 0 && (
        <div style={{
          marginLeft: 40, marginTop: 4,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', color: `${color}bb`,
        }}>
          Leading the chart
        </div>
      )}
    </div>
  )
}

// ── MOM Podium ────────────────────────────────────────────────────────────
function MOMPodium({ players }) {
  if (!players?.length) return null
  const podium = [players[1], players[0], players[2]].filter(Boolean)
  const heights = [80, 110, 60]
  const labels = ['2nd', '1st', '3rd']
  const glows = ['#94a3b8', '#f97316', '#cd7f32']
  const podiumIcons = [
    <Medal size={28} strokeWidth={1.5} color="#9CA3AF" />,
    <Trophy size={20} strokeWidth={1.8} color="#f59e0b" />,
    <Medal size={28} strokeWidth={1.5} color="#D97706" />,
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, padding: '24px 16px 0', marginBottom: 8 }}>
      {podium.map((p, idx) => (
        <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, maxWidth: 130 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{podiumIcons[idx]}</div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700, fontSize: 'var(--text-sm)', textAlign: 'center',
            color: idx === 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
            wordBreak: 'break-word', lineHeight: 1.3,
          }}>{p.name}</div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)', color: glows[idx], lineHeight: 1,
          }}>{p.awards}</div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
          }}>award{p.awards > 1 ? 's' : ''}</div>
          <div style={{ width: '100%', height: heights[idx], borderRadius: '6px 6px 0 0',
            background: idx === 1 ? `linear-gradient(180deg, ${glows[idx]}33, ${glows[idx]}11)` : 'var(--bg-elevated)',
            border: `1px solid ${glows[idx]}44`, borderBottom: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            color: glows[idx],
            boxShadow: idx === 1 ? `0 -4px 20px ${glows[idx]}22` : 'none',
          }}>{labels[idx]}</div>
        </div>
      ))}
    </div>
  )
}

// ── Column header helper ──────────────────────────────────────────────────
const TH = ({ children, align = 'center', width }) => (
  <th style={{
    padding: '10px 12px', textAlign: align,
    color: 'var(--text-secondary)', fontWeight: 700,
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    textTransform: 'uppercase', letterSpacing: 1.5, whiteSpace: 'nowrap',
    width, background: 'var(--bg-subtle)',
    borderBottom: '2px solid var(--border-subtle)',
  }}>{children}</th>
)

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard({ stats, matches, loading, onOpenTeam }) {
  const [tab, setTab] = useState('standings')
  const [prevTab, setPrevTab] = useState(null)

  if (loading) return <Spinner />

  const summaryCards = [
    { label: 'Matches Played', value: stats?.totalMatches ?? 0,   Icon: MapPin,    color: '#3b82f6' },
    { label: 'Total Runs',     value: stats?.totalRuns ?? 0,       Icon: Activity,  color: '#f97316' },
    { label: 'Highest Score',  value: stats?.highestScore || '—',  Icon: Flame,     color: '#ef4444' },
    { label: 'Teams Active',   value: stats?.teamsActive ?? 0,     Icon: Shield,    color: '#8b5cf6' },
  ]

  const handleTab = (id) => { setPrevTab(tab); setTab(id) }

  return (
    <div>
      {/* Summary cards */}
      <div className="summary-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        {summaryCards.map((s, i) => <SummaryCard key={i} {...s} delay={i * 0.07} />)}
      </div>

      {/* Tabs */}
      <div className="tabs-scroll" style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--bg-elevated)', borderRadius: 12, padding: 4,
        width: 'fit-content', border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)', fontWeight: 600,
            background: tab === t.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <t.Icon size={16} strokeWidth={1.8} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Standings */}
      {tab === 'standings' && (
        <Card className="fade-up">
          {/* Header */}
          <div style={{
            padding: '16px 20px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: 'var(--text-primary)', letterSpacing: 1.5 }}>Points Table</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>IPL 2025 Season</div>
            </div>
            <Trophy size={24} strokeWidth={1.5} color="#f97316" />
          </div>

          {!stats?.standings?.length
            ? <EmptyState text="No matches yet" sub="Add matches to see standings" />
            : <>
              {/* Column headers — borderLeft: 4px transparent aligns with data rows */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 36px 36px 36px 36px 62px 100px',
                alignItems: 'center',
                padding: '7px 16px 7px 12px',
                borderLeft: '4px solid transparent',
                borderBottom: '2px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
              }}>
                {[
                  { label: '#',    align: 'center' },
                  { label: 'Team', align: 'left'   },
                  { label: 'P',    align: 'center' },
                  { label: 'W',    align: 'center' },
                  { label: 'L',    align: 'center' },
                  { label: 'NR',   align: 'center' },
                  { label: 'Pts',  align: 'center' },
                  { label: 'NRR',  align: 'center' },
                ].map(({ label, align }) => (
                  <div key={label} style={{
                    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1.5,
                    color: 'var(--text-muted)', textAlign: align,
                  }}>{label}</div>
                ))}
              </div>

              {/* Data rows */}
              {stats.standings.map((row, i) => {
                const team     = getTeam(row.teamId)
                const isPO     = i < 4
                const form     = computeForm(matches, row.teamId)
                const winPct   = row.played > 0 ? row.won / row.played : 0
                const nrrVal   = row.nrr ?? 0
                const nrrColor = nrrVal >= 0 ? '#22c55e' : '#ef4444'
                const nrrSign  = nrrVal >= 0 ? '+' : ''
                const nrrClamp = Math.max(-2, Math.min(2, nrrVal))
                const nrrPct   = ((nrrClamp + 2) / 4) * 100

                return (
                  <Fragment key={row.teamId}>
                    {/* Playoff cutoff divider between rank 4 and 5 */}
                    {i === 4 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '5px 20px',
                        borderTop: '1px solid var(--border-subtle)',
                        borderLeft: '4px solid transparent',
                      }}>
                        <div style={{ flex: 1, borderTop: '1px dashed rgba(249,115,22,0.45)' }} />
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                          color: 'rgba(249,115,22,0.75)', letterSpacing: 1.5,
                          textTransform: 'uppercase', flexShrink: 0,
                        }}>Playoff Cutoff</span>
                        <div style={{ flex: 1, borderTop: '1px dashed rgba(249,115,22,0.45)' }} />
                      </div>
                    )}

                    <div
                      onClick={() => onOpenTeam && onOpenTeam(row.teamId)}
                      title={`View ${row.teamName}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 36px 36px 36px 36px 62px 100px',
                        alignItems: 'center',
                        padding: '11px 16px 11px 12px',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                        borderLeft: `4px solid ${isPO ? team.color : 'transparent'}`,
                        background: isPO ? `${team.color}05` : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s, border-left-color 0.2s',
                        animation: `fadeUp 0.35s ease ${i * 0.045}s both`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isPO ? `${team.color}14` : 'var(--bg-hover)'
                        if (!isPO) e.currentTarget.style.borderLeftColor = `${team.color}90`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isPO ? `${team.color}05` : 'transparent'
                        if (!isPO) e.currentTarget.style.borderLeftColor = 'transparent'
                      }}
                    >
                      {/* Rank */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
                          color: isPO ? team.color : 'var(--text-secondary)',
                          fontWeight: 700, lineHeight: 1,
                        }}>{i + 1}</span>
                      </div>

                      {/* Team: logo + name + form dots + win bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingRight: 8 }}>
                        <TeamLogo teamId={row.teamId} size={32} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)',
                              color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1,
                            }}>{row.teamId}</span>
                            {form.length > 0 && (
                              <div style={{ display: 'flex', gap: 3 }}>
                                {form.map((r, j) => (
                                  <div key={j} title={r} style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: r === 'W' ? '#22c55e' : r === 'L' ? '#ef4444' : '#6b7280',
                                  }} />
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-body)', fontSize: 11,
                            color: 'var(--text-muted)', marginTop: 3,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{row.teamName}</div>
                          {row.played > 0 && (
                            <div style={{ width: '80%', maxWidth: 160, height: 2, background: 'var(--bg-subtle)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                              <div style={{
                                width: `${winPct * 100}%`, height: '100%', borderRadius: 2,
                                background: `linear-gradient(90deg, ${team.color}, ${team.color}66)`,
                                transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                              }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* P */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.played}</span>
                      </div>
                      {/* W */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: '#22c55e', lineHeight: 1 }}>{row.won}</span>
                      </div>
                      {/* L */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: '#ef4444', lineHeight: 1 }}>{row.lost}</span>
                      </div>
                      {/* NR */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: 'var(--text-muted)', lineHeight: 1 }}>{row.nr ?? 0}</span>
                      </div>

                      {/* PTS */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
                          color: isPO ? team.color : 'var(--text-primary)',
                          background: isPO ? `${team.color}18` : 'var(--bg-subtle)',
                          border: `1px solid ${isPO ? team.color + '44' : 'var(--border-subtle)'}`,
                          borderRadius: 20, padding: '2px 12px',
                          letterSpacing: 1, display: 'inline-block', lineHeight: 1.6,
                        }}>{row.points}</span>
                      </div>

                      {/* NRR */}
                      <div style={{ textAlign: 'center', paddingRight: 8 }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)',
                            color: nrrColor, letterSpacing: 0.5,
                          }}>{nrrSign}{nrrVal.toFixed(3)}</span>
                          <div style={{ width: 60, height: 3, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-subtle)' }} />
                            <div style={{
                              position: 'absolute',
                              left: nrrVal >= 0 ? '50%' : `${nrrPct}%`,
                              width: nrrVal >= 0 ? `${nrrPct - 50}%` : `${50 - nrrPct}%`,
                              height: '100%', background: nrrColor,
                              transition: 'width 1s ease',
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )
              })}

              {/* Footer */}
              <div style={{
                padding: '10px 16px 10px 20px', borderTop: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 8, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#f97316,#dc2626)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Top 4 advance to playoffs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>W</span>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', marginLeft: 5 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>L</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>(recent form)</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>· Click for team details</span>
                </div>
              </div>
            </>
          }
        </Card>
      )}

      {/* Batting */}
      {tab === 'batting' && (
        <Card className="fade-up">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
              }}>Orange Cap Race</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2,
              }}>Top run-scorers of the season</div>
            </div>
            <Flame size={28} strokeWidth={1.8} color="#f97316" />
          </div>
          {!stats?.topBatters?.length
            ? <EmptyState text="No batting data yet" sub="Fill in top scorer when adding matches" />
            : <div style={{ padding: '8px 0' }}>
              {stats.topBatters.map((p, i) => (
                <EnhancedStatBar key={i} rank={i} name={p.name} value={p.totalRuns}
                  label="runs" max={stats.topBatters[0].totalRuns} color="#f97316" />
              ))}
            </div>
          }
        </Card>
      )}

      {/* Bowling */}
      {tab === 'bowling' && (
        <Card className="fade-up">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
              }}>Purple Cap Race</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2,
              }}>Top wicket-takers of the season</div>
            </div>
            <Zap size={28} strokeWidth={1.8} color="#8b5cf6" />
          </div>
          {!stats?.topBowlers?.length
            ? <EmptyState text="No bowling data yet" sub="Fill in top wicket taker when adding matches" />
            : <div style={{ padding: '8px 0' }}>
              {stats.topBowlers.map((p, i) => (
                <EnhancedStatBar key={i} rank={i} name={p.name} value={p.totalWickets}
                  label="wkts" max={stats.topBowlers[0].totalWickets} color="#8b5cf6" />
              ))}
            </div>
          }
        </Card>
      )}

      {/* MOM */}
      {tab === 'mom' && (
        <Card className="fade-up">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
              }}>Man of the Match</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2,
              }}>Most match awards this season</div>
            </div>
            <Star size={28} strokeWidth={1.8} color="#f59e0b" />
          </div>
          {!stats?.topMom?.length
            ? <EmptyState text="No MOM data yet" sub="Fill in player of the match when adding matches" />
            : <>
              {stats.topMom.length >= 2 && (
                <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <MOMPodium players={stats.topMom.slice(0, 3)} />
                  <div style={{ height: 4, background: 'var(--bg-subtle)' }} />
                </div>
              )}
              {stats.topMom.length > 3 && (
                <div style={{ padding: '8px 0' }}>
                  {stats.topMom.slice(3).map((p, i) => (
                    <div key={i} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
                      borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{
                        width: 28, textAlign: 'center',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 700,
                      }}>{i + 4}</span>
                      <span style={{
                        flex: 1, fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)', color: 'var(--text-primary)',
                      }}>{p.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-xl)', color: '#f97316',
                      }}>{p.awards}</span>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                      }}>award{p.awards > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {stats.topMom.length === 1 && (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <Trophy size={40} strokeWidth={1.8} color="#f59e0b" />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
                  }}>{stats.topMom[0].name}</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xl)', color: '#f97316', lineHeight: 1.2,
                  }}>{stats.topMom[0].awards}</div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                  }}>award{stats.topMom[0].awards > 1 ? 's' : ''}</div>
                </div>
              )}
            </>
          }
        </Card>
      )}

      {/* Recent Results */}
      {matches?.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <div style={{
            padding: '14px 20px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
            }}>Recent Results</div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
            }}>Last {Math.min(5, matches.length)} matches</div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 18 }}>
            {matches.slice(0, 5).map((m) => {
              const wt    = m.winner ? getTeam(m.winner) : null
              const t1    = getTeam(m.team1)
              const t2    = getTeam(m.team2)
              const t1Won = !m.noResult && m.winner === m.team1
              const t2Won = !m.noResult && m.winner === m.team2
              return (
                <div key={m.id} style={{
                  flexShrink: 0, width: 200,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = wt ? `0 8px 24px ${wt.color}22` : '0 8px 20px rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ height: 3, background: wt ? `linear-gradient(90deg, ${wt.color}, ${wt.color}44)` : 'var(--border-subtle)' }} />

                  <div style={{ padding: '8px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {m.matchNo
                      ? <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-sm)', color: '#f97316', letterSpacing: 1,
                        }}>M{m.matchNo}</span>
                      : <span />
                    }
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    }}>{formatDate(m.date)}</span>
                  </div>

                  <div style={{ padding: '6px 12px 10px', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <div style={{ flex: 1, textAlign: 'center', opacity: t1Won ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                      <TeamLogo teamId={m.team1} size={38} />
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800, fontSize: 'var(--text-sm)', marginTop: 5, color: 'var(--text-primary)',
                      }}>{m.team1}</div>
                      {m.team1Score != null && (
                        <div style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-md)', lineHeight: 1.1,
                          color: t1Won ? t1.color : 'var(--text-muted)', marginTop: 1,
                        }}>
                          {m.team1Score}/{m.team1Wickets}
                          <div style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                          }}>({m.team1Overs})</div>
                        </div>
                      )}
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, flexShrink: 0,
                    }}>VS</div>

                    <div style={{ flex: 1, textAlign: 'center', opacity: t2Won ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                      <TeamLogo teamId={m.team2} size={38} />
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800, fontSize: 'var(--text-sm)', marginTop: 5, color: 'var(--text-primary)',
                      }}>{m.team2}</div>
                      {m.team2Score != null && (
                        <div style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-md)', lineHeight: 1.1,
                          color: t2Won ? t2.color : 'var(--text-muted)', marginTop: 1,
                        }}>
                          {m.team2Score}/{m.team2Wickets}
                          <div style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)',
                          }}>({m.team2Overs})</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: wt ? `${wt.color}18` : 'var(--bg-hover)',
                    borderTop: `1px solid ${wt ? wt.color + '33' : 'var(--border-subtle)'}`,
                    padding: '7px 12px', textAlign: 'center',
                  }}>
                    {m.noResult ? (
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600,
                      }}>No Result</div>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          fontWeight: 800,
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)', color: wt?.color ?? '#f97316',
                        }}>
                          <Trophy size={14} strokeWidth={1.8} color={wt?.color ?? '#f97316'} />
                          {m.winner} won
                        </div>
                        {m.winMargin && (
                          <div style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 1,
                          }}>
                            by {m.winMargin} {m.winType}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {m.playerOfMatchName && (
                    <div style={{
                      padding: '5px 12px 8px', textAlign: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                    }}>
                      <Star size={12} strokeWidth={1.8} color="#f59e0b" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.playerOfMatchName}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
