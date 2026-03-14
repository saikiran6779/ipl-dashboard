import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getVenues, createVenue, updateVenue, deleteVenue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner, TeamLogo } from '../components/UI'
import { formatDate } from '../services/constants'

const GRADIENTS = [
  'linear-gradient(135deg,#1e3a5f,#0f2340)',
  'linear-gradient(135deg,#3b1f5e,#1e0f40)',
  'linear-gradient(135deg,#1f3b2a,#0f2018)',
  'linear-gradient(135deg,#5e2d1f,#401608)',
  'linear-gradient(135deg,#1a3a4a,#0d2030)',
  'linear-gradient(135deg,#2d1f5e,#180f40)',
]
const gradientFor = (id) => GRADIENTS[(id ?? 0) % GRADIENTS.length]

// ── Carousel (used on detail page) ────────────────────────────────────────
function Carousel({ images, height = 360 }) {
  const [idx, setIdx]       = useState(0)
  const [errored, setErrored] = useState({})
  const valid = images.filter((_, i) => !errored[i])
  const total = valid.length
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % total) }
  useEffect(() => setIdx(0), [images.join(',')])

  return (
    <div style={{ position: 'relative', height, background: 'var(--bg-subtle)', overflow: 'hidden', borderRadius: 12 }}>
      {valid[idx] ? (
        <img key={valid[idx]} src={valid[idx]} alt="" onError={() => setErrored(e => ({ ...e, [idx]: true }))}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.25s' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontSize: 64, opacity: 0.2 }}>🏟️</span>
        </div>
      )}
      {valid[idx] && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.35))' }} />}
      {total > 1 && (<>
        <button onClick={prev} style={arrowBtn('left')}>‹</button>
        <button onClick={next} style={arrowBtn('right')}>›</button>
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
          {idx + 1} / {total}
        </div>
      </>)}
    </div>
  )
}
const arrowBtn = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 10,
  width: 32, height: 32, borderRadius: '50%', border: 'none',
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
  color: '#fff', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
  transition: 'background 0.15s',
})

// ── Venue detail modal ─────────────────────────────────────────────────────
function VenueDetailModal({ venue, matches, isAdmin, onEdit, onClose }) {
  const venueMatches = matches.filter(m => m.venueId === venue.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 20, width: '100%', maxWidth: 780, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeUp 0.22s ease' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 2, color: '#f97316', lineHeight: 1 }}>
              {venue.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
              📍 {venue.city}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {isAdmin && (
              <button onClick={() => { onClose(); onEdit(venue) }}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)', color: '#f97316', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'Rajdhani,sans-serif' }}>
                ✏️ Edit
              </button>
            )}
            <button onClick={onClose} style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* Gallery */}
          {(venue.imageUrls ?? []).length > 0 ? (
            <div style={{ marginBottom: 20 }}>
              <Carousel images={venue.imageUrls} height={320} />
              {venue.imageUrls.length > 1 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {venue.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid #f97316' : '2px solid transparent', flexShrink: 0, cursor: 'pointer' }}
                      onError={e => (e.target.style.display = 'none')} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: 200, borderRadius: 12, background: gradientFor(venue.id), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 64, opacity: 0.25 }}>🏟️</span>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Matches Played', value: venueMatches.length },
              { label: 'Photos',         value: (venue.imageUrls ?? []).length },
            ].map(s => (
              <div key={s.label} style={{ flex: '1 1 100px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#f97316', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Matches list */}
          {venueMatches.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                Matches at this venue
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {venueMatches.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                      <TeamLogo teamId={m.team1} size={22} />
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 1 }}>{m.team1}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 4px' }}>vs</span>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 1 }}>{m.team2}</span>
                      <TeamLogo teamId={m.team2} size={22} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {m.matchNo ? `#${m.matchNo} · ` : ''}{m.date ? formatDate(m.date) : ''}
                    </div>
                    {m.winner && (
                      <div style={{ fontSize: 11, color: '#22c55e', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {m.winner} won
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {venueMatches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No matches recorded at this venue yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Multi-image URL editor ─────────────────────────────────────────────────
function ImageUrlEditor({ urls, onChange }) {
  const add       = ()       => onChange([...urls, ''])
  const remove    = (i)      => onChange(urls.filter((_, j) => j !== i))
  const update    = (i, val) => onChange(urls.map((u, j) => j === i ? val : u))
  // Move image i to index 0 (makes it primary)
  const setPrimary = (i)     => onChange([urls[i], ...urls.filter((_, j) => j !== i)])

  const inputStyle = { flex: 1, padding: '7px 10px', borderRadius: 7, fontSize: 12, border: '1px solid var(--border-input)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Rajdhani,sans-serif', minWidth: 0 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Images ({urls.length})
        </div>
        {urls.length > 0 && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>★ = primary (shown on tile)</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {urls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Thumbnail */}
            <div style={{ width: 40, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)', border: `1px solid ${i === 0 ? '#f97316' : 'var(--border-subtle)'}`, position: 'relative' }}>
              {url
                ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target.style.display = 'none')} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 14 }}>🖼️</div>
              }
              {i === 0 && <div style={{ position: 'absolute', top: 1, right: 2, fontSize: 8, color: '#f97316' }}>★</div>}
            </div>
            <input placeholder={`Image URL ${i + 1}${i === 0 ? ' (primary)' : ''}`} value={url} onChange={e => update(i, e.target.value)} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = 'var(--border-input)')} />
            {/* Star button — only shown for non-primary images */}
            {i > 0 && (
              <button onClick={() => setPrimary(i)} title="Set as primary" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, padding: '4px', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f97316')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>☆</button>
            )}
            {i === 0 && <div style={{ width: 23, flexShrink: 0 }} />}
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15, padding: '4px', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={add}
        style={{ marginTop: 8, background: 'none', border: '1px dashed var(--border-input)', borderRadius: 7, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: '6px 14px', width: '100%', fontFamily: 'Rajdhani,sans-serif', fontWeight: 600, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
        ＋ Add image URL
      </button>
    </div>
  )
}

// ── Add / Edit modal ───────────────────────────────────────────────────────
function VenueModal({ venue, onSave, onClose }) {
  const [name,      setName]      = useState(venue?.name ?? '')
  const [city,      setCity]      = useState(venue?.city ?? '')
  const [imageUrls, setImageUrls] = useState(venue?.imageUrls ?? [])
  const [saving,    setSaving]    = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) { toast.error('Name and city are required'); return }
    setSaving(true)
    try {
      const payload = { name: name.trim(), city: city.trim(), imageUrls: imageUrls.filter(u => u.trim()) }
      const saved = venue?.id ? await updateVenue(venue.id, payload) : await createVenue(payload)
      onSave(saved)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save venue')
      setSaving(false)
    }
  }

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Rajdhani, sans-serif' }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 5 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: '#f97316' }}>{venue?.id ? 'Edit Venue' : 'Add Venue'}</div>
          <button onClick={onClose} style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Primary image preview */}
          {imageUrls.filter(u => u.trim()).length > 0 && (
            <div style={{ height: 120, borderRadius: 10, overflow: 'hidden', background: gradientFor(venue?.id) }}>
              <img src={imageUrls.find(u => u.trim())} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target.style.display = 'none')} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Venue Name *</label>
            <input autoFocus style={inputStyle} placeholder="e.g. Wankhede Stadium" value={name} onChange={e => setName(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = 'var(--border-input)')} />
          </div>
          <div>
            <label style={labelStyle}>City *</label>
            <input style={inputStyle} placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = 'var(--border-input)')} />
          </div>
          <ImageUrlEditor urls={imageUrls} onChange={setImageUrls} />
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-input)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Rajdhani,sans-serif' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Rajdhani,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : venue?.id ? 'Update' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Venue tile (grid card) ─────────────────────────────────────────────────
function VenueTile({ venue, isAdmin, onClick, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false)
  const primary = (venue.imageUrls ?? [])[0]
  const hasImage = primary && !imgError

  return (
    <div
      onClick={() => onClick(venue)}
      style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.28)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      {/* Primary image */}
      <div style={{ position: 'relative', height: 170, background: gradientFor(venue.id), overflow: 'hidden' }}>
        {hasImage && (
          <img src={primary} alt={venue.name} onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {!hasImage && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 52, opacity: 0.2 }}>🏟️</span>
          </div>
        )}
        {hasImage && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0) 40%,rgba(0,0,0,0.5) 100%)' }} />}

        {/* Photo count badge */}
        {(venue.imageUrls ?? []).length > 1 && (
          <div style={{ position: 'absolute', bottom: 10, left: 12, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
            🖼 {venue.imageUrls.length}
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(venue) }} title="Edit"
              style={adminBtn()}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}>✏️</button>
            <button onClick={e => { e.stopPropagation(); onDelete(venue) }} title="Delete"
              style={adminBtn()}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}>🗑</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 1.1, color: 'var(--text-primary)', lineHeight: 1.1 }}>{venue.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>📍 {venue.city}</div>
      </div>
    </div>
  )
}
const adminBtn = () => ({ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' })

// ── Main page ──────────────────────────────────────────────────────────────
export default function Venues({ matches = [] }) {
  const { isAdmin } = useAuth()
  const [venues,       setVenues]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [editModal,    setEditModal]    = useState(null)   // null | venue
  const [detailVenue,  setDetailVenue]  = useState(null)  // null | venue
  const [search,       setSearch]       = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getVenues()
      .then(setVenues)
      .catch(() => toast.error('Failed to load venues'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])

  const handleSave = (saved) => {
    setEditModal(null)
    // If we just edited the venue currently shown in detail, refresh it
    if (detailVenue?.id === saved.id) setDetailVenue(saved)
    load()
    toast.success(editModal?.id ? 'Venue updated' : 'Venue added')
  }

  const handleDelete = async (venue) => {
    if (!window.confirm(`Delete "${venue.name}"?\nMatches using this venue will lose their venue link.`)) return
    try {
      await deleteVenue(venue.id)
      if (detailVenue?.id === venue.id) setDetailVenue(null)
      toast.success('Venue deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete venue')
    }
  }

  const filtered = venues.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: '#f97316', margin: 0, lineHeight: 1 }}>Venues</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {venues.length} stadium{venues.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="Search venues…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-input)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none', width: 200, fontFamily: 'Rajdhani,sans-serif' }}
            onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = 'var(--border-input)')} />
          {isAdmin && (
            <button onClick={() => setEditModal({})} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Rajdhani,sans-serif', boxShadow: '0 2px 12px rgba(249,115,22,0.3)', whiteSpace: 'nowrap' }}>
              ＋ Add Venue
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{search ? 'No venues found' : 'No venues yet'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{search ? 'Try a different search term' : isAdmin ? 'Add your first venue above' : 'No venues added yet'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
          {filtered.map(v => (
            <VenueTile key={v.id} venue={v} isAdmin={isAdmin}
              onClick={setDetailVenue}
              onEdit={v => setEditModal(v)}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Venue detail modal */}
      {detailVenue && (
        <VenueDetailModal
          venue={detailVenue}
          matches={matches}
          isAdmin={isAdmin}
          onEdit={v => { setDetailVenue(null); setEditModal(v) }}
          onClose={() => setDetailVenue(null)}
        />
      )}

      {/* Add / Edit modal */}
      {editModal !== null && (
        <VenueModal venue={editModal?.id ? editModal : null} onSave={handleSave} onClose={() => setEditModal(null)} />
      )}
    </div>
  )
}
