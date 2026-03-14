import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Card, Spinner, EmptyState, Button, Input, Select, TeamLogo } from '../components/UI'
import { getPlayers, createPlayer, deletePlayer } from '../services/api'
import { TEAMS, getTeam } from '../services/constants'
import { useAuth } from '../context/AuthContext'

const IPL_PLACEHOLDER = 'https://documents.iplt20.com/ipl/assets/images/Default-Men.png'

const ROLES = ['BAT', 'BOWL', 'ALL', 'WK']
const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }
const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }
const ROLE_SHORT  = { BAT: 'BAT', BOWL: 'BOWL', ALL: 'ALL', WK: 'WK' }

// ── Add Player Modal ──────────────────────────────────────────────────────
function AddPlayerModal({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', teamId: 'MI', role: 'BAT', profilePictureUrl: '' })
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
                background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 16,
                padding: 28, width: '100%', maxWidth: 420,
                animation: 'fadeUp 0.2s ease',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color: '#f97316' }}>
                        Add Player
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>✕</button>
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
                    <Input
                        label="Photo URL (optional)"
                        placeholder="https://example.com/photo.jpg"
                        value={form.profilePictureUrl}
                        onChange={e => set('profilePictureUrl', e.target.value)}
                    />
                    {form.profilePictureUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={form.profilePictureUrl} alt="preview"
                                 style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover',
                                     border: '2px solid var(--border-input)' }}
                                 onError={e => { e.target.style.display = 'none' }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Preview</span>
                        </div>
                    )}
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
function PlayerCard({ player, onOpenProfile, onOpenTeam, onDelete, canDelete }) {
    const team = getTeam(player.teamId)
    const [hover, setHover] = useState(false)

    return (
        <div
            className="fade-up"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${hover ? team.color + '66' : 'var(--border-subtle)'}`,
                borderRadius: 14, padding: '16px', cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                transform: hover ? 'translateY(-3px)' : 'none',
                boxShadow: hover ? `0 6px 24px ${team.color}33` : 'none',
                position: 'relative', overflow: 'hidden',
            }}
            onClick={() => onOpenProfile(player.id)}
        >
            {/* team color strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: team.color }} />

            {/* player info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, gap: 12 }}>
                {/* avatar */}
                <div style={{
                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${team.color}55`,
                    boxShadow: hover ? `0 0 12px ${team.color}44` : 'none',
                    transition: 'box-shadow 0.2s',
                    overflow: 'hidden', background: `${team.color}11`,
                }}>
                    <img
                        src={player.profilePictureUrl || IPL_PLACEHOLDER}
                        alt={player.name}
                        onError={e => { e.target.src = IPL_PLACEHOLDER }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <div
                            onClick={e => { e.stopPropagation(); onOpenTeam(player.teamId) }}
                            title={`View ${team.name}`}
                            style={{ fontSize: 10, fontWeight: 700, color: team.color,
                                background: team.color + '22', borderRadius: 10, padding: '2px 8px',
                                cursor: 'pointer', transition: 'background 0.15s', border: `1px solid ${team.color}33` }}
                            onMouseEnter={e => e.currentTarget.style.background = team.color + '44'}
                            onMouseLeave={e => e.currentTarget.style.background = team.color + '22'}
                        >
                            {player.teamId}
                        </div>
                        <div title={ROLE_LABELS[player.role]}
                            style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                                color: ROLE_COLORS[player.role],
                                background: ROLE_COLORS[player.role] + '1a', borderRadius: 10, padding: '2px 7px',
                                border: `1px solid ${ROLE_COLORS[player.role]}33` }}>
                            {ROLE_SHORT[player.role]}
                        </div>
                    </div>
                </div>

                {/* delete button — admins only */}
                {canDelete && (
                  <button
                      onClick={e => { e.stopPropagation(); onDelete(player) }}
                      style={{
                          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                          fontSize: 14, padding: '2px 4px', borderRadius: 4, marginLeft: 8,
                          opacity: hover ? 1 : 0, transition: 'opacity 0.2s',
                      }}
                      title="Remove player"
                  >✕</button>
                )}
            </div>
        </div>
    )
}

// ── Main Players Page ─────────────────────────────────────────────────────
export default function Players({ onOpenProfile, onOpenTeam }) {
    const { isAdmin } = useAuth()
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
            {showModal && isAdmin && (
                <AddPlayerModal onClose={() => setShowModal(false)} onSaved={fetchPlayers} />
            )}

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: 'var(--text-primary)', lineHeight: 1 }}>
                        Player Registry
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {players.length} player{players.length !== 1 ? 's' : ''} across {new Set(players.map(p => p.teamId)).size} teams
                    </div>
                </div>
                {isAdmin && <Button variant="primary" onClick={() => setShowModal(true)}>＋ Add Player</Button>}
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
                            <TeamLogo teamId={teamId} size={24} />
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1.5, color: team.color }}>
                                {teamId}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>— {team.name}</div>
                            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                                {grouped[teamId].length} player{grouped[teamId].length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: 10 }}>
                            {grouped[teamId].map((p, i) => (
                                <PlayerCard
                                    key={p.id}
                                    player={p}
                                    onOpenProfile={onOpenProfile}
                                    onOpenTeam={onOpenTeam}
                                    onDelete={handleDelete}
                                    canDelete={isAdmin}
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