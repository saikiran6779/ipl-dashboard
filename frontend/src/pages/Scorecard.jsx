import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Spinner, Button, Input, Select, TeamLogo } from '../components/UI'
import { getSquad, getScorecard, saveScorecard, createPlayer, getPlayers } from '../services/api'
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
function TeamTabs({ teams, active, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '1px solid var(--border-subtle)' }}>
            {teams.map(tid => {
                const team = getTeam(tid)
                const isActive = active === tid
                return (
                    <button key={tid} onClick={() => onChange(tid)} style={{
                        flex: 1, padding: '10px 16px', border: 'none', cursor: 'pointer',
                        background: isActive ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
                        borderBottom: isActive ? `2px solid ${team.color}` : '2px solid transparent',
                        color: isActive ? team.color : 'var(--text-secondary)',
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 1.5,
                        transition: 'all 0.2s', marginBottom: -1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        <TeamLogo teamId={tid} size={20} />
                        {tid}
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
                <div style={{ fontSize: 10, color: ROLE_COLORS[player.role], marginTop: 2 }}>
                    {ROLE_LABELS[player.role]}
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
            ＋ Add player to {teamId}
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
            <Button variant="ghost" onClick={() => setOpen(false)} style={{ padding: '6px 10px', fontSize: 12 }}>✕</Button>
        </div>
    )
}

// ── Read-only scorecard view ──────────────────────────────────────────────
function ScorecardView({ entries, teams }) {
    const [teamTab,    setTeamTab]    = useState(teams[0])
    const [sectionTab, setSectionTab] = useState('batting')

    const teamEntries = entries.filter(e => e.teamId === teamTab)

    const SECTION_TABS = [
        { id: 'batting',  label: '🏏 Batting' },
        { id: 'bowling',  label: '⚡ Bowling' },
        { id: 'fielding', label: '🧤 Fielding' },
    ]

    return (
        <div>
            <TeamTabs teams={teams} active={teamTab} onChange={t => { setTeamTab(t); setSectionTab('batting') }} />
            <div style={{ padding: '14px 0 8px', display: 'flex', gap: 4 }}>
                {SECTION_TABS.map(s => (
                    <button key={s.id} onClick={() => setSectionTab(s.id)} style={{
                        padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                        fontWeight: 600, fontFamily: 'DM Sans,sans-serif',
                        background: sectionTab === s.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'var(--border-subtle)',
                        color: sectionTab === s.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                    }}>{s.label}</button>
                ))}
            </div>

            {teamEntries.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No data for {teamTab}
                </div>
            )}

            {teamEntries.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: 'var(--bg-subtle)' }}>
                            <th style={thStyle('left')}>Player</th>
                            {sectionTab === 'batting'  && ['Runs','Balls','4s','6s','SR','Dismissal'].map((h,i) => <th key={i} style={thStyle()}>{h}</th>)}
                            {sectionTab === 'bowling'  && ['Overs','Wickets','Runs','Economy'].map((h,i)         => <th key={i} style={thStyle()}>{h}</th>)}
                            {sectionTab === 'fielding' && ['Catches','Run Outs'].map((h,i)                        => <th key={i} style={thStyle()}>{h}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {teamEntries.map(e => (
                            <tr key={e.statsId} style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '10px 12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{e.playerName}</div>
                                    <div style={{ fontSize: 10, color: ROLE_COLORS[e.role] }}>{ROLE_LABELS[e.role]}</div>
                                </td>
                                {sectionTab === 'batting' && <>
                                    <td style={tdStyle(e.runs >= 50 ? '#f97316' : e.runs >= 30 ? '#22c55e' : 'var(--text-primary)', true)}>{e.runs ?? '—'}</td>
                                    <td style={tdStyle()}>{e.balls ?? '—'}</td>
                                    <td style={tdStyle('#22c55e')}>{e.fours ?? '—'}</td>
                                    <td style={tdStyle('#f97316')}>{e.sixes ?? '—'}</td>
                                    <td style={tdStyle()}>{e.strikeRate?.toFixed(1) ?? '—'}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 11, color: e.dismissal === 'not out' ? '#22c55e' : 'var(--text-secondary)' }}>{e.dismissal ?? '—'}</td>
                                </>}
                                {sectionTab === 'bowling' && <>
                                    <td style={tdStyle()}>{e.oversBowled ?? '—'}</td>
                                    <td style={tdStyle(e.wickets >= 3 ? '#8b5cf6' : 'var(--text-primary)', true)}>{e.wickets ?? '—'}</td>
                                    <td style={tdStyle()}>{e.runsConceded ?? '—'}</td>
                                    <td style={tdStyle(e.economy < 7 ? '#22c55e' : e.economy < 9 ? 'var(--text-primary)' : '#ef4444')}>{e.economy?.toFixed(2) ?? '—'}</td>
                                </>}
                                {sectionTab === 'fielding' && <>
                                    <td style={tdStyle('#3b82f6', true)}>{e.catches ?? '—'}</td>
                                    <td style={tdStyle('#3b82f6', true)}>{e.runOuts ?? '—'}</td>
                                </>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const thStyle = (align = 'center') => ({
    padding: '9px 12px', textAlign: align, color: 'var(--text-secondary)',
    fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, whiteSpace: 'nowrap',
})
const tdStyle = (color = 'var(--text-primary)', bold = false) => ({
    padding: '10px 12px', textAlign: 'center', color,
    fontFamily: bold ? "'Bebas Neue',sans-serif" : 'inherit',
    fontSize: bold ? 18 : 13,
})

// ── Entry form (edit mode) ────────────────────────────────────────────────
function ScorecardEntry({ matchId, teams, onSaved, match, allPlayers }) {
    const [squadA,     setSquadA]     = useState([])   // team1 squad
    const [squadB,     setSquadB]     = useState([])   // team2 squad
    const [entries,    setEntries]    = useState({})   // { playerId: entryObj }
    const [selected,   setSelected]  = useState({})    // { playerId: bool } — which players are in scorecard
    const [teamTab,    setTeamTab]    = useState(teams[0])
    const [sectionTab, setSectionTab] = useState('batting')
    const [loadingSquad, setLoadingSquad] = useState(true)
    const [saving,     setSaving]     = useState(false)
    const [showImport, setShowImport] = useState(false)

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
        { id: 'batting',  label: '🏏 Batting' },
        { id: 'bowling',  label: '⚡ Bowling' },
        { id: 'fielding', label: '🧤 Fielding' },
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
                            padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                            fontWeight: 600, fontFamily: 'DM Sans,sans-serif',
                            background: sectionTab === s.id ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'var(--border-subtle)',
                            color: sectionTab === s.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                        }}>{s.label}</button>
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
                    fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${TEAL}30` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${TEAL}15` }}
                >
                    📂 Import from JSON
                </button>

                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : '💾 Save Scorecard'}
                </Button>
            </div>

            {/* Scorecard Import Modal */}
            {showImport && match && (
                <ScorecardImportModal
                    match={match}
                    allPlayers={allPlayers || []}
                    onImported={() => { setShowImport(false); onSaved() }}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    )
}

// ── Main Scorecard Modal ──────────────────────────────────────────────────
export default function ScorecardModal({ match, onClose, isAdmin = false, openImportDirectly = false }) {
    const [mode,        setMode]        = useState('loading')  // loading | view | edit | import
    const [entries,     setEntries]     = useState([])
    const [allPlayers,  setAllPlayers]  = useState([])

    const teams = [match.team1, match.team2]

    useEffect(() => {
        // Load all players for import resolution
        getPlayers().then(setAllPlayers).catch(() => {})

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

    // If import mode was opened directly (from Matches.jsx), show the import modal
    if (mode === 'import') {
        return (
            <ScorecardImportModal
                match={match}
                allPlayers={allPlayers}
                onImported={() => { handleSaved() }}
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
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: '#f97316' }}>
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
                            <Button variant="ghost" onClick={() => setMode('edit')} style={{ fontSize: 12, padding: '6px 14px' }}>
                                ✏️ Edit
                            </Button>
                        )}
                        {mode === 'edit' && entries.length > 0 && (
                            <Button variant="ghost" onClick={() => setMode('view')} style={{ fontSize: 12, padding: '6px 14px' }}>
                                👁 View
                            </Button>
                        )}
                        <button onClick={onClose} style={{
                            background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8,
                            color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', width: 34, height: 34,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    </div>
                </div>

                {/* Modal body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 20px' }}>
                    {mode === 'loading' && (
                        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                    )}
                    {mode === 'view' && (
                        <ScorecardView entries={entries} teams={teams} />
                    )}
                    {mode === 'edit' && (
                        <ScorecardEntry matchId={match.id} teams={teams} onSaved={handleSaved} match={match} allPlayers={allPlayers} />
                    )}
                </div>
            </div>
        </div>
    )
}