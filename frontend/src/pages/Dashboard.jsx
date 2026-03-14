import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, TeamChip, EmptyState, Spinner, TeamLogo } from '../components/UI'
import { getTeam, formatDate } from '../services/constants'

const TABS = [
    { id: 'standings', label: 'Standings',  icon: '🏆' },
    { id: 'batting',   label: 'Orange Cap', icon: '🟠' },
    { id: 'bowling',   label: 'Purple Cap', icon: '🟣' },
    { id: 'mom',       label: 'MOM',        icon: '⭐' },
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
function SummaryCard({ label, value, icon, color, delay }) {
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
            {/* glow blob */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%',
                background: color, opacity: 0.1, filter: 'blur(28px)', pointerEvents: 'none' }} />
            {/* icon */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 10, marginBottom: 12,
              background: `${color}18`, border: `1px solid ${color}33`, fontSize: 20,
            }}>{icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color, letterSpacing: 1, lineHeight: 1 }}>
                {display}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8, fontWeight: 700 }}>{label}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${color}66, ${color}00)` }} />
        </div>
    )
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
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color,
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

// ── Enhanced Stat Bar ─────────────────────────────────────────────────────
const MEDALS = ['🥇', '🥈', '🥉']

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
                <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                    {isTop3
                        ? <span style={{ fontSize: 18 }}>{MEDALS[rank]}</span>
                        : <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{rank + 1}</span>
                    }
                </div>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: isTop3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color, lineHeight: 1 }}>{value}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>{label}</span>
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
                <div style={{ marginLeft: 40, marginTop: 4, fontSize: 10, color: `${color}bb` }}>
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
    const crowns = ['🥈', '🏆', '🥉']

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, padding: '24px 16px 0', marginBottom: 8 }}>
            {podium.map((p, idx) => (
                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, maxWidth: 130 }}>
                    <div style={{ fontSize: 22 }}>{crowns[idx]}</div>
                    <div style={{ fontWeight: 700, fontSize: 12, textAlign: 'center', color: idx === 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        wordBreak: 'break-word', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: glows[idx], lineHeight: 1 }}>{p.awards}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>award{p.awards > 1 ? 's' : ''}</div>
                    <div style={{ width: '100%', height: heights[idx], borderRadius: '6px 6px 0 0',
                        background: idx === 1 ? `linear-gradient(180deg, ${glows[idx]}33, ${glows[idx]}11)` : 'var(--bg-elevated)',
                        border: `1px solid ${glows[idx]}44`, borderBottom: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, boxShadow: idx === 1 ? `0 -4px 20px ${glows[idx]}22` : 'none',
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
        color: 'var(--text-secondary)', fontWeight: 700, fontSize: 10,
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
        { label: 'Matches Played', value: stats?.totalMatches ?? 0,   icon: '🏟️', color: '#3b82f6' },
        { label: 'Total Runs',     value: stats?.totalRuns ?? 0,       icon: '🏏', color: '#f97316' },
        { label: 'Highest Score',  value: stats?.highestScore || '—',  icon: '🔥', color: '#ef4444' },
        { label: 'Teams Active',   value: stats?.teamsActive ?? 0,     icon: '🛡️', color: '#8b5cf6' },
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
                        fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                        background: tab === t.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'transparent',
                        color: tab === t.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Standings ── */}
            {tab === 'standings' && (
                <Card className="fade-up">
                    <CardHeader title="Points Table" subtitle="IPL 2025 Season" />
                    {!stats?.standings?.length
                        ? <EmptyState text="No matches yet" sub="Add matches to see standings" />
                        : <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                    <tr>
                                        <TH align="left"  width={48}>#</TH>
                                        <TH align="left"         >Team</TH>
                                        <TH width={48}>P</TH>
                                        <TH width={48}>W</TH>
                                        <TH width={48}>L</TH>
                                        <TH width={48}>NR</TH>
                                        <TH width={60}>Pts</TH>
                                        <TH width={120}>NRR</TH>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stats.standings.map((row, i) => {
                                        const team = getTeam(row.teamId)
                                        const isPlayoff = i < 4
                                        return (
                                            <tr key={row.teamId}
                                                className={isPlayoff ? 'standings-playoff' : ''}
                                                style={{
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    transition: 'background 0.15s', cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = isPlayoff ? 'rgba(249,115,22,0.04)' : 'transparent'}
                                                onClick={() => onOpenTeam && onOpenTeam(row.teamId)}
                                                title={`View ${row.teamName} details`}
                                            >
                                                {/* rank */}
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        {isPlayoff && <div style={{ width: 3, height: 16, borderRadius: 2, background: '#f97316', flexShrink: 0 }} />}
                                                        <span style={{ color: isPlayoff ? '#f97316' : 'var(--text-secondary)', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17 }}>
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* team */}
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <TeamLogo teamId={row.teamId} size={30} />
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{row.teamId}</div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{row.teamName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* P */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.played}</td>
                                                {/* W */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <span style={{ color: '#22c55e', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>{row.won}</span>
                                                </td>
                                                {/* L */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>{row.lost}</span>
                                                </td>
                                                {/* NR */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>{row.nr ?? 0}</span>
                                                </td>
                                                {/* Pts */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <span style={{
                                                        background: isPlayoff ? 'rgba(249,115,22,0.15)' : 'var(--bg-subtle)',
                                                        color: isPlayoff ? '#f97316' : 'var(--text-primary)',
                                                        fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                                                        fontSize: 14, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1,
                                                        border: isPlayoff ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border-subtle)',
                                                        display: 'inline-block',
                                                    }}>{row.points}</span>
                                                </td>
                                                {/* NRR */}
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <NRRCell nrr={row.nrr} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 3, height: 14, borderRadius: 2, background: '#f97316' }} />
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Top 4 advance to playoffs</span>
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click a row to view team details →</span>
                            </div>
                        </>
                    }
                </Card>
            )}

            {/* ── Batting ── */}
            {tab === 'batting' && (
                <Card className="fade-up">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Orange Cap Race</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Top run-scorers of the season</div>
                        </div>
                        <div style={{ fontSize: 28 }}>🟠</div>
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

            {/* ── Bowling ── */}
            {tab === 'bowling' && (
                <Card className="fade-up">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Purple Cap Race</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Top wicket-takers of the season</div>
                        </div>
                        <div style={{ fontSize: 28 }}>🟣</div>
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

            {/* ── MOM ── */}
            {tab === 'mom' && (
                <Card className="fade-up">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Man of the Match</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Most match awards this season</div>
                        </div>
                        <div style={{ fontSize: 28 }}>⭐</div>
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
                                            <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{i + 4}</span>
                                            <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#f97316' }}>{p.awards}</span>
                                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>award{p.awards > 1 ? 's' : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {stats.topMom.length === 1 && (
                                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{stats.topMom[0].name}</div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: '#f97316', lineHeight: 1.2 }}>{stats.topMom[0].awards}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>award{stats.topMom[0].awards > 1 ? 's' : ''}</div>
                                </div>
                            )}
                        </>
                    }
                </Card>
            )}

            {/* ── Recent Results ── */}
            {matches?.length > 0 && (
                <Card style={{ marginTop: 20 }}>
                    <CardHeader title="Recent Results" subtitle={`Last ${Math.min(5, matches.length)} matches`} />
                    <div>
                        {matches.slice(0, 5).map((m, i) => {
                            const winnerTeam = getTeam(m.winner)
                            return (
                                <div key={m.id} className="result-row-stack" style={{
                                    padding: '14px 20px', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: 16, transition: 'background 0.15s', cursor: 'default' }}
                                     onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div className="result-meta-cell" style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 54, textAlign: 'center', flexShrink: 0 }}>
                                        {m.matchNo && <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#f97316' }}>M{m.matchNo}</div>}
                                        <div>{formatDate(m.date)}</div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <TeamChip teamId={m.team1} score={m.team1Score} wickets={m.team1Wickets} overs={m.team1Overs} won={m.winner === m.team1} />
                                        <div style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                                            color: 'var(--text-secondary)', fontWeight: 800, fontSize: 11 }}>VS</div>
                                        <TeamChip teamId={m.team2} score={m.team2Score} wickets={m.team2Wickets} overs={m.team2Overs} won={m.winner === m.team2} />
                                    </div>
                                    <div className="result-outcome-cell" style={{ fontSize: 11, textAlign: 'right', minWidth: 100, flexShrink: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                            <div style={{ width: 3, height: 12, borderRadius: 2, background: winnerTeam.color }} />
                                            <span style={{ fontWeight: 700, color: '#f97316' }}>{m.winner} won</span>
                                        </div>
                                        {m.winMargin && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>by {m.winMargin} {m.winType}</div>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}
        </div>
    )
}
