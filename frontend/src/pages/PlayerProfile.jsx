import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { GiCricketBat, GiCricket, GiTennisBall, GiGloves } from 'react-icons/gi'
import { Spinner } from '../components/UI'
import { getProfile, updatePlayer } from '../services/api'
import { getTeam, formatDate } from '../services/constants'
import { useAuth } from '../context/AuthContext'
import {
  Camera, ArrowLeft, Flag, Plane, Star, CheckCircle2, Target,
  Zap, TrendingUp, Flame, Shield, ClipboardList, X,
} from 'lucide-react'

const IPL_PLACEHOLDER = 'https://documents.iplt20.com/ipl/assets/images/Default-Men.png'

const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }
const ROLE_ICON_COMPONENTS = { BAT: GiCricketBat, BOWL: GiTennisBall, ALL: GiCricket, WK: GiGloves }

// Nationality display — use Flag icon (lucide) for all; the emoji flags are removed
const NATIONALITY_DISPLAY = {
  'Indian': 'Indian', 'Australian': 'Australian', 'English': 'English',
  'South African': 'South African', 'West Indian': 'West Indian', 'New Zealander': 'New Zealander',
  'Sri Lankan': 'Sri Lankan', 'Afghan': 'Afghan', 'Pakistani': 'Pakistani',
  'Bangladeshi': 'Bangladeshi', 'Singaporean': 'Singaporean', 'Zimbabwean': 'Zimbabwean',
}

function getAge(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDob(dob) {
  if (!dob) return null
  const d = new Date(dob)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Computed insights from matchLog ───────────────────────────────────────
function computeInsights(profile) {
  const log        = profile.matchLog || []
  const battingLog = log.filter(m => m.runs != null)
  const bowlingLog = log.filter(m => m.wickets != null || m.oversBowled != null)

  const fifties  = battingLog.filter(m => m.runs >= 50 && m.runs < 100).length
  const hundreds = battingLog.filter(m => m.runs >= 100).length
  const notOuts  = battingLog.filter(m => m.dismissal === 'not out').length
  const ducks    = battingLog.filter(m => m.runs === 0 && m.dismissal !== 'not out').length

  const boundaryRuns = (profile.totalFours || 0) * 4 + (profile.totalSixes || 0) * 6
  const boundaryPct  = profile.totalRuns > 0
    ? Math.round(boundaryRuns / profile.totalRuns * 100)
    : null

  const bestBowling = bowlingLog.reduce((best, m) => {
    if (!(m.wickets > 0)) return best
    if (!best) return m
    if (m.wickets > best.wickets) return m
    if (m.wickets === best.wickets && (m.runsConceded ?? 999) < (best.runsConceded ?? 999)) return m
    return best
  }, null)

  const threeWickets = bowlingLog.filter(m => (m.wickets || 0) >= 3).length

  return { fifties, hundreds, notOuts, ducks, boundaryPct, bestBowling, threeWickets }
}

// ── Section title ──────────────────────────────────────────────────────────
function SectionTitle({ icon, label, color = '#f97316' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ display: 'flex', alignItems: 'center', color }}>{icon}</span>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-md)', letterSpacing: 1.5, color,
      }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

// ── Stat pill ──────────────────────────────────────────────────────────────
function StatPill({ label, value, color = 'var(--text-primary)', sub }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 12,
      padding: '14px 18px', textAlign: 'center', minWidth: 90,
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xl)', color, lineHeight: 1, letterSpacing: 0.5,
      }}>
        {value ?? '—'}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4,
      }}>{label}</div>
      {sub && <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2,
      }}>{sub}</div>}
    </div>
  )
}

// ── Career highlights chips ────────────────────────────────────────────────
function CareerHighlights({ insights, hasBatting, hasBowling }) {
  const chips = []
  if (hasBatting) {
    chips.push({ IconEl: <Star size={20} strokeWidth={1.8} color="#f97316" />,   label: '50s',         value: insights.fifties,    color: '#f97316' })
    chips.push({ IconEl: <Star size={20} strokeWidth={1.8} color="#fbbf24" />,   label: '100s',        value: insights.hundreds,   color: '#fbbf24' })
    chips.push({ IconEl: <CheckCircle2 size={20} strokeWidth={1.8} color="#22c55e" />, label: 'Not Outs', value: insights.notOuts, color: '#22c55e' })
    if (insights.boundaryPct != null)
      chips.push({ IconEl: <Target size={20} strokeWidth={1.8} color="#3b82f6" />, label: 'Boundary %', value: `${insights.boundaryPct}%`, color: '#3b82f6' })
  }
  if (hasBowling) {
    if (insights.bestBowling)
      chips.push({
        IconEl: <Zap size={20} strokeWidth={1.8} color="#8b5cf6" />,
        label: 'Best Figures',
        value: `${insights.bestBowling.wickets}/${insights.bestBowling.runsConceded ?? '?'}`,
        color: '#8b5cf6',
      })
    chips.push({ IconEl: <Target size={20} strokeWidth={1.8} color="#8b5cf6" />, label: '3+ Wkt Hauls', value: insights.threeWickets, color: '#8b5cf6' })
  }
  if (!chips.length) return null
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle icon={<Star size={18} strokeWidth={1.8} />} label="Career Highlights" color="#fbbf24" />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {chips.map((c, i) => (
          <div key={c.label} style={{
            background: c.color + '12', border: `1px solid ${c.color}33`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            minWidth: 80, animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.IconEl}</div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xl)', color: c.color, lineHeight: 1,
            }}>
              {c.value}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: 1.1, textAlign: 'center',
            }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Recent batting form strip ──────────────────────────────────────────────
function FormStrip({ log }) {
  const recent = [...log].filter(m => m.runs != null).slice(-8).reverse()
  if (!recent.length) return null

  const getColor = (runs, dismissal) => {
    if (runs >= 100) return '#fbbf24'
    if (runs >= 50)  return '#f97316'
    if (runs >= 30)  return '#22c55e'
    if (runs >= 10)  return '#3b82f6'
    if (dismissal === 'not out') return '#22c55e'
    return '#ef4444'
  }
  const maxRuns = Math.max(...recent.map(m => m.runs || 0), 1)

  return (
    <div style={{ marginBottom: 4 }}>
      <SectionTitle icon={<TrendingUp size={18} strokeWidth={1.8} />} label="Recent Batting Form" color="var(--text-primary)" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {recent.map((m, i) => {
          const clr  = getColor(m.runs, m.dismissal)
          const barH = Math.max(20, Math.round(20 + (m.runs / maxRuns) * 56))
          return (
            <div key={m.matchId || i}
              title={`M${m.matchNo}: ${m.runs} runs${m.balls ? ` (${m.balls}b)` : ''} vs ${m.opponent}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)', color: clr, lineHeight: 1,
              }}>
                {m.runs}
              </div>
              <div style={{
                width: 32, height: barH, borderRadius: '6px 6px 3px 3px',
                background: `linear-gradient(180deg, ${clr}, ${clr}55)`,
              }} />
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5,
              }}>
                {(m.opponent || '').substring(0, 3).toUpperCase()}
              </div>
            </div>
          )
        })}
        <div style={{
          paddingBottom: 14,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', color: 'var(--text-muted)', alignSelf: 'flex-end', marginLeft: 4,
        }}>
          recent
        </div>
      </div>
    </div>
  )
}

// ── Career stats sections ──────────────────────────────────────────────────
function BattingStats({ p }) {
  if (!p.totalRuns && !p.totalBalls) return null
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle icon={<Flame size={18} strokeWidth={1.8} />} label="Batting" color="#f97316" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <StatPill label="Runs"    value={p.totalRuns}          color="#f97316" />
        <StatPill label="HS"      value={p.highScore}          color="#f97316" />
        <StatPill label="Avg"     value={p.battingAverage} />
        <StatPill label="SR"      value={p.strikeRate} />
        <StatPill label="4s"      value={p.totalFours}         color="#22c55e" />
        <StatPill label="6s"      value={p.totalSixes}         color="#22c55e" />
        <StatPill label="Innings" value={p.matches}            color="var(--text-secondary)" />
      </div>
    </div>
  )
}

function BowlingStats({ p }) {
  if (!p.totalWickets && !p.totalOversBowled) return null
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle icon={<Zap size={18} strokeWidth={1.8} />} label="Bowling" color="#8b5cf6" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <StatPill label="Wickets" value={p.totalWickets}                     color="#8b5cf6" />
        <StatPill label="Overs"   value={p.totalOversBowled?.toFixed(1)}     color="#8b5cf6" />
        <StatPill label="Runs"    value={p.totalRunsConceded} />
        <StatPill label="Avg"     value={p.bowlingAverage} />
        <StatPill label="Eco"     value={p.economy} />
      </div>
    </div>
  )
}

function FieldingStats({ p }) {
  if (!p.totalCatches && !p.totalRunOuts) return null
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle icon={<Shield size={18} strokeWidth={1.8} />} label="Fielding" color="#3b82f6" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <StatPill label="Catches"  value={p.totalCatches} color="#3b82f6" />
        <StatPill label="Run Outs" value={p.totalRunOuts} color="#3b82f6" />
      </div>
    </div>
  )
}

// ── Match Log ─────────────────────────────────────────────────────────────
function MatchLog({ log }) {
  const [tab, setTab] = useState('batting')

  if (!log?.length) return (
    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <ClipboardList size={32} strokeWidth={1.5} color="var(--text-muted)" />
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-base)', fontWeight: 600,
      }}>No match data yet</div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)', marginTop: 4,
      }}>Add scorecards to see match-by-match history</div>
    </div>
  )

  const hasBatting  = log.some(m => m.runs != null)
  const hasBowling  = log.some(m => m.wickets != null || m.oversBowled != null)
  const hasFielding = log.some(m => m.catches != null || m.runOuts != null)

  const tabs = [
    hasBatting  && { id: 'batting',  label: 'Batting',  icon: <Flame size={14} strokeWidth={1.8} color="#f97316" /> },
    hasBowling  && { id: 'bowling',  label: 'Bowling',  icon: <Zap size={14} strokeWidth={1.8} color="#8b5cf6" /> },
    hasFielding && { id: 'fielding', label: 'Fielding', icon: <Shield size={14} strokeWidth={1.8} color="#3b82f6" /> },
  ].filter(Boolean)

  return (
    <div>
      <SectionTitle icon={<ClipboardList size={18} strokeWidth={1.8} />} label="Match History" color="var(--text-primary)" />

      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-subtle)',
          borderRadius: 8, padding: 3, width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              background: tab === t.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        {tab === 'batting' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Match', 'Date', 'vs', 'Runs', 'Balls', 'SR', '4s', '6s', 'Dismissal'].map((h, i) => (
                  <th key={i} style={{
                    padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: 1.5, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map((m) => (
                <tr key={m.matchId} style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s',
                  animation: 'rowIn 0.2s ease both' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{
                    padding: '10px 14px', color: '#f97316',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-md)',
                  }}>
                    {m.matchNo ? `M${m.matchNo}` : '—'}
                  </td>
                  <td style={{
                    padding: '10px 14px', color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                  }}>{formatDate(m.date)}</td>
                  <td style={{
                    padding: '10px 14px', fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-base)',
                  }}>{m.opponent}</td>
                  <td style={{
                    padding: '10px 14px', textAlign: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-md)',
                    color: m.runs >= 100 ? '#fbbf24' : m.runs >= 50 ? '#f97316' : m.runs >= 30 ? '#22c55e' : 'var(--text-primary)',
                  }}>
                    {m.runs ?? '—'}
                    {m.runs >= 100 && <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', marginLeft: 2, color: '#fbbf24',
                    }}>*</span>}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.balls ?? '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>
                    {m.strikeRate?.toFixed(1) ?? '—'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#22c55e', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.fours ?? '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#f97316', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.sixes ?? '—'}</td>
                  <td style={{
                    padding: '10px 14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)', color: m.dismissal === 'not out' ? '#22c55e' : 'var(--text-secondary)',
                  }}>
                    {m.dismissal ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'bowling' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Match', 'Date', 'vs', 'Overs', 'Wickets', 'Runs', 'Economy'].map((h, i) => (
                  <th key={i} style={{
                    padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: 1.5, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.filter(m => m.oversBowled != null || m.wickets != null).map((m) => (
                <tr key={m.matchId} style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s',
                  animation: 'rowIn 0.2s ease both' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', color: '#f97316', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)' }}>
                    {m.matchNo ? `M${m.matchNo}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{formatDate(m.date)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.opponent}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.oversBowled ?? '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-md)',
                    color: m.wickets >= 5 ? '#fbbf24' : m.wickets >= 3 ? '#8b5cf6' : 'var(--text-primary)' }}>
                    {m.wickets ?? '—'}
                    {m.wickets >= 5 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', marginLeft: 2, color: '#fbbf24' }}>*</span>}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.runsConceded ?? '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
                    color: m.economy < 7 ? '#22c55e' : m.economy < 9 ? 'var(--text-primary)' : '#ef4444' }}>
                    {m.economy?.toFixed(2) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'fielding' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Match', 'Date', 'vs', 'Catches', 'Run Outs'].map((h, i) => (
                  <th key={i} style={{
                    padding: '9px 14px', textAlign: i > 2 ? 'center' : 'left',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: 1.5, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.filter(m => m.catches > 0 || m.runOuts > 0).map((m) => (
                <tr key={m.matchId} style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s',
                  animation: 'rowIn 0.2s ease both' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', color: '#f97316', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)' }}>
                    {m.matchNo ? `M${m.matchNo}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{formatDate(m.date)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)' }}>{m.opponent}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center',
                    fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: '#3b82f6' }}>
                    {m.catches ?? '—'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center',
                    fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: '#3b82f6' }}>
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
export default function PlayerProfile({ playerId, onBack, onOpenTeam }) {
  const { isAdmin } = useAuth()
  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlInput,   setUrlInput]   = useState('')
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    setLoading(true)
    getProfile(playerId)
      .then(setProfile)
      .catch(() => toast.error('Failed to load player profile'))
      .finally(() => setLoading(false))
  }, [playerId])

  const saveUrl = async () => {
    setSaving(true)
    try {
      await updatePlayer(playerId, {
        name: profile.name,
        teamId: profile.teamId,
        role: profile.role,
        profilePictureUrl: urlInput.trim() || null,
        dateOfBirth: profile.dateOfBirth,
        nationality: profile.nationality,
        battingStyle: profile.battingStyle,
        bowlingStyle: profile.bowlingStyle,
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

  const team     = getTeam(profile.teamId)
  const RoleIcon = ROLE_ICON_COMPONENTS[profile.role]
  const insights = computeInsights(profile)
  const hasBatting = !!(profile.totalRuns || (profile.matchLog || []).some(m => m.runs != null))
  const hasBowling = !!(profile.totalWickets || profile.totalOversBowled)
  const hasHighlights = hasBatting || hasBowling
  const hasFormStrip  = (profile.matchLog || []).some(m => m.runs != null)
  const isOverseas = profile.nationality && profile.nationality !== 'Indian'

  return (
    <div>
      {/* Cinematic Hero Banner */}
      <div style={{
        margin: '-28px -20px 0',
        background: `linear-gradient(135deg, ${team.color}1c 0%, ${team.color}09 45%, var(--bg-base) 72%)`,
        borderBottom: `1px solid ${team.color}33`,
        padding: '24px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: -40, width: 320, height: 320,
          borderRadius: '50%', background: team.color, opacity: 0.07,
          filter: 'blur(70px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -20, width: 200, height: 200,
          borderRadius: '50%', background: team.color, opacity: 0.04,
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        {/* back button */}
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
          borderRadius: 20, padding: '5px 14px',
          color: 'var(--text-secondary)', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', fontWeight: 600,
          marginBottom: 24, transition: 'color 0.2s, background 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Players
        </button>

        <div className="profile-hero-inner" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          {/* avatar */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              border: `3px solid ${team.color}`,
              boxShadow: `0 0 0 5px ${team.color}1a, 0 8px 32px ${team.color}55`,
              overflow: 'hidden', background: `${team.color}11`,
              animation: 'scoreFlash 0.5s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              <img
                src={profile.profilePictureUrl || IPL_PLACEHOLDER}
                alt={profile.name}
                onError={e => { e.target.src = IPL_PLACEHOLDER }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {isAdmin && (
              <button
                onClick={() => { setUrlInput(profile.profilePictureUrl || ''); setEditingUrl(true) }}
                title="Set photo URL"
                style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 28, height: 28, borderRadius: '50%',
                  background: team.color, border: '2px solid var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <Camera size={14} strokeWidth={2} />
              </button>
            )}
            {/* overseas badge */}
            {isOverseas && (
              <div title={`Overseas · ${profile.nationality}`} style={{
                position: 'absolute', top: 2, right: 2,
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg,#f97316,#dc2626)',
                border: '2px solid var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plane size={12} strokeWidth={2} color="#fff" />
              </div>
            )}
          </div>

          {/* name + badges */}
          <div style={{ flex: 1, minWidth: 0, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)', letterSpacing: 2,
              color: 'var(--text-primary)', lineHeight: 1, marginBottom: 12,
            }}>
              {profile.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                onClick={() => onOpenTeam?.(profile.teamId)}
                title={`View ${team.name}`}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, color: team.color,
                  background: team.color + '22', borderRadius: 20, padding: '4px 14px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  border: `1px solid ${team.color}44`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = team.color + '44'}
                onMouseLeave={e => e.currentTarget.style.background = team.color + '22'}
              >{profile.teamId}</span>

              {(() => { const Icon = ROLE_ICON_COMPONENTS[profile.role]; return (
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: ROLE_COLORS[profile.role],
                  background: ROLE_COLORS[profile.role] + '22',
                  borderRadius: 20, padding: '4px 14px',
                  border: `1px solid ${ROLE_COLORS[profile.role]}44`,
                }}>
                  {Icon && <Icon size={14} />}
                  {ROLE_LABELS[profile.role]}
                </span>
              )})()}

              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)', borderRadius: 20, padding: '4px 14px',
                border: '1px solid var(--border-subtle)',
              }}>
                {profile.matches} match{profile.matches !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Bio strip */}
            {(profile.nationality || profile.dateOfBirth || profile.battingStyle || profile.bowlingStyle) && (
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                marginTop: 12, animation: 'fadeUp 0.4s ease 0.2s both',
              }}>
                {profile.nationality && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <Flag size={14} strokeWidth={2} color="var(--text-muted)" />
                    {profile.nationality}
                  </span>
                )}
                {profile.dateOfBirth && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    {formatDob(profile.dateOfBirth)}
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', background: team.color + '22',
                      color: team.color, borderRadius: 8, padding: '1px 7px',
                      fontWeight: 700,
                    }}>age {getAge(profile.dateOfBirth)}</span>
                  </span>
                )}
                {profile.battingStyle && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    background: 'rgba(249,115,22,0.08)', borderRadius: 8,
                    padding: '2px 10px', border: '1px solid rgba(249,115,22,0.2)',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <Flame size={12} strokeWidth={2} color="#f97316" />
                    {profile.battingStyle}
                  </span>
                )}
                {profile.bowlingStyle && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    background: 'rgba(139,92,246,0.08)', borderRadius: 8,
                    padding: '2px 10px', border: '1px solid rgba(139,92,246,0.2)',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <Zap size={12} strokeWidth={2} color="#8b5cf6" />
                    {profile.bowlingStyle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginTop: 28 }}>

        {/* Photo URL editor modal */}
        {editingUrl && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }} onClick={() => setEditingUrl(false)}>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 14,
              padding: 24, width: '100%', maxWidth: 400,
              animation: 'fadeUp 0.2s ease',
            }} onClick={e => e.stopPropagation()}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-md)', letterSpacing: 1,
                color: team.color, marginBottom: 16,
              }}>
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
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-input)',
                  borderRadius: 8, padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
              {urlInput && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <img src={urlInput} alt="preview"
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                      border: `2px solid ${team.color}66` }}
                    onError={e => { e.target.style.opacity = 0 }}
                    onLoad={e => { e.target.style.opacity = 1 }} />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                  }}>Preview</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setEditingUrl(false)} style={{
                  flex: 1, padding: '9px 0', background: 'transparent',
                  border: '1px solid var(--border-input)', borderRadius: 8,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                }}>Cancel</button>
                <button onClick={saveUrl} disabled={saving} style={{
                  flex: 2, padding: '9px 0',
                  background: `linear-gradient(135deg, ${team.color}, ${team.color}cc)`,
                  border: 'none', borderRadius: 8,
                  color: '#fff', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)', fontWeight: 700,
                  opacity: saving ? 0.7 : 1,
                }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Career Highlights + Form Strip */}
        {(hasHighlights || hasFormStrip) && (
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 16, padding: '24px 28px', marginBottom: 20,
            animation: 'fadeUp 0.4s ease 0.15s both',
          }}>
            <CareerHighlights insights={insights} hasBatting={hasBatting} hasBowling={hasBowling} />
            <FormStrip log={profile.matchLog || []} />
          </div>
        )}

        {/* Career Stats */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 20,
          animation: 'fadeUp 0.4s ease 0.2s both',
        }}>
          <BattingStats p={profile} />
          <BowlingStats p={profile} />
          <FieldingStats p={profile} />
          {!profile.totalRuns && !profile.totalWickets && !profile.totalCatches && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <ClipboardList size={32} strokeWidth={1.5} color="var(--text-muted)" />
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-base)', fontWeight: 600,
              }}>No scorecard data yet</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)', marginTop: 4,
              }}>Submit a scorecard to start tracking stats</div>
            </div>
          )}
        </div>

        {/* Match Log */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 16, padding: '24px 28px',
          animation: 'fadeUp 0.4s ease 0.25s both',
        }}>
          <MatchLog log={profile.matchLog} />
        </div>
      </div>
    </div>
  )
}
