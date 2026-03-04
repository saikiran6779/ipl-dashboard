import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Card, Spinner, EmptyState, Button, Input, Select } from '../components/UI'
import { getPlayers, createPlayer, deletePlayer } from '../services/api'
import { TEAMS, getTeam } from '../services/constants'

const ROLES = ['BAT', 'BOWL', 'ALL', 'WK']
const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }

// ── Add Player Modal ──────────────────────────────────────────────────────
function AddPlayerModal({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', teamId: 'MI', role: 'BAT' })
    const [saving, setSaving] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error('Player name is required'); return }
        setSaving(true)
        try {
            await createPlayer(form)
            toast.success(`${form.name} added to ${form.teamId}!`)
            onSaved()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add player')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={onClose}>
            <div style={{
                background: '#161b22', border: '1px solid #30363d', borderRadius: 16,
                padding: 28, width: '100%', maxWidth: 420,
                animation: 'fadeUp 0.2s ease',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color: '#f97316' }}>
                        Add Player
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Input
                        label="Player Name"
                        placeholder="e.g. Virat Kohli"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                    <Select label="Team" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                        {TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} – {t.name}</option>)}
                    </Select>
                    <Select label="Role" value={form.role} onChange={e => set('role', e.target.value)}>
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </Select>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={saving} style={{ flex: 2 }}>
                        {saving ? 'Adding…' : 'Add Player'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ── Player Card ───────────────────────────────────────────────────────────
function PlayerCard({ player, onOpenProfile, onDelete }) {
    const team = getTeam(player.teamId)
    const [hover, setHover] = useState(false)

    return (
        <div
            className="fade-up"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: '#161b22',
                border: `1px solid ${hover ? team.color + '66' : '#21262d'}`,
                borderRadius: 12, padding: '16px', cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? `0 4px 20px ${team.color}22` : 'none',
                position: 'relative', overflow: 'hidden',
            }}
            onClick={() => onOpenProfile(player.id)}
        >
            {/* team color strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: team.color }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
                {/* avatar */}
                <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0, marginRight: 10,
                    background: `linear-gradient(135deg, ${team.color}44, ${team.color}11)`,
                    border: `1.5px solid ${team.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {player.profilePictureUrl
                        ? <img src={player.profilePictureUrl} alt={player.name}
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: team.color }}>
                            {player.name.charAt(0)}
                          </span>
                    }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#e6edf3', marginBottom: 4,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: team.color,
                            background: team.color + '22', borderRadius: 4, padding: '2px 6px' }}>
                            {player.teamId}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600,
                            color: ROLE_COLORS[player.role],
                            background: ROLE_COLORS[player.role] + '22', borderRadius: 4, padding: '2px 6px' }}>
                            {ROLE_LABELS[player.role]}
                        </div>
                    </div>
                </div>

                {/* delete button */}
                <button
                    onClick={e => { e.stopPropagation(); onDelete(player) }}
                    style={{
                        background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer',
                        fontSize: 14, padding: '2px 4px', borderRadius: 4, marginLeft: 8,
                        opacity: hover ? 1 : 0, transition: 'opacity 0.2s',
                    }}
                    title="Remove player"
                >✕</button>
            </div>
        </div>
    )
}

// ── Main Players Page ─────────────────────────────────────────────────────
export default function Players({ onOpenProfile }) {
    const [players,     setPlayers]     = useState([])
    const [loading,     setLoading]     = useState(true)
    const [filterTeam,  setFilterTeam]  = useState('ALL')
    const [filterRole,  setFilterRole]  = useState('ALL')
    const [search,      setSearch]      = useState('')
    const [showModal,   setShowModal]   = useState(false)

    const fetchPlayers = async () => {
        setLoading(true)
        try {
            const data = await getPlayers()
            setPlayers(data)
        } catch {
            toast.error('Failed to load players')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPlayers() }, [])

    const handleDelete = async (player) => {
        if (!window.confirm(`Remove ${player.name} from ${player.teamId}?`)) return
        try {
            await deletePlayer(player.id)
            toast.success(`${player.name} removed`)
            fetchPlayers()
        } catch {
            toast.error('Failed to remove player')
        }
    }

    const filtered = players.filter(p => {
        const teamOk = filterTeam === 'ALL' || p.teamId === filterTeam
        const roleOk = filterRole === 'ALL' || p.role === filterRole
        const searchOk = p.name.toLowerCase().includes(search.toLowerCase())
        return teamOk && roleOk && searchOk
    })

    // Group by team for display
    const grouped = filtered.reduce((acc, p) => {
        if (!acc[p.teamId]) acc[p.teamId] = []
        acc[p.teamId].push(p)
        return acc
    }, {})

    if (loading) return <Spinner />

    return (
        <div>
            {showModal && (
                <AddPlayerModal onClose={() => setShowModal(false)} onSaved={fetchPlayers} />
            )}

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: '#e6edf3', lineHeight: 1 }}>
                        Player Registry
                    </div>
                    <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                        {players.length} player{players.length !== 1 ? 's' : ''} across {new Set(players.map(p => p.teamId)).size} teams
                    </div>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)}>＋ Add Player</Button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px' }}>
                    <Input
                        placeholder="🔍 Search players…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ flex: '0 0 140px' }}>
                    <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
                        <option value="ALL">All Teams</option>
                        {TEAMS.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                    </Select>
                </div>
                <div style={{ flex: '0 0 140px' }}>
                    <Select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="ALL">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </Select>
                </div>
            </div>

            {/* Empty state */}
            {players.length === 0 && (
                <EmptyState icon="👤" text="No players yet" sub='Click "Add Player" to build your squads' />
            )}

            {/* Grouped by team */}
            {Object.keys(grouped).sort().map(teamId => {
                const team = getTeam(teamId)
                return (
                    <div key={teamId} style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 4, height: 20, borderRadius: 2, background: team.color }} />
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1.5, color: team.color }}>
                                {teamId}
                            </div>
                            <div style={{ fontSize: 11, color: '#8b949e' }}>— {team.name}</div>
                            <div style={{ marginLeft: 'auto', fontSize: 11, color: '#8b949e' }}>
                                {grouped[teamId].length} player{grouped[teamId].length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 10 }}>
                            {grouped[teamId].map((p, i) => (
                                <PlayerCard
                                    key={p.id}
                                    player={p}
                                    onOpenProfile={onOpenProfile}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Filtered empty */}
            {players.length > 0 && filtered.length === 0 && (
                <EmptyState icon="🔍" text="No players match your filters" sub="Try adjusting your search or filters" />
            )}
        </div>
    )
}