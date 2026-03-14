import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getVenues, createVenue, updateVenue, deleteVenue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/UI'

const VENUE_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)',
  'linear-gradient(135deg, #3b1f5e 0%, #1e0f40 100%)',
  'linear-gradient(135deg, #1f3b2a 0%, #0f2018 100%)',
  'linear-gradient(135deg, #5e2d1f 0%, #401608 100%)',
  'linear-gradient(135deg, #1f3a5e 0%, #0f1f3a 100%)',
  'linear-gradient(135deg, #2d1f5e 0%, #180f40 100%)',
]
const gradientFor = (id) => VENUE_GRADIENTS[(id ?? 0) % VENUE_GRADIENTS.length]

// ── Image gallery carousel ─────────────────────────────────────────────────
function Gallery({ images, height = 180, gradient }) {
  const [idx, setIdx] = useState(0)
  const [errored, setErrored] = useState({})

  const valid = images.filter((_, i) => !errored[i])
  const current = valid[idx] ?? null
  const total = valid.length

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % total) }

  // Reset index when images change
  useEffect(() => { setIdx(0) }, [images.join(',')])

  return (
    <div style={{ position: 'relative', height, background: gradient, overflow: 'hidden' }}>
      {/* Image */}
      {current ? (
        <img
          key={current}
          src={current}
          alt=""
          onError={() => setErrored(e => ({ ...e, [idx]: true }))}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 52, opacity: 0.22 }}>🏟️</span>
        </div>
      )}

      {/* Gradient overlay for text legibility */}
      {current && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }} />
      )}

      {/* Prev / Next arrows — only shown when >1 valid image */}
      {total > 1 && (
        <>
          <button onClick={prev} style={arrowStyle('left')}>‹</button>
          <button onClick={next} style={arrowStyle('right')}>›</button>

          {/* Dot indicators */}
          <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i) }}
                style={{
                  width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
            {idx + 1} / {total}
          </div>
        </>
      )}
    </div>
  )
}

const arrowStyle = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 8,
  width: 28, height: 28, borderRadius: '50%', border: 'none',
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
  color: '#fff', cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s', zIndex: 2,
  padding: 0, lineHeight: 1,
})

// ── Multi-image URL editor ─────────────────────────────────────────────────
function ImageUrlEditor({ urls, onChange }) {
  const add    = ()       => onChange([...urls, ''])
  const remove = (i)      => onChange(urls.filter((_, j) => j !== i))
  const update = (i, val) => onChange(urls.map((u, j) => j === i ? val : u))

  const inputStyle = {
    flex: 1, padding: '7px 10px', borderRadius: 7, fontSize: 12,
    border: '1px solid var(--border-input)', background: 'var(--bg-subtle)',
    color: 'var(--text-primary)', outline: 'none', fontFamily: 'DM Sans,sans-serif',
    minWidth: 0,
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Images ({urls.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {urls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Thumbnail preview */}
            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {url ? (
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
              ) : null}
              <span style={{ fontSize: 14, display: url ? 'none' : 'flex' }}>🖼️</span>
            </div>
            <input
              placeholder={`Image URL ${i + 1}`}
              value={url}
              onChange={e => update(i, e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
            />
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15, padding: '4px', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        style={{ marginTop: 8, background: 'none', border: '1px dashed var(--border-input)', borderRadius: 7, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: '6px 14px', width: '100%', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
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

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-subtle)', border: '1px solid var(--border-input)',
    borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif',
  }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 5 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.2s ease' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: '#f97316' }}>
            {venue?.id ? 'Edit Venue' : 'Add Venue'}
          </div>
          <button onClick={onClose} style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Form body — scrollable */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Gallery preview */}
          {imageUrls.filter(u => u.trim()).length > 0 && (
            <Gallery images={imageUrls.filter(u => u.trim())} height={140} gradient={gradientFor(venue?.id)} />
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

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-input)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : venue?.id ? 'Update' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Venue card ─────────────────────────────────────────────────────────────
function VenueCard({ venue, isAdmin, onEdit, onDelete }) {
  const images = venue.imageUrls ?? []

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)' }}
    >
      {/* Gallery */}
      <div style={{ position: 'relative' }}>
        <Gallery images={images} height={180} gradient={gradientFor(venue.id)} />

        {/* City pill */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5, zIndex: 3 }}>
          📍 {venue.city}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 3 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(venue) }} title="Edit" style={adminBtnStyle()}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}>✏️</button>
            <button onClick={e => { e.stopPropagation(); onDelete(venue) }} title="Delete" style={adminBtnStyle()}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}>🗑</button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1.2, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>
          {venue.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{venue.city}</div>
          {images.length > 0 && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {images.length} photo{images.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const adminBtnStyle = () => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
  color: '#fff', cursor: 'pointer', fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s',
})

// ── Main page ──────────────────────────────────────────────────────────────
export default function Venues() {
  const { isAdmin } = useAuth()
  const [venues,  setVenues]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [search,  setSearch]  = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getVenues()
      .then(setVenues)
      .catch(() => toast.error('Failed to load venues'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleSave = (saved) => {
    setModal(null)
    load()
    toast.success(modal?.id ? 'Venue updated' : 'Venue added')
  }

  const handleDelete = async (venue) => {
    if (!window.confirm(`Delete "${venue.name}"?\nMatches using this venue will lose their venue link.`)) return
    try {
      await deleteVenue(venue.id)
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
            {venues.length} stadium{venues.length !== 1 ? 's' : ''} in the database
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Search venues…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-input)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none', width: 200, fontFamily: 'DM Sans,sans-serif' }}
            onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = 'var(--border-input)')}
          />
          {isAdmin && (
            <button onClick={() => setModal({})} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 2px 12px rgba(249,115,22,0.3)', whiteSpace: 'nowrap' }}>
              ＋ Add Venue
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {search ? 'No venues found' : 'No venues yet'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {search ? 'Try a different search term' : isAdmin ? 'Add your first venue using the button above' : 'No venues have been added yet'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(v => (
            <VenueCard key={v.id} venue={v} isAdmin={isAdmin} onEdit={v => setModal(v)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal !== null && (
        <VenueModal venue={modal?.id ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
