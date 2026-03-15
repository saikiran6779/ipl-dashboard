import { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, Pencil, Trash2, Eye, X, FileJson, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Spinner, Button, Input, Select, TeamLogo } from '../components/UI'
import { getSquad, getScorecard, saveScorecard, deleteScorecard, createPlayer } from '../services/api'
import { getTeam, formatDate } from '../services/constants'
import ScorecardImportModal from './ScorecardImportModal'

const TEAL = '#0d9488'

const ROLES      = ['BAT', 'BOWL', 'ALL', 'WK']
const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }
const DISMISSALS  = ['not out', 'bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', 'retired hurt']

// ── Helpers ───────────────────────────────────────────────────────────────
const emptyEntry = (playerId) => ({
    playerId,
    // batting
    runs: '', balls: '', fours: '', sixes: '', dismissal: 'not out',
    // bowling
    oversBowled: '', wickets: '', runsConceded: '',
    // fielding
    catches: '', runOuts: '',
})

const toPayload = (entry) => ({
    playerId:     entry.playerId,
    runs:         entry.runs         !== '' ? parseInt(entry.runs)         : null,
    balls:        entry.balls        !== '' ? parseInt(entry.balls)        : null,
    fours:        entry.fours        !== '' ? parseInt(entry.fours)        : null,
    sixes:        entry.sixes        !== '' ? parseInt(entry.sixes)        : null,
    dismissal:    entry.dismissal    || null,
    oversBowled:  entry.oversBowled  !== '' ? parseFloat(entry.oversBowled): null,
    wickets:      entry.wickets      !== '' ? parseInt(entry.wickets)      : null,
    runsConceded: entry.runsConceded !== '' ? parseInt(entry.runsConceded) : null,
    catches:      entry.catches      !== '' ? parseInt(entry.catches)      : null,
    runOuts:      entry.runOuts      !== '' ? parseInt(entry.runOuts)      : null,
})

// ── Team color tab bar ────────────────────────────────────────────────────
function TeamTabs({ teams, active, onChange, summaries = {} }) {
    return (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
            {teams.map(tid => {
                const team = getTeam(tid)
                const isActive = active === tid
                const s = summaries[tid]
                return (
                    <button key={tid} onClick={() => onChange(tid)} style={{
                        flex: 1, padding: '16px 20px', border: 'none', cursor: 'pointer',
                        background: isActive
                            ? `linear-gradient(180deg, ${team.color}14 0%, transparent 100%)`
                            : 'transparent',
                        borderBottom: isActive ? `3px solid ${team.color}` : '3px solid transparent',
                        color: isActive ? team.color : 'var(--text-secondary)',
                        transition: 'all 0.2s', marginBottom: -1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                        <TeamLogo teamId={tid} size={22} />
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: 0.5 }}>
                            {tid}
                        </span>
                        {s && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                                <span style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: isActive ? 'var(--text-md)' : 'var(--text-base)', letterSpacing: 1,
                                    color: isActive ? team.color : 'var(--text-muted)',
                                }}>
                                    {s.score}/{s.wickets}
                                </span>
                                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    ({s.overs})
                                </span>
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ── Player row (entry form) ───────────────────────────────────────────────
function PlayerRow({ player, entry, onChange, sectionTab }) {
    const set = (k, v) => onChange({ ...entry, [k]: v })
    const inp = (k, placeholder, type = 'number', width = 64) => (
        <input
            type={type} placeholder={placeholder} value={entry[k]}
            onChange={e => set(k, e.target.value)}
            style={{
                width, background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: 6,
                padding: '5px 8px', color: 'var(--text-primary)', fontSize: 12, outline: 'none',
                textAlign: 'center', boxSizing: 'border-box',
            }}
            onFocus={e  => (e.target.style.borderColor = '#f97316')}
            onBlur={e   => (e.target.style.borderColor = 'var(--border-input)')}
        />
    )

    return (
        <tr style={{ borderTop: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {/* Player name + role */}
            <td style={{ padding: '10px 12px', minWidth: 140 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                    {player.name}
                </div>
                <div title={ROLE_LABELS[player.role]} style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    color: ROLE_COLORS[player.role], marginTop: 3 }}>
                    {player.role}
                </div>
            </td>

            {sectionTab === 'batting' && <>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('runs',   '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('balls',  '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('fours',  '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('sixes',  '0')}</td>
                <td style={{ padding: '8px 6px' }}>
                    <select value={entry.dismissal} onChange={e => set('dismissal', e.target.value)}
                            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: 6,
                                padding: '5px 6px', color: 'var(--text-primary)', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
                        {DISMISSALS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </td>
            </>}

            {sectionTab === 'bowling' && <>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('oversBowled',  '0.0', 'number', 72)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('wickets',      '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('runsConceded', '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
                    {entry.oversBowled && entry.runsConceded
                        ? (parseFloat(entry.runsConceded) / parseFloat(entry.oversBowled)).toFixed(2)
                        : '—'}
                </td>
            </>}

            {sectionTab === 'fielding' && <>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('catches',  '0')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{inp('runOuts',  '0')}</td>
            </>}
        </tr>
    )
}

// ── Add player inline ────────────────────────────────────────────────────
function AddPlayerInline({ teamId, onAdded }) {
    const [open,   setOpen]   = useState(false)
    const [name,   setName]   = useState('')
    const [role,   setRole]   = useState('BAT')
    const [saving, setSaving] = useState(false)

    const handleAdd = async () => {
        if (!name.trim()) { toast.error('Enter player name'); return }
        setSaving(true)
        try {
            const p = await createPlayer({ name: name.trim(), teamId, role })
            toast.success(`${p.name} added`)
            setName(''); setOpen(false)
            onAdded(p)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add player')
        } finally {
            setSaving(false)
        }
    }

    if (!open) return (
        <button onClick={() => setOpen(true)} style={{
            background: 'none', border: '1px dashed var(--border-input)', borderRadius: 8, color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 12, padding: '8px 14px', width: '100%',
            marginTop: 8, transition: 'border-color 0.2s, color 0.2s',
        }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
            + Add player to {teamId}
        </button>
    )

    return (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '10px 12px',
            background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border-input)', flexWrap: 'wrap' }}>
            <input
                autoFocus placeholder="Player name"
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ flex: '1 1 140px', background: 'var(--bg-elevated)', border: '1px solid var(--border-input)',
                    borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
            />
            <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 6,
                        padding: '6px 8px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <Button variant="primary" onClick={handleAdd} disabled={saving} style={{ padding: '6px 14px', fontSize: 12 }}>
                {saving ? '…' : 'Add'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} style={{ padding: '6px 10px', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center' }}>
                <X size={14} strokeWidth={2} />
            </Button>
        </div>
    )
}

// ── Read-only scorecard view ──────────────────────────────────────────────
// ── Format dismissal with bowler / catcher names ──────────────────────────
function fmtDismissal(e) {
    const d = e.dismissal
    if (!d || d === 'not out') return { label: 'not out', detail: null }
    const b = e.dismissedByName
    const c = e.caughtByName
    switch (d) {
        case 'bowled':          return { label: 'b.', detail: b }
        case 'lbw':             return { label: 'lbw b.', detail: b }
        case 'caught':          return { label: c ? `c. ${c}` : 'caught', detail: b ? `b. ${b}` : null }
        case 'caught and bowled': return { label: 'c&b', detail: b }
        case 'stumped':         return { label: c ? `st. ${c}` : 'stumped', detail: b ? `b. ${b}` : null }
        case 'run out':         return { label: 'run out', detail: c ? `(${c})` : null }
        case 'hit wicket':      return { label: 'hit wkt b.', detail: b }
        case 'retired hurt':    return { label: 'retired hurt', detail: null }
        default:                return { label: d, detail: null }
    }
}

// Compute innings summary (score/wickets/overs) for a given batting team
function _inningsSummary(entries, battingTeam, teams) {
    const oversToBalls = (o) => { const f = Math.floor(o); return f * 6 + Math.round((o - f) * 10) }
    const batted    = entries.filter(e => e.teamId === battingTeam && (e.balls != null || e.runs != null))
    const oppTeam   = battingTeam === teams[0] ? teams[1] : teams[0]
    const oppBowlers= entries.filter(e => e.teamId === oppTeam && e.oversBowled != null)
    if (batted.length === 0 && oppBowlers.length === 0) return null

    const totalBalls   = oppBowlers.reduce((s, e) => s + oversToBalls(e.oversBowled ?? 0), 0)
    const wides        = oppBowlers.reduce((s, e) => s + (e.wides   ?? 0), 0)
    const noBalls      = oppBowlers.reduce((s, e) => s + (e.noBalls ?? 0), 0)
    const byes         = oppBowlers.reduce((s, e) => s + (e.byes    ?? 0), 0)
    const legByes      = oppBowlers.reduce((s, e) => s + (e.legByes ?? 0), 0)
    const battingRuns  = batted.reduce((s, e) => s + (e.runs ?? 0), 0)
    const score        = battingRuns + wides + noBalls + byes + legByes
    const wickets      = batted.filter(e => e.dismissal && e.dismissal !== 'not out').length
    const overs        = totalBalls > 0 ? `${Math.floor(totalBalls / 6)}.${totalBalls % 6}` : null
    return { score, wickets, overs }
}

export function ScorecardView({ entries, teams, captains = {} }) {
    const [teamTab,    setTeamTab]    = useState(teams[0])
    const [sectionTab, setSectionTab] = useState('batting')

    // Pre-compute summaries for both teams (used in tab labels)
    const tabSummaries = Object.fromEntries(
        teams.map(t => [t, _inningsSummary(entries, t, teams)]).filter(([, s]) => s)
    )

    const teamEntries = entries.filter(e => e.teamId === teamTab)

    // ── Per-tab filtered sets ──────────────────────────────────────────────
    const battedEntries   = teamEntries
        .filter(e => e.balls != null || e.runs != null)
        .sort((a, b) => {
            if (a.battingPosition != null && b.battingPosition != null) return a.battingPosition - b.battingPosition
            if (a.battingPosition != null) return -1
            if (b.battingPosition != null) return 1
            return 0
        })
    const yetToBatEntries = teamEntries.filter(e => e.balls == null && e.runs == null)
    // If 11 batters already recorded, suppress "yet to bat" (impact player slot)
    const showYetToBat    = battedEntries.length < 11 && yetToBatEntries.length > 0

    const bowlingEntries  = teamEntries
        .filter(e => e.oversBowled != null)
        .sort((a, b) => {
            if (a.bowlingOrder != null && b.bowlingOrder != null) return a.bowlingOrder - b.bowlingOrder
            if (a.bowlingOrder != null) return -1   // import entries first
            if (b.bowlingOrder != null) return 1
            return 0
        })
    const fieldingEntries = teamEntries.filter(e => (e.catches ?? 0) > 0 || (e.runOuts ?? 0) > 0)

    // ── Innings totals (batting summary banner) ────────────────────────────
    // Extras + overs come from the OPPOSING team's bowlers (they bowl against teamTab)
    const opposingTeam   = teamTab === teams[0] ? teams[1] : teams[0]
    const oppBowlers     = entries.filter(e => e.teamId === opposingTeam && e.oversBowled != null)

    // Convert cricket overs (4.3 = 4 full overs + 3 balls) to total balls
    const oversToBalls = (o) => { const f = Math.floor(o); return f * 6 + Math.round((o - f) * 10) }
    const totalBalls   = oppBowlers.reduce((s, e) => s + oversToBalls(e.oversBowled ?? 0), 0)
    const oversDisplay = totalBalls > 0 ? `${Math.floor(totalBalls / 6)}.${totalBalls % 6}` : null

    const totalWides   = oppBowlers.reduce((s, e) => s + (e.wides   ?? 0), 0)
    const totalNoBalls = oppBowlers.reduce((s, e) => s + (e.noBalls ?? 0), 0)
    const totalByes    = oppBowlers.reduce((s, e) => s + (e.byes    ?? 0), 0)
    const totalLegByes = oppBowlers.reduce((s, e) => s + (e.legByes ?? 0), 0)
    const totalExtras  = totalWides + totalNoBalls + totalByes + totalLegByes

    const battingRuns  = battedEntries.reduce((s, e) => s + (e.runs ?? 0), 0)
    const totalScore   = battingRuns + totalExtras
    const wickets      = battedEntries.filter(e => e.dismissal && e.dismissal !== 'not out').length
    const runRate      = totalBalls > 0 ? (totalScore / (totalBalls / 6)).toFixed(2) : null

    const showInningsSummary = battedEntries.length > 0

    const SECTION_TABS = [
        { id: 'batting',  label: 'Batting',  Icon: Activity },
        { id: 'bowling',  label: 'Bowling',  Icon: Zap },
        { id: 'fielding', label: 'Fielding', Icon: ShieldCheck },
    ]

    const activeRows = sectionTab === 'batting'  ? battedEntries
                     : sectionTab === 'bowling'  ? bowlingEntries
                     :                             fieldingEntries

    const currentTeamColor = getTeam(teamTab).color

    return (
        <div>
            {/* ── Team tab strip ── */}
            <TeamTabs
                teams={teams}
                active={teamTab}
                onChange={t => { setTeamTab(t); setSectionTab('batting') }}
                summaries={tabSummaries}
            />

            {/* ── Section tabs (Batting / Bowling / Fielding) ── */}
            <div style={{ padding: '16px 20px 14px', display: 'flex', gap: 8 }}>
                {SECTION_TABS.map(s => (
                    <button key={s.id} onClick={() => setSectionTab(s.id)} style={{
                        padding: '7px 20px', borderRadius: 20,
                        border: sectionTab === s.id ? 'none' : '1px solid var(--border-subtle)',
                        cursor: 'pointer', fontSize: 'var(--text-sm)',
                        fontWeight: 700, fontFamily: 'var(--font-body)', letterSpacing: 0.5,
                        background: sectionTab === s.id
                            ? 'linear-gradient(135deg,#f97316,#dc2626)'
                            : 'var(--bg-subtle)',
                        color: sectionTab === s.id ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        boxShadow: sectionTab === s.id ? '0 3px 14px rgba(249,115,22,0.38)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <s.Icon size={14} strokeWidth={2} />
                        {s.label}
                    </button>
                ))}
            </div>

            {/* ── Innings summary banner (batting tab only) ── */}
            {sectionTab === 'batting' && showInningsSummary && (
                <div style={{
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 24px',
                    padding: '12px 20px',
                    background: `linear-gradient(90deg, ${currentTeamColor}18 0%, transparent 65%)`,
                    borderTop: `2px solid ${currentTeamColor}44`,
                    borderBottom: '1px solid var(--border-subtle)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{
                            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
                            letterSpacing: 1, color: 'var(--text-primary)',
                            animation: 'scoreFlash 0.35s ease both',
                        }}>
                            {totalScore}/{wickets}
                        </span>
                        {oversDisplay && (
                            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {oversDisplay} ov
                                {runRate && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· RR {runRate}</span>}
                            </span>
                        )}
                    </div>
                    {totalExtras > 0 && (() => {
                        const parts = []
                        if (totalWides   > 0) parts.push(`W: ${totalWides}`)
                        if (totalNoBalls > 0) parts.push(`NB: ${totalNoBalls}`)
                        if (totalByes    > 0) parts.push(`B: ${totalByes}`)
                        if (totalLegByes > 0) parts.push(`LB: ${totalLegByes}`)
                        return (
                            <div style={{
                                marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)',
                                background: 'var(--bg-subtle)', borderRadius: 6,
                                padding: '4px 11px', border: '1px solid var(--border-subtle)',
                            }}>
                                Extras <strong style={{ color: 'var(--text-secondary)' }}>{totalExtras}</strong>
                                <span style={{ color: 'var(--border-input)', margin: '0 5px' }}>·</span>
                                {parts.join(' · ')}
                            </div>
                        )
                    })()}
                </div>
            )}

            {/* ── Empty states ── */}
            {teamEntries.length === 0 && (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                    No data for {teamTab}
                </div>
            )}
            {teamEntries.length > 0 && activeRows.length === 0 && (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                    No {sectionTab} data recorded
                </div>
            )}

            {/* ── Stats table ── */}
            {activeRows.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-subtle)' }}>
                            <th style={{ ...thStyle('left'), paddingLeft: 20 }}>Player</th>
                            {sectionTab === 'batting'  && ['Runs','Balls','4s','6s','SR','Dismissal'].map((h,i) => <th key={i} style={i === 5 ? { ...thStyle('left'), paddingRight: 20 } : thStyle()}>{h}</th>)}
                            {sectionTab === 'bowling'  && ['Overs','Wickets','Runs','Economy'].map((h,i)        => <th key={i} style={thStyle()}>{h}</th>)}
                            {sectionTab === 'fielding' && ['Catches','Run Outs'].map((h,i)                      => <th key={i} style={thStyle()}>{h}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {activeRows.map((e, idx) => (
                            <tr key={e.statsId}
                                style={{
                                    borderTop: '1px solid var(--border-subtle)',
                                    transition: 'background 0.15s',
                                    animation: `rowIn 0.22s ease ${idx * 0.03}s both`,
                                }}
                                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                            >
                                {/* Player name cell */}
                                <td style={{ padding: '12px 12px 10px 20px', minWidth: 160 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                        {e.playerName}
                                        {captains[teamTab] === e.playerId && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, color: '#f59e0b',
                                                background: 'rgba(245,158,11,0.15)',
                                                border: '1px solid rgba(245,158,11,0.4)',
                                                borderRadius: 4, padding: '1px 5px', letterSpacing: 0.5,
                                            }}>C</span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                                        color: ROLE_COLORS[e.role], marginTop: 3, textTransform: 'uppercase',
                                    }}>{e.role}</div>
                                </td>

                                {/* ── Batting columns ── */}
                                {sectionTab === 'batting' && (() => {
                                    const dis = fmtDismissal(e)
                                    const isNotOut = dis.label === 'not out'
                                    const runsColor = e.runs >= 100 ? '#fbbf24'
                                        : e.runs >= 50 ? '#f97316'
                                        : e.runs >= 30 ? '#22c55e'
                                        : 'var(--text-primary)'
                                    return (<>
                                        {/* Runs with milestone badge */}
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', color: runsColor }}>
                                                    {e.runs ?? '—'}
                                                </span>
                                                {e.runs >= 100 && (
                                                    <span style={{ fontSize: 8, background: '#fbbf2422', border: '1px solid #fbbf2466', color: '#fbbf24', borderRadius: 3, padding: '1px 4px', fontWeight: 700 }}>100</span>
                                                )}
                                                {e.runs >= 50 && e.runs < 100 && (
                                                    <span style={{ fontSize: 8, background: '#f9731622', border: '1px solid #f9731666', color: '#f97316', borderRadius: 3, padding: '1px 4px', fontWeight: 700 }}>50</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={tdStyle()}>{e.balls ?? '—'}</td>
                                        <td style={{ ...tdStyle('#22c55e'), fontWeight: 700 }}>{e.fours ?? '—'}</td>
                                        <td style={{ ...tdStyle('#f97316'), fontWeight: 700 }}>{e.sixes ?? '—'}</td>
                                        <td style={tdStyle()}>{e.strikeRate?.toFixed(1) ?? '—'}</td>
                                        <td style={{ padding: '10px 20px 10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            <span style={{ color: isNotOut ? '#22c55e' : 'var(--text-secondary)', fontWeight: isNotOut ? 700 : 500 }}>
                                                {dis.label}
                                            </span>
                                            {dis.detail && (
                                                <span style={{ color: 'var(--text-muted)', marginLeft: 5 }}>{dis.detail}</span>
                                            )}
                                        </td>
                                    </>)
                                })()}

                                {/* ── Bowling columns ── */}
                                {sectionTab === 'bowling' && <>
                                    <td style={tdStyle()}>{e.oversBowled ?? '—'}</td>
                                    {/* Wickets with milestone badge */}
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                            <span style={{
                                                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)',
                                                color: e.wickets >= 5 ? '#fbbf24' : e.wickets >= 3 ? '#8b5cf6' : 'var(--text-primary)',
                                            }}>
                                                {e.wickets ?? '—'}
                                            </span>
                                            {e.wickets >= 5 && (
                                                <span style={{ fontSize: 8, background: '#fbbf2422', border: '1px solid #fbbf2466', color: '#fbbf24', borderRadius: 3, padding: '1px 4px', fontWeight: 700 }}>5W</span>
                                            )}
                                            {(e.wickets === 3 || e.wickets === 4) && (
                                                <span style={{ fontSize: 8, background: '#8b5cf622', border: '1px solid #8b5cf666', color: '#8b5cf6', borderRadius: 3, padding: '1px 4px', fontWeight: 700 }}>{e.wickets}W</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle()}>{e.runsConceded ?? '—'}</td>
                                    <td style={tdStyle(e.economy < 7 ? '#22c55e' : e.economy < 9 ? 'var(--text-primary)' : '#ef4444')}>
                                        {e.economy?.toFixed(2) ?? '—'}
                                    </td>
                                </>}

                                {/* ── Fielding columns ── */}
                                {sectionTab === 'fielding' && <>
                                    <td style={tdStyle('#3b82f6', true)}>{e.catches ?? '—'}</td>
                                    <td style={tdStyle('#3b82f6', true)}>{e.runOuts ?? '—'}</td>
                                </>}
                            </tr>
                        ))}

                        {/* Yet to bat row */}
                        {sectionTab === 'batting' && showYetToBat && (
                            <tr style={{ borderTop: '2px dashed var(--border-subtle)' }}>
                                <td colSpan={7} style={{ padding: '12px 20px' }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                                        textTransform: 'uppercase', letterSpacing: 1.2,
                                        background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                                        borderRadius: 4, padding: '2px 7px', marginRight: 10,
                                    }}>Yet to bat</span>
                                    {yetToBatEntries.map((e, i) => (
                                        <span key={e.statsId} style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                            {i > 0 && <span style={{ color: 'var(--border-input)', margin: '0 5px' }}>·</span>}
                                            {e.playerName}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const thStyle = (align = 'center') => ({
    padding: '10px 12px', textAlign: align,
    color: 'var(--text-muted)', fontSize: 'var(--text-xs)',
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 1.8, whiteSpace: 'nowrap',
    fontFamily: 'var(--font-body)',
})
const tdStyle = (color = 'var(--text-primary)', bold = false) => ({
    padding: '10px 12px', textAlign: 'center', color,
    fontFamily: bold ? 'var(--font-heading)' : 'inherit',
    fontSize: bold ? 'var(--text-md)' : 'var(--text-base)', fontWeight: bold ? 400 : 600,
})

// ── Entry form (edit mode) ────────────────────────────────────────────────
export function ScorecardEntry({ matchId, teams, onSaved }) {
    const [squadA,       setSquadA]       = useState([])
    const [squadB,       setSquadB]       = useState([])
    const [entries,      setEntries]      = useState({})
    const [selected,     setSelected]     = useState({})
    const [teamTab,      setTeamTab]      = useState(teams[0])
    const [sectionTab,   setSectionTab]   = useState('batting')
    const [loadingSquad, setLoadingSquad] = useState(true)
    const [saving,       setSaving]       = useState(false)
    const [showImport,   setShowImport]   = useState(false)
    const [confirmSave,  setConfirmSave]  = useState(false)

    const currentSquad = teamTab === teams[0] ? squadA : squadB

    // Load squads + existing scorecard
    useEffect(() => {
        const load = async () => {
            setLoadingSquad(true)
            try {
                const [sA, sB, existing] = await Promise.all([
                    getSquad(teams[0]),
                    getSquad(teams[1]),
                    getScorecard(matchId),
                ])
                setSquadA(sA)
                setSquadB(sB)

                // Pre-fill from existing scorecard
                const initEntries = {}
                const initSelected = {}
                existing.forEach(e => {
                    initSelected[e.playerId] = true
                    initEntries[e.playerId] = {
                        playerId:     e.playerId,
                        runs:         e.runs         ?? '',
                        balls:        e.balls        ?? '',
                        fours:        e.fours        ?? '',
                        sixes:        e.sixes        ?? '',
                        dismissal:    e.dismissal    ?? 'not out',
                        oversBowled:  e.oversBowled  ?? '',
                        wickets:      e.wickets      ?? '',
                        runsConceded: e.runsConceded ?? '',
                        catches:      e.catches      ?? '',
                        runOuts:      e.runOuts      ?? '',
                    }
                })
                // Ensure all squad players have an empty entry ready
                ;[...sA, ...sB].forEach(p => {
                    if (!initEntries[p.id]) initEntries[p.id] = emptyEntry(p.id)
                })
                setEntries(initEntries)
                setSelected(initSelected)
            } catch {
                toast.error('Failed to load squad data')
            } finally {
                setLoadingSquad(false)
            }
        }
        load()
    }, [matchId, teams[0], teams[1]])

    const togglePlayer = (id) => {
        setSelected(s => ({ ...s, [id]: !s[id] }))
        if (!entries[id]) setEntries(e => ({ ...e, [id]: emptyEntry(id) }))
    }

    const updateEntry = (id, updated) => {
        setEntries(e => ({ ...e, [id]: updated }))
    }

    const handlePlayerAdded = (newPlayer, squad, setSquad) => {
        setSquad([...squad, newPlayer])
        setEntries(e => ({ ...e, [newPlayer.id]: emptyEntry(newPlayer.id) }))
        setSelected(s => ({ ...s, [newPlayer.id]: true }))
    }

    const handleSave = async () => {
        const payload = Object.entries(selected)
            .filter(([, v]) => v)
            .map(([id]) => toPayload(entries[id]))
            .filter(e => e.playerId)

        if (!payload.length) { toast.error('Select at least one player'); return }

        setSaving(true)
        try {
            await saveScorecard(matchId, payload)
            toast.success('Scorecard saved!')
            onSaved()
        } catch {
            toast.error('Failed to save scorecard')
        } finally {
            setSaving(false)
        }
    }

    if (loadingSquad) return (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div>
    )

    const SECTION_TABS = [
        { id: 'batting',  label: 'Batting',  Icon: Activity },
        { id: 'bowling',  label: 'Bowling',  Icon: Zap },
        { id: 'fielding', label: 'Fielding', Icon: ShieldCheck },
    ]

    const selectedPlayers = currentSquad.filter(p => selected[p.id])

    return (
        <div>
            <TeamTabs teams={teams} active={teamTab} onChange={t => { setTeamTab(t); setSectionTab('batting') }} />

            {/* Player selector chips */}
            <div style={{ padding: '14px 0 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                    Select players in this match
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentSquad.map(p => {
                        const isOn = !!selected[p.id]
                        const team = getTeam(p.teamId)
                        return (
                            <button key={p.id} onClick={() => togglePlayer(p.id)} style={{
                                padding: '5px 12px', borderRadius: 20, border: `1px solid ${isOn ? team.color : 'var(--border-input)'}`,
                                background: isOn ? team.color + '22' : 'transparent',
                                color: isOn ? team.color : 'var(--text-secondary)', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                            }}>{p.name}</button>
                        )
                    })}
                </div>
                <AddPlayerInline
                    teamId={teamTab}
                    onAdded={p => handlePlayerAdded(p,
                        teamTab === teams[0] ? squadA : squadB,
                        teamTab === teams[0] ? setSquadA : setSquadB
                    )}
                />
            </div>

            {/* Section tabs */}
            {selectedPlayers.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                    {SECTION_TABS.map(s => (
                        <button key={s.id} onClick={() => setSectionTab(s.id)} style={{
                            padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
                            fontWeight: 600, fontFamily: 'var(--font-body)',
                            background: sectionTab === s.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'var(--border-subtle)',
                            color: sectionTab === s.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <s.Icon size={13} strokeWidth={2} />
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats table */}
            {selectedPlayers.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    Select players above to enter their stats
                </div>
            )}

            {selectedPlayers.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: 'var(--bg-subtle)' }}>
                            <th style={thStyle('left')}>Player</th>
                            {sectionTab === 'batting'  && ['Runs','Balls','4s','6s','Dismissal'].map((h,i) => <th key={i} style={thStyle()}>{h}</th>)}
                            {sectionTab === 'bowling'  && ['Overs','Wickets','Runs','Economy'].map((h,i)   => <th key={i} style={thStyle()}>{h}</th>)}
                            {sectionTab === 'fielding' && ['Catches','Run Outs'].map((h,i)                  => <th key={i} style={thStyle()}>{h}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {selectedPlayers.map(p => (
                            <PlayerRow
                                key={p.id}
                                player={p}
                                entry={entries[p.id] || emptyEntry(p.id)}
                                onChange={updated => updateEntry(p.id, updated)}
                                sectionTab={sectionTab}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save / Import row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 16, borderTop: '1px solid var(--border-subtle)', marginTop: 12, gap: 10, flexWrap: 'wrap' }}>

                {/* Import from JSON button */}
                <button onClick={() => setShowImport(true)} style={{
                    padding: '8px 18px', borderRadius: 8, border: `1px solid ${TEAL}`,
                    background: `${TEAL}15`, color: TEAL, cursor: 'pointer',
                    fontWeight: 600, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${TEAL}30` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${TEAL}15` }}
                >
                    <FileJson size={16} strokeWidth={2} /> Import from JSON
                </button>

                <Button variant="primary" onClick={() => setConfirmSave(true)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save size={16} strokeWidth={2} />{saving ? 'Saving…' : 'Save Scorecard'}
                </Button>
            </div>

            {/* Inline save confirmation banner */}
            {confirmSave && (
                <div style={{
                    marginTop: 12, padding: '14px 18px', borderRadius: 10,
                    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                        <span style={{ fontWeight: 700, color: '#f97316' }}>Confirm save?</span>
                        {' '}This will overwrite any existing scorecard stats for this match.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setConfirmSave(false)} style={{
                            padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border-input)',
                            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                            fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-body)',
                        }}>Cancel</button>
                        <button onClick={() => { setConfirmSave(false); handleSave() }} style={{
                            padding: '6px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: 'pointer',
                            fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-body)',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}><Save size={14} strokeWidth={2} /> Confirm Save</button>
                    </div>
                </div>
            )}

            {/* Scorecard Import Modal */}
            {showImport && (
                <ScorecardImportModal
                    matchId={matchId}
                    team1={teams[0]}
                    team2={teams[1]}
                    onImported={() => { setShowImport(false); onSaved() }}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    )
}

// ── Main Scorecard Modal ──────────────────────────────────────────────────
export default function ScorecardModal({ match, onClose, isAdmin = false, openImportDirectly = false }) {
    const [mode,    setMode]    = useState('loading')  // loading | view | edit | import
    const [entries, setEntries] = useState([])

    const teams = [match.team1, match.team2]

    useEffect(() => {
        getScorecard(match.id)
            .then(data => {
                setEntries(data)
                if (openImportDirectly) {
                    setMode('import')
                } else {
                    setMode(data.length > 0 ? 'view' : isAdmin ? 'edit' : 'view')
                }
            })
            .catch(() => {
                if (openImportDirectly) setMode('import')
                else setMode(isAdmin ? 'edit' : 'view')
            })
    }, [match.id])

    const handleSaved = () => {
        // Reload entries then switch to view mode
        getScorecard(match.id).then(data => {
            setEntries(data)
            setMode('view')
        })
    }

    const handleDeleteScorecard = async () => {
        if (!window.confirm('Delete the entire scorecard for this match? The match itself will remain.')) return
        try {
            await deleteScorecard(match.id)
            setEntries([])
            setMode(isAdmin ? 'edit' : 'view')
            toast.success('Scorecard deleted')
        } catch {
            toast.error('Failed to delete scorecard')
        }
    }

    // If import mode was opened directly (from Matches.jsx), show the import modal
    if (mode === 'import') {
        return (
            <ScorecardImportModal
                matchId={match.id}
                team1={match.team1}
                team2={match.team2}
                matchNo={match.matchNo}
                date={match.date}
                onImported={handleSaved}
                onClose={onClose}
            />
        )
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 16,
                width: '100%', maxWidth: 780, maxHeight: '90vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'fadeUp 0.2s ease',
            }} onClick={e => e.stopPropagation()}>

                {/* Modal header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)', letterSpacing: 1.5, color: '#f97316' }}>
                            Scorecard
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {match.team1} vs {match.team2}
                            {match.matchNo ? ` · Match ${match.matchNo}` : ''}
                            {match.date ? ` · ${formatDate(match.date)}` : ''}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {mode === 'view' && isAdmin && (
                            <Button variant="ghost" onClick={() => setMode('edit')} style={{ fontSize: 'var(--text-sm)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Pencil size={14} strokeWidth={2} /> Edit
                            </Button>
                        )}
                        {isAdmin && entries.length > 0 && (
                            <Button
                                variant="ghost"
                                onClick={handleDeleteScorecard}
                                style={{ fontSize: 'var(--text-sm)', padding: '6px 14px', color: '#ef4444', borderColor: '#ef444440', display: 'flex', alignItems: 'center', gap: 5 }}
                            >
                                <Trash2 size={14} strokeWidth={2} /> Delete Scorecard
                            </Button>
                        )}
                        {mode === 'edit' && entries.length > 0 && (
                            <Button variant="ghost" onClick={() => setMode('view')} style={{ fontSize: 'var(--text-sm)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Eye size={14} strokeWidth={2} /> View
                            </Button>
                        )}
                        <button onClick={onClose} style={{
                            background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8,
                            color: 'var(--text-secondary)', cursor: 'pointer', width: 34, height: 34,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Modal body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
                    {mode === 'loading' && (
                        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                    )}
                    {mode === 'view' && (
                        <ScorecardView entries={entries} teams={teams} />
                    )}
                    {mode === 'edit' && (
                        <ScorecardEntry matchId={match.id} teams={teams} onSaved={handleSaved} />
                    )}
                </div>
            </div>
        </div>
    )
}