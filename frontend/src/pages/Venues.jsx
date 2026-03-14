import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getVenues, createVenue, updateVenue, deleteVenue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/UI'

// ── Gradient placeholders when no image is provided ───────────────────────
const VENUE_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)',
  'linear-gradient(135deg, #3b1f5e 0%, #1e0f40 100%)',
  'linear-gradient(135deg, #1f3b2a 0%, #0f2018 100%)',
  'linear-gradient(135deg, #5e2d1f 0%, #401608 100%)',
  'linear-gradient(135deg, #1f3a5e 0%, #0f1f3a 100%)',
  'linear-gradient(135deg, #2d1f5e 0%, #180f40 100%)',
]

function gradientFor(id) {
  return VENUE_GRADIENTS[(id ?? 0) % VENUE_GRADIENTS.length]
}

// ── Add / Edit modal ──────────────────────────────────────────────────────
function VenueModal({ venue, onSave, onClose }) {
  const [form,    setForm]    = useState({ name: venue?.name ?? '', city: venue?.city ?? '', imageUrl: venue?.imageUrl ?? '' })
  const [saving,  setSaving]  = useState(false)
  const [preview, setPreview] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { toast.error('Name and city are required'); return }
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), city: form.city.trim(), imageUrl: form.imageUrl.trim() || null }
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-input)',
        borderRadius: 16, width: '100%', maxWidth: 480,
        animation: 'fadeUp 0.2s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: '#f97316' }}>
            {venue?.id ? 'Edit Venue' : 'Add Venue'}
          </div>
          <button onClick={onClose} style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Venue Name *</label>
            <input
              autoFocus style={inputStyle} placeholder="e.g. Wankhede Stadium"
              value={form.name} onChange={e => set('name', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
            />
          </div>
          <div>
            <label style={labelStyle}>City *</label>
            <input
              style={inputStyle} placeholder="e.g. Mumbai"
              value={form.city} onChange={e => set('city', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Image URL</label>
              {form.imageUrl && (
                <button onClick={() => setPreview(p => !p)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#f97316', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>
                  {preview ? 'Hide preview' : 'Preview'}
                </button>
              )}
            </div>
            <input
              style={inputStyle} placeholder="https://… (optional)"
              value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
            />
            {preview && form.imageUrl && (
              <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 120 }}>
                <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Paste any stadium image URL — shown on the venue card
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-input)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : venue?.id ? 'Update' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Venue card ────────────────────────────────────────────────────────────
function VenueCard({ venue, isAdmin, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false)
  const hasImage = venue.imageUrl && !imgError

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)' }}
    >
      {/* Image / Gradient section */}
      <div style={{ position: 'relative', height: 160, background: gradientFor(venue.id), overflow: 'hidden' }}>
        {hasImage && (
          <img
            src={venue.imageUrl} alt={venue.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Dark overlay gradient at bottom for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hasImage
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)'
            : 'none',
        }} />

        {/* Stadium icon when no image */}
        {!hasImage && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 52, opacity: 0.25 }}>🏟️</span>
          </div>
        )}

        {/* Admin actions overlay */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(venue) }}
              title="Edit venue"
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                color: '#fff', cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
            >✏️</button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(venue) }}
              title="Delete venue"
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                color: '#fff', cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
            >🗑</button>
          </div>
        )}

        {/* City pill bottom-left */}
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          borderRadius: 20, padding: '3px 10px',
          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          letterSpacing: 0.5,
        }}>
          📍 {venue.city}
        </div>
      </div>

      {/* Info section */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 18, letterSpacing: 1.2,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 4,
        }}>
          {venue.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {venue.city}
        </div>
      </div>
    </div>
  )
}

// ── Main Venues page ──────────────────────────────────────────────────────
export default function Venues() {
  const { isAdmin } = useAuth()
  const [venues,     setVenues]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)   // null | 'add' | venue-object (edit)
  const [search,     setSearch]     = useState('')

  const load = () => {
    setLoading(true)
    getVenues()
      .then(setVenues)
      .catch(() => toast.error('Failed to load venues'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

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
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: 2, color: '#f97316', margin: 0, lineHeight: 1 }}>
            Venues
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {venues.length} stadium{venues.length !== 1 ? 's' : ''} in the database
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <input
            placeholder="Search venues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border-input)', background: 'var(--bg-subtle)',
              color: 'var(--text-primary)', outline: 'none', width: 200,
              fontFamily: 'DM Sans,sans-serif',
            }}
            onFocus={e => (e.target.style.borderColor = '#f97316')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
          />
          {isAdmin && (
            <button
              onClick={() => setModal({})}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#f97316,#dc2626)',
                color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'DM Sans,sans-serif',
                boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              ＋ Add Venue
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner />
        </div>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(v => (
            <VenueCard
              key={v.id}
              venue={v}
              isAdmin={isAdmin}
              onEdit={v => setModal(v)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modal !== null && (
        <VenueModal
          venue={modal?.id ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
