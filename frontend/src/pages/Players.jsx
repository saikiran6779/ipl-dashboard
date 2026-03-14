import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { TeamLogo } from '../components/UI'
import { getPlayers, createPlayer, deletePlayer } from '../services/api'
import { TEAMS, getTeam } from '../services/constants'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────────────────────
const IPL_PLACEHOLDER = 'https://documents.iplt20.com/ipl/assets/images/Default-Men.png'

// ISO 3166-1 alpha-2 codes for the flag-icons CSS library
const ISO_CODES = {
    'Indian': 'in', 'Australian': 'au', 'English': 'gb-eng',
    'South African': 'za', 'West Indian': 'tt', 'New Zealander': 'nz',
    'Sri Lankan': 'lk', 'Afghan': 'af', 'Pakistani': 'pk',
    'Bangladeshi': 'bd', 'Singaporean': 'sg', 'Zimbabwean': 'zw',
    'Namibian': 'na', 'Scottish': 'gb-sct', 'Irish': 'ie',
    'Dutch': 'nl', 'Kenyan': 'ke', 'Canadian': 'ca',
    'American': 'us', 'UAE': 'ae',
}

const BATTING_STYLES = ['Right-hand bat', 'Left-hand bat']
const BOWLING_STYLES = [
    'Right-arm fast', 'Right-arm fast-medium', 'Right-arm medium-fast',
    'Right-arm medium', 'Right-arm off-break', 'Right-arm leg-break',
    'Left-arm fast', 'Left-arm fast-medium', 'Left-arm medium-fast',
    'Left-arm orthodox', 'Left-arm chinaman',
]
const NATIONALITIES = [
    'Indian', 'Australian', 'English', 'South African', 'West Indian',
    'New Zealander', 'Sri Lankan', 'Afghan', 'Pakistani', 'Bangladeshi', 'Singaporean',
]
const ROLES = ['BAT', 'BOWL', 'ALL', 'WK']
const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }
const SORT_OPTIONS = [
    { value: 'name-asc',  label: 'Name A→Z' },
    { value: 'name-desc', label: 'Name Z→A' },
    { value: 'role',      label: 'By Role' },
]

const isOverseas = (p) => p.nationality && p.nationality !== 'Indian'

// ── Inject flag-icons CSS once ────────────────────────────────────────────
function useFlagIcons() {
    useEffect(() => {
        if (!document.getElementById('flag-icons-cdn')) {
            const link = document.createElement('link')
            link.id   = 'flag-icons-cdn'
            link.rel  = 'stylesheet'
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.11.0/css/flag-icons.min.css'
            document.head.appendChild(link)
        }
    }, [])
}

// ── Skeleton Loading Card ─────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{
            background: 'var(--bg-elevated)', borderRadius: 14,
            border: '1px solid var(--border-subtle)',
            borderTop: '4px solid var(--border-subtle)',
            overflow: 'hidden', animation: 'skeletonPulse 1.6s ease-in-out infinite',
        }}>
            <div style={{ padding: '20px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--border-subtle)' }} />
                <div style={{ width: '65%', height: 13, background: 'var(--border-subtle)', borderRadius: 6 }} />
                <div style={{ width: '50%', height: 22, background: 'var(--border-subtle)', borderRadius: 20 }} />
                <div style={{ width: '40%', height: 10, background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            </div>
            <div style={{ height: 34, background: 'var(--border-subtle)', opacity: 0.4, marginTop: 4 }} />
        </div>
    )
}

// ── Add Player Modal ──────────────────────────────────────────────────────
function AddPlayerModal({ onClose, onSaved }) {
    const [form, setForm] = useState({
        name: '', teamId: 'MI', role: 'BAT', profilePictureUrl: '',
        dateOfBirth: '', nationality: '', battingStyle: '', bowlingStyle: '',
    })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error('Player name is required'); return }
        setSaving(true)
        try {
            await createPlayer({
                ...form,
                dateOfBirth:  form.dateOfBirth  || null,
                nationality:  form.nationality  || null,
                battingStyle: form.battingStyle || null,
                bowlingStyle: form.bowlingStyle || null,
            })
            toast.success(`${form.name} added to ${form.teamId}!`)
            onSaved()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add player')
        } finally {
            setSaving(false)
        }
    }

    const inp = {
        width: '100%', boxSizing: 'border-box',
        background: 'var(--bg-input)', border: '1px solid var(--border-input)',
        borderRadius: 8, padding: '9px 12px',
        color: 'var(--text-primary)', fontSize: 13, outline: 'none',
        fontFamily: 'Rajdhani, sans-serif',
    }
    const lbl = {
        display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 16,
                padding: 28, width: '100%', maxWidth: 420, animation: 'fadeUp 0.2s ease',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color: '#f97316' }}>
                        Add Player
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={lbl}>Player Name</label>
                        <input style={inp} placeholder="e.g. Virat Kohli" value={form.name}
                            onChange={e => set('name', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={lbl}>Team</label>
                            <select style={{ ...inp, cursor: 'pointer' }} value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} – {t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={lbl}>Role</label>
                            <select style={{ ...inp, cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
                                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Nationality (optional)</label>
                        <select style={{ ...inp, cursor: 'pointer' }} value={form.nationality} onChange={e => set('nationality', e.target.value)}>
                            <option value="">— Select —</option>
                            {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={lbl}>Batting Style</label>
                            <select style={{ ...inp, cursor: 'pointer' }} value={form.battingStyle} onChange={e => set('battingStyle', e.target.value)}>
                                <option value="">— Select —</option>
                                {BATTING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={lbl}>Bowling Style</label>
                            <select style={{ ...inp, cursor: 'pointer' }} value={form.bowlingStyle} onChange={e => set('bowlingStyle', e.target.value)}>
                                <option value="">— Select —</option>
                                {BOWLING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Date of Birth (optional)</label>
                        <input type="date" style={inp} value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                    </div>
                    <div>
                        <label style={lbl}>Photo URL (optional)</label>
                        <input style={inp} placeholder="https://example.com/photo.jpg"
                            value={form.profilePictureUrl} onChange={e => set('profilePictureUrl', e.target.value)} />
                    </div>
                    {form.profilePictureUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={form.profilePictureUrl} alt="preview"
                                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-input)' }}
                                onError={e => { e.target.style.display = 'none' }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Preview</span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '9px 0', background: 'transparent', border: '1px solid var(--border-input)',
                        borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer',
                        fontSize: 13, fontFamily: 'Rajdhani, sans-serif',
                    }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} style={{
                        flex: 2, padding: '9px 0', background: 'linear-gradient(135deg,#f97316,#dc2626)',
                        border: 'none', borderRadius: 8, color: '#fff',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1,
                        fontFamily: 'Rajdhani, sans-serif',
                    }}>{saving ? 'Adding…' : 'Add Player'}</button>
                </div>
            </div>
        </div>
    )
}

// ── Premium Player Card ────────────────────────────────────────────────────
function PlayerCard({ player, idx, onOpenProfile, onOpenTeam, onDelete, isAdmin }) {
    const team = getTeam(player.teamId)
    const [hover,     setHover]     = useState(false)
    const [imgFailed, setImgFailed] = useState(false)
    const overseas = isOverseas(player)
    const isoCode  = ISO_CODES[player.nationality]
    const showImg  = !!(player.profilePictureUrl && !imgFailed)

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: `linear-gradient(180deg, ${team.color}22 0%, var(--bg-elevated) 55%)`,
                border: `1px solid ${hover ? team.color + '77' : 'var(--border-subtle)'}`,
                borderTopWidth: 4,
                borderTopColor: team.color,
                borderRadius: 14, cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                transform: hover ? 'translateY(-4px)' : 'none',
                boxShadow: hover ? `0 8px 28px ${team.color}44` : 'none',
                position: 'relative', overflow: 'hidden',
                animation: `fadeUp 0.35s ease ${idx * 0.03}s both`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
            onClick={() => onOpenProfile(player.id)}
        >
            {/* watermark team logo */}
            <div style={{
                position: 'absolute', bottom: 38, right: -10,
                width: 72, height: 72, opacity: 0.12, pointerEvents: 'none',
            }}>
                <TeamLogo teamId={player.teamId} size={72} />
            </div>

            {/* main content */}
            <div style={{ padding: '20px 14px 10px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* avatar */}
                <div style={{ position: 'relative', marginBottom: 2 }}>
                    <div style={{
                        width: 96, height: 96, borderRadius: '50%',
                        border: `3px solid ${team.color}`,
                        boxShadow: hover ? `0 0 20px ${team.color}66` : `0 0 0 4px ${team.color}22`,
                        overflow: 'hidden', background: `${team.color}22`,
                        transition: 'box-shadow 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {showImg ? (
                            <img
                                src={player.profilePictureUrl}
                                alt={player.name}
                                onError={() => setImgFailed(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{
                                fontFamily: "'Bebas Neue',sans-serif", fontSize: 40,
                                color: team.color, lineHeight: 1,
                            }}>
                                {player.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* overseas flight badge */}
                    {overseas && (
                        <div title={`Overseas · ${player.nationality}`} style={{
                            position: 'absolute', top: -2, right: -2,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#f97316,#dc2626)',
                            border: '2px solid var(--bg-elevated)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, lineHeight: 1,
                        }}>✈️</div>
                    )}
                </div>

                {/* player name */}
                <div style={{
                    fontWeight: 700, fontSize: 13, color: 'var(--text-primary)',
                    textAlign: 'center', lineHeight: 1.3, width: '100%',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>{player.name}</div>

                {/* role pill */}
                <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: ROLE_COLORS[player.role],
                    background: ROLE_COLORS[player.role] + '20',
                    border: `1px solid ${ROLE_COLORS[player.role]}44`,
                    borderRadius: 20, padding: '3px 12px',
                }}>{ROLE_LABELS[player.role]}</div>

                {/* team chip + flag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        onClick={e => { e.stopPropagation(); onOpenTeam(player.teamId) }}
                        title={team.name}
                        style={{
                            fontSize: 10, fontWeight: 700, color: team.color,
                            background: team.color + '22', border: `1px solid ${team.color}33`,
                            borderRadius: 10, padding: '2px 8px', cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = team.color + '44'}
                        onMouseLeave={e => e.currentTarget.style.background = team.color + '22'}
                    >{player.teamId}</span>
                    {isoCode ? (
                        <span
                            className={`fi fi-${isoCode}`}
                            title={player.nationality}
                            style={{ width: 16, height: 12, display: 'inline-block', borderRadius: 2, flexShrink: 0 }}
                        />
                    ) : player.nationality ? (
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>
                            {player.nationality.substring(0, 3).toUpperCase()}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* hover action bar */}
            <div style={{
                width: '100%', height: 34, display: 'flex', flexShrink: 0,
                background: `linear-gradient(180deg, transparent, ${team.color}18)`,
                borderTop: `1px solid ${team.color}22`,
                opacity: hover ? 1 : 0, transition: 'opacity 0.2s',
            }}>
                <button
                    onClick={e => { e.stopPropagation(); onOpenProfile(player.id) }}
                    style={{
                        flex: 1, border: 'none', background: 'transparent',
                        color: team.color, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif',
                    }}
                >View Profile</button>
                {isAdmin && <>
                    <div style={{ width: 1, background: team.color + '33', margin: '5px 0' }} />
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(player) }}
                        style={{
                            width: 34, border: 'none', background: 'transparent',
                            color: '#ef4444', fontSize: 13, cursor: 'pointer',
                        }}
                        title="Remove player"
                    >✕</button>
                </>}
            </div>
        </div>
    )
}

// ── Main Players Page ─────────────────────────────────────────────────────
export default function Players({ onOpenProfile, onOpenTeam }) {
    const { isAdmin } = useAuth()
    useFlagIcons()

    const [players,      setPlayers]      = useState([])
    const [loading,      setLoading]      = useState(true)
    const [searchInput,  setSearchInput]  = useState('')
    const [search,       setSearch]       = useState('')
    const [filterTeam,   setFilterTeam]   = useState('ALL')
    const [filterRoles,  setFilterRoles]  = useState(new Set())
    const [filterOrigin, setFilterOrigin] = useState('ALL')
    const [sortBy,       setSortBy]       = useState('name-asc')
    const [showModal,    setShowModal]    = useState(false)

    const searchTimer = useRef(null)
    const sectionRefs = useRef({})

    const fetchPlayers = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getPlayers()
            setPlayers(data)
        } catch {
            toast.error('Failed to load players')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPlayers() }, [fetchPlayers])

    const handleSearchInput = (val) => {
        setSearchInput(val)
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => setSearch(val), 300)
    }

    const handleDelete = useCallback(async (player) => {
        if (!window.confirm(`Remove ${player.name} from ${player.teamId}?`)) return
        try {
            await deletePlayer(player.id)
            toast.success(`${player.name} removed`)
            fetchPlayers()
        } catch {
            toast.error('Failed to remove player')
        }
    }, [fetchPlayers])

    const toggleRole = (role) => {
        setFilterRoles(prev => {
            const next = new Set(prev)
            if (next.has(role)) next.delete(role)
            else next.add(role)
            return next
        })
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        clearTimeout(searchTimer.current)
        setFilterTeam('ALL')
        setFilterRoles(new Set())
        setFilterOrigin('ALL')
        setSortBy('name-asc')
    }

    const scrollToTeam = (teamId) => {
        sectionRefs.current[teamId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // ── Computed ──────────────────────────────────────────────────────────
    const hasFilters = !!(search || filterTeam !== 'ALL' || filterRoles.size > 0 || filterOrigin !== 'ALL' || sortBy !== 'name-asc')
    const overseasTotal = players.filter(isOverseas).length
    const indianTotal   = players.filter(p => p.nationality === 'Indian').length

    // Per-team counts for filter pills
    const teamCounts = players.reduce((acc, p) => {
        acc[p.teamId] = (acc[p.teamId] || 0) + 1
        return acc
    }, {})

    const filtered = players
        .filter(p => {
            const teamOk   = filterTeam === 'ALL' || p.teamId === filterTeam
            const roleOk   = filterRoles.size === 0 || filterRoles.has(p.role)
            const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase())
            const originOk = filterOrigin === 'ALL'
                || (filterOrigin === 'INDIAN'   && p.nationality === 'Indian')
                || (filterOrigin === 'OVERSEAS' && isOverseas(p))
            return teamOk && roleOk && searchOk && originOk
        })
        .sort((a, b) => {
            if (sortBy === 'name-asc')  return a.name.localeCompare(b.name)
            if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
            if (sortBy === 'role') {
                const order = { BAT: 0, BOWL: 1, ALL: 2, WK: 3 }
                return (order[a.role] ?? 4) - (order[b.role] ?? 4)
            }
            return 0
        })

    // Group by team, preserve TEAMS order
    const grouped = filtered.reduce((acc, p) => {
        if (!acc[p.teamId]) acc[p.teamId] = []
        acc[p.teamId].push(p)
        return acc
    }, {})
    const sortedTeamIds = TEAMS.map(t => t.id).filter(id => grouped[id])

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div>
            <style>{`
                @keyframes skeletonPulse { 0%,100% { opacity: 0.45 } 50% { opacity: 1 } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
            `}</style>

            {showModal && isAdmin && (
                <AddPlayerModal onClose={() => setShowModal(false)} onSaved={fetchPlayers} />
            )}

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: 'var(--text-primary)', lineHeight: 1 }}>
                        Player Registry
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {players.length} players · {overseasTotal} overseas · {new Set(players.map(p => p.teamId)).size} teams
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowModal(true)} style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
                        fontWeight: 700, fontSize: 13, fontFamily: 'Rajdhani, sans-serif',
                    }}>＋ Add Player</button>
                )}
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────── */}
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Search + sort row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 14, pointerEvents: 'none', opacity: 0.45,
                        }}>🔍</span>
                        <input
                            value={searchInput}
                            onChange={e => handleSearchInput(e.target.value)}
                            placeholder="Search players…"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                                borderRadius: 8, padding: '8px 32px',
                                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                                fontFamily: 'Rajdhani, sans-serif',
                            }}
                        />
                        {searchInput && (
                            <button onClick={() => handleSearchInput('')} style={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
                            }}>✕</button>
                        )}
                    </div>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{
                            background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                            borderRadius: 8, padding: '8px 10px', color: 'var(--text-secondary)',
                            fontSize: 12, cursor: 'pointer', outline: 'none',
                            fontFamily: 'Rajdhani, sans-serif', flexShrink: 0,
                        }}
                    >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                {/* Team pills — scrollable */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    <button
                        onClick={() => setFilterTeam('ALL')}
                        style={{
                            padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, fontFamily: 'Rajdhani, sans-serif', flexShrink: 0,
                            background: filterTeam === 'ALL' ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'var(--bg-elevated)',
                            color: filterTeam === 'ALL' ? '#fff' : 'var(--text-secondary)',
                            border: filterTeam === 'ALL' ? 'none' : '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}
                    >
                        All Teams
                        <span style={{
                            fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 5px',
                            background: filterTeam === 'ALL' ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                            color: filterTeam === 'ALL' ? '#fff' : 'var(--text-muted)',
                        }}>{players.length}</span>
                    </button>
                    {TEAMS.map(t => {
                        const active = filterTeam === t.id
                        const count  = teamCounts[t.id] || 0
                        return (
                            <button
                                key={t.id}
                                onClick={() => setFilterTeam(active ? 'ALL' : t.id)}
                                style={{
                                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
                                    fontSize: 11, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif',
                                    background: active ? t.color : 'var(--bg-elevated)',
                                    color: active ? '#fff' : 'var(--text-secondary)',
                                    border: active ? 'none' : '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {t.id}
                                <span style={{
                                    fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 5px',
                                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                                    color: active ? '#fff' : 'var(--text-muted)',
                                }}>{count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Role multi-select + origin filter row */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {ROLES.map(role => {
                        const active = filterRoles.has(role)
                        return (
                            <button
                                key={role}
                                onClick={() => toggleRole(role)}
                                style={{
                                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                                    fontSize: 11, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif',
                                    background: active ? ROLE_COLORS[role] + '25' : 'var(--bg-elevated)',
                                    color: active ? ROLE_COLORS[role] : 'var(--text-secondary)',
                                    border: active ? `1px solid ${ROLE_COLORS[role]}66` : '1px solid var(--border-subtle)',
                                    transition: 'all 0.15s',
                                }}
                            >{ROLE_LABELS[role]}</button>
                        )
                    })}
                    <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', margin: '0 2px' }} />
                    {[
                        { key: 'ALL',      label: 'All',         count: players.length },
                        { key: 'INDIAN',   label: '🇮🇳 Indian',  count: indianTotal    },
                        { key: 'OVERSEAS', label: '✈️ Overseas', count: overseasTotal  },
                    ].map(opt => {
                        const active = filterOrigin === opt.key
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setFilterOrigin(opt.key)}
                                style={{
                                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                                    fontSize: 11, fontWeight: 600, fontFamily: 'Rajdhani, sans-serif',
                                    background: active ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'var(--bg-elevated)',
                                    color: active ? '#fff' : 'var(--text-secondary)',
                                    border: active ? 'none' : '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {opt.label}
                                <span style={{
                                    fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 5px',
                                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                                    color: active ? '#fff' : 'var(--text-muted)',
                                }}>{opt.count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Results count + clear */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Showing{' '}
                        <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong>
                        {' '}of{' '}
                        <strong style={{ color: 'var(--text-secondary)' }}>{players.length}</strong>
                        {' '}players
                        {filterOrigin === 'OVERSEAS' && (
                            <span style={{ marginLeft: 6, color: '#f97316' }}>· IPL allows max 4 overseas per XI</span>
                        )}
                    </span>
                    {hasFilters && (
                        <button onClick={clearFilters} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#f97316', fontSize: 11, fontWeight: 600, padding: 0,
                            fontFamily: 'Rajdhani, sans-serif', textDecoration: 'underline',
                        }}>Clear all filters</button>
                    )}
                </div>
            </div>

            {/* ── Sticky Team Nav ─────────────────────────────────────── */}
            {!loading && filterTeam === 'ALL' && !search && sortedTeamIds.length > 1 && (
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: 20, padding: '8px 0',
                    display: 'flex', gap: 6, overflowX: 'auto',
                }}>
                    {sortedTeamIds.map(teamId => {
                        const team = getTeam(teamId)
                        return (
                            <button
                                key={teamId}
                                onClick={() => scrollToTeam(teamId)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '5px 10px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                    color: team.color, fontSize: 11, fontWeight: 700,
                                    fontFamily: 'Rajdhani, sans-serif', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = team.color + '22'; e.currentTarget.style.borderColor = team.color + '55' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                            >
                                <TeamLogo teamId={teamId} size={14} />
                                {teamId}
                                <span style={{
                                    fontSize: 9, color: 'var(--text-muted)', fontWeight: 700,
                                    background: 'var(--bg-subtle)', borderRadius: 8, padding: '1px 5px',
                                }}>{grouped[teamId]?.length || 0}</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ── Skeleton loading ─────────────────────────────────────── */}
            {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px,1fr))', gap: 10 }}>
                    {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* ── Empty state — no players at all ─────────────────────── */}
            {!loading && players.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>No players yet</div>
                    <div style={{ fontSize: 12 }}>Click "Add Player" to build your squads</div>
                </div>
            )}

            {/* ── Grouped team sections ────────────────────────────────── */}
            {!loading && sortedTeamIds.map(teamId => {
                const team  = getTeam(teamId)
                const cards = grouped[teamId]
                const ovs   = cards.filter(isOverseas).length
                return (
                    <div
                        key={teamId}
                        style={{ marginBottom: 36 }}
                        ref={el => { sectionRefs.current[teamId] = el }}
                    >
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                            <TeamLogo teamId={teamId} size={40} />
                            <div>
                                <div style={{
                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5,
                                    color: team.color, lineHeight: 1,
                                }}>{team.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {teamId} · {cards.length} player{cards.length !== 1 ? 's' : ''}
                                    {ovs > 0 && (
                                        <span style={{
                                            marginLeft: 8, color: '#f97316', fontWeight: 700,
                                            background: 'rgba(249,115,22,0.12)', borderRadius: 8,
                                            padding: '1px 6px', fontSize: 10,
                                        }}>{ovs} overseas</span>
                                    )}
                                </div>
                            </div>
                            <div style={{
                                flex: 1, height: 1, marginLeft: 8,
                                background: `linear-gradient(90deg, ${team.color}55, transparent)`,
                            }} />
                        </div>

                        {/* Cards grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px,1fr))', gap: 10 }}>
                            {cards.map((p, i) => (
                                <PlayerCard
                                    key={p.id}
                                    player={p}
                                    idx={i}
                                    onOpenProfile={onOpenProfile}
                                    onOpenTeam={onOpenTeam}
                                    onDelete={handleDelete}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* ── Filtered empty state ─────────────────────────────────── */}
            {!loading && players.length > 0 && filtered.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>No players match your filters</div>
                    <div style={{ fontSize: 12, marginBottom: 16 }}>Try adjusting your search or filters</div>
                    <button onClick={clearFilters} style={{
                        padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border-input)',
                        background: 'transparent', color: '#f97316', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif',
                    }}>Clear filters</button>
                </div>
            )}
        </div>
    )
}
