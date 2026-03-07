import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Spinner, Button } from '../components/UI'
import { getProfile, updatePlayer } from '../services/api'
import { getTeam } from '../services/constants'

const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }

// ── Stat Pill ─────────────────────────────────────────────────────────────
function StatPill({ label, value, color = '#e6edf3', sub }) {
    return (
        <div style={{
            background: '#0d1117', border: '1px solid #21262d', borderRadius: 12,
            padding: '14px 18px', textAlign: 'center', minWidth: 90,
        }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color, lineHeight: 1, letterSpacing: 0.5 }}>
                {value ?? '—'}
            </div>
            <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: '#8b949e', marginTop: 2 }}>{sub}</div>}
        </div>
    )
}

// ── Section Header ────────────────────────────────────────────────────────
function SectionTitle({ icon, label, color = '#f97316' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1.5, color }}>{label}</div>
            <div style={{ flex: 1, height: 1, background: '#21262d' }} />
        </div>
    )
}

// ── Career Stats Grid ─────────────────────────────────────────────────────
function BattingStats({ p }) {
    if (!p.totalRuns && !p.totalBalls) return null
    return (
        <div style={{ marginBottom: 28 }}>
            <SectionTitle icon="🏏" label="Batting" color="#f97316" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatPill label="Runs"    value={p.totalRuns}    color="#f97316" />
                <StatPill label="HS"      value={p.highScore}    color="#f97316" />
                <StatPill label="Avg"     value={p.battingAverage}  color="#e6edf3" />
                <StatPill label="SR"      value={p.strikeRate}   color="#e6edf3" />
                <StatPill label="4s"      value={p.totalFours}   color="#22c55e" />
                <StatPill label="6s"      value={p.totalSixes}   color="#22c55e" />
                <StatPill label="Innings" value={p.matches}      color="#8b949e" />
            </div>
        </div>
    )
}

function BowlingStats({ p }) {
    if (!p.totalWickets && !p.totalOversBowled) return null
    return (
        <div style={{ marginBottom: 28 }}>
            <SectionTitle icon="⚡" label="Bowling" color="#8b5cf6" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatPill label="Wickets" value={p.totalWickets}      color="#8b5cf6" />
                <StatPill label="Overs"   value={p.totalOversBowled?.toFixed(1)} color="#8b5cf6" />
                <StatPill label="Runs"    value={p.totalRunsConceded} color="#e6edf3" />
                <StatPill label="Avg"     value={p.bowlingAverage}    color="#e6edf3" />
                <StatPill label="Eco"     value={p.economy}           color="#e6edf3" />
            </div>
        </div>
    )
}

function FieldingStats({ p }) {
    if (!p.totalCatches && !p.totalRunOuts) return null
    return (
        <div style={{ marginBottom: 28 }}>
            <SectionTitle icon="🧤" label="Fielding" color="#3b82f6" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <StatPill label="Catches"  value={p.totalCatches} color="#3b82f6" />
                <StatPill label="Run Outs" value={p.totalRunOuts} color="#3b82f6" />
            </div>
        </div>
    )
}

// ── Match Log Table ───────────────────────────────────────────────────────
function MatchLog({ log }) {
    const [tab, setTab] = useState('batting')

    if (!log?.length) return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No match data yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add scorecards to see match-by-match history</div>
        </div>
    )

    const hasBatting = log.some(m => m.runs != null)
    const hasBowling = log.some(m => m.wickets != null || m.oversBowled != null)
    const hasFielding = log.some(m => m.catches != null || m.runOuts != null)

    const tabs = [
        hasBatting  && { id: 'batting',  label: '🏏 Batting' },
        hasBowling  && { id: 'bowling',  label: '⚡ Bowling' },
        hasFielding && { id: 'fielding', label: '🧤 Fielding' },
    ].filter(Boolean)

    return (
        <div>
            <SectionTitle icon="📋" label="Match History" color="#e6edf3" />

            {/* sub-tabs */}
            {tabs.length > 1 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#0d1117',
                    borderRadius: 8, padding: 3, width: 'fit-content', border: '1px solid #21262d' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                            background: tab === t.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'transparent',
                            color: tab === t.id ? '#fff' : '#8b949e', transition: 'all 0.2s',
                        }}>{t.label}</button>
                    ))}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                {tab === 'batting' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Match', 'Date', 'vs', 'Runs', 'Balls', 'SR', '4s', '6s', 'Dismissal'].map((h, i) => (
                                <th key={i} style={{ padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                                    color: '#8b949e', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                    letterSpacing: 1.5, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {log.map((m, i) => (
                            <tr key={m.matchId} style={{ borderTop: '1px solid #21262d', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '10px 14px', color: '#f97316', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>
                                    {m.matchNo ? `M${m.matchNo}` : '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#8b949e', fontSize: 12 }}>{m.date}</td>
                                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.opponent}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
                                    color: m.runs >= 50 ? '#f97316' : m.runs >= 30 ? '#22c55e' : '#e6edf3' }}>
                                    {m.runs ?? '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#8b949e' }}>{m.balls ?? '—'}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#8b949e' }}>
                                    {m.strikeRate?.toFixed(1) ?? '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#22c55e' }}>{m.fours ?? '—'}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#f97316' }}>{m.sixes ?? '—'}</td>
                                <td style={{ padding: '10px 14px', fontSize: 11, color: m.dismissal === 'not out' ? '#22c55e' : '#8b949e' }}>
                                    {m.dismissal ?? '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {tab === 'bowling' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Match', 'Date', 'vs', 'Overs', 'Wickets', 'Runs', 'Economy'].map((h, i) => (
                                <th key={i} style={{ padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                                    color: '#8b949e', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                    letterSpacing: 1.5, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {log.filter(m => m.oversBowled != null || m.wickets != null).map((m, i) => (
                            <tr key={m.matchId} style={{ borderTop: '1px solid #21262d', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '10px 14px', color: '#f97316', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>
                                    {m.matchNo ? `M${m.matchNo}` : '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#8b949e', fontSize: 12 }}>{m.date}</td>
                                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.opponent}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#8b949e' }}>{m.oversBowled ?? '—'}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center',
                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
                                    color: m.wickets >= 3 ? '#8b5cf6' : '#e6edf3' }}>
                                    {m.wickets ?? '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#8b949e' }}>{m.runsConceded ?? '—'}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center',
                                    color: m.economy < 7 ? '#22c55e' : m.economy < 9 ? '#e6edf3' : '#ef4444' }}>
                                    {m.economy?.toFixed(2) ?? '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {tab === 'fielding' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Match', 'Date', 'vs', 'Catches', 'Run Outs'].map((h, i) => (
                                <th key={i} style={{ padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                                    color: '#8b949e', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                    letterSpacing: 1.5, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {log.filter(m => m.catches > 0 || m.runOuts > 0).map((m, i) => (
                            <tr key={m.matchId} style={{ borderTop: '1px solid #21262d', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '10px 14px', color: '#f97316', fontFamily: "'Bebas Neue',sans-serif", fontSize: 16 }}>
                                    {m.matchNo ? `M${m.matchNo}` : '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#8b949e', fontSize: 12 }}>{m.date}</td>
                                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.opponent}</td>
                                <td style={{ padding: '10px 14px', textAlign: 'center',
                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#3b82f6' }}>
                                    {m.catches ?? '—'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center',
                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#3b82f6' }}>
                                    {m.runOuts ?? '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

// ── Main Profile Page ─────────────────────────────────────────────────────
export default function PlayerProfile({ playerId, onBack }) {
    const [profile, setProfile]       = useState(null)
    const [loading, setLoading]       = useState(true)
    const [editingUrl, setEditingUrl] = useState(false)
    const [urlInput, setUrlInput]     = useState('')
    const [saving, setSaving]         = useState(false)

    useEffect(() => {
        setLoading(true)
        getProfile(playerId)
            .then(setProfile)
            .catch(() => toast.error('Failed to load player profile'))
            .finally(() => setLoading(false))
    }, [playerId])

    const openUrlEdit = () => {
        setUrlInput(profile.profilePictureUrl || '')
        setEditingUrl(true)
    }

    const saveUrl = async () => {
        setSaving(true)
        try {
            await updatePlayer(playerId, {
                name: profile.name,
                teamId: profile.teamId,
                role: profile.role,
                profilePictureUrl: urlInput.trim() || null,
            })
            setProfile(prev => ({ ...prev, profilePictureUrl: urlInput.trim() || null }))
            setEditingUrl(false)
            toast.success('Profile picture updated!')
        } catch {
            toast.error('Failed to update picture')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Spinner />
    if (!profile) return null

    const team = getTeam(profile.teamId)

    return (
        <div className="fade-up">
            {/* Back button */}
            <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                color: '#8b949e', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                marginBottom: 20, padding: 0, transition: 'color 0.2s',
            }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
            >
                ← Back to Players
            </button>

            {/* Hero header */}
            <div style={{
                background: '#161b22', border: '1px solid #21262d', borderRadius: 16,
                overflow: 'hidden', marginBottom: 20, position: 'relative',
            }}>
                {/* top color bar */}
                <div style={{ height: 5, background: `linear-gradient(90deg, ${team.color}, ${team.color}44)` }} />

                {/* glow */}
                <div style={{
                    position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                    borderRadius: '50%', background: team.color, opacity: 0.05, filter: 'blur(40px)', pointerEvents: 'none',
                }} />

                <div className="profile-hero-inner" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {/* avatar + URL edit */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${team.color}44, ${team.color}11)`,
                                border: `2px solid ${team.color}66`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                            }}>
                                {profile.profilePictureUrl
                                    ? <img src={profile.profilePictureUrl} alt={profile.name}
                                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: team.color, letterSpacing: 1 }}>
                                        {profile.name.charAt(0)}
                                      </span>
                                }
                            </div>
                            <button
                                onClick={openUrlEdit}
                                title="Set photo URL"
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 26, height: 26, borderRadius: '50%',
                                    background: team.color, border: '2px solid #161b22',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 12, color: '#fff',
                                }}
                            >✎</button>
                        </div>

                        {/* inline URL editor — moved outside hero card to avoid overflow:hidden clipping */}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2,
                            color: '#e6edf3', lineHeight: 1, marginBottom: 8 }}>
                            {profile.name}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: team.color,
                  background: team.color + '22', borderRadius: 6, padding: '3px 10px' }}>
                {profile.teamId}
              </span>
                            <span style={{ fontSize: 11, fontWeight: 700,
                                color: ROLE_COLORS[profile.role],
                                background: ROLE_COLORS[profile.role] + '22', borderRadius: 6, padding: '3px 10px' }}>
                {ROLE_LABELS[profile.role]}
              </span>
                            <span style={{ fontSize: 11, color: '#8b949e',
                                background: '#0d1117', borderRadius: 6, padding: '3px 10px', border: '1px solid #21262d' }}>
                {profile.matches} match{profile.matches !== 1 ? 'es' : ''}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo URL editor modal — outside hero card so overflow:hidden doesn't clip it */}
            {editingUrl && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }} onClick={() => setEditingUrl(false)}>
                    <div style={{
                        background: '#161b22', border: '1px solid #30363d', borderRadius: 14,
                        padding: 24, width: '100%', maxWidth: 400,
                        animation: 'fadeUp 0.2s ease',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1,
                            color: team.color, marginBottom: 16 }}>
                            Set Profile Picture
                        </div>
                        <input
                            autoFocus
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditingUrl(false) }}
                            placeholder="https://example.com/photo.jpg"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#0d1117', border: '1px solid #30363d',
                                borderRadius: 8, padding: '10px 12px',
                                color: '#e6edf3', fontSize: 13, outline: 'none',
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        />
                        {urlInput && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                                <img src={urlInput} alt="preview"
                                     style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                                         border: `2px solid ${team.color}66` }}
                                     onError={e => { e.target.style.opacity = 0 }}
                                     onLoad={e => { e.target.style.opacity = 1 }} />
                                <span style={{ fontSize: 12, color: '#8b949e' }}>Preview</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={() => setEditingUrl(false)} style={{
                                flex: 1, padding: '9px 0', background: 'transparent',
                                border: '1px solid #30363d', borderRadius: 8,
                                color: '#8b949e', cursor: 'pointer', fontSize: 13,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>Cancel</button>
                            <button onClick={saveUrl} disabled={saving} style={{
                                flex: 2, padding: '9px 0',
                                background: `linear-gradient(135deg, ${team.color}, ${team.color}cc)`,
                                border: 'none', borderRadius: 8,
                                color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                                opacity: saving ? 0.7 : 1,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>{saving ? 'Saving…' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Career stats */}
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
                <BattingStats p={profile} />
                <BowlingStats p={profile} />
                <FieldingStats p={profile} />
                {!profile.totalRuns && !profile.totalWickets && !profile.totalCatches && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#8b949e' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>No scorecard data yet</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Submit a scorecard to start tracking stats</div>
                    </div>
                )}
            </div>

            {/* Match log */}
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 16, padding: '24px 28px' }}>
                <MatchLog log={profile.matchLog} />
            </div>
        </div>
    )
}