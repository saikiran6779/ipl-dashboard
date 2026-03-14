import { useState } from 'react'
import { getTeam } from '../services/constants'

// ── Layout ─────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={`fade-up ${className}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      backdropFilter: 'blur(8px)',
      boxShadow: 'var(--shadow-card)',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle }) {
  return (
    <div style={{
      padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'var(--bg-subtle)',
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subtitle}</div>}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ height: 1, width: 20, background: '#f97316', opacity: 0.5 }} />
      {children}
      <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

// ── Inputs ──────────────────────────────────────────────────────────────────

const baseInput = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-input)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        style={baseInput}
        onFocus={e => (e.target.style.borderColor = '#f97316')}
        onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
        {...props}
      />
    </div>
  )
}

export function Select({ label, hint = null, children, ...props }) {
  return (
    <div>
      {label && <LabelRow label={label} hint={hint} />}
      <select
        style={{ ...baseInput, cursor: 'pointer' }}
        onFocus={e => (e.target.style.borderColor = '#f97316')}
        onBlur={e  => (e.target.style.borderColor = 'var(--border-input)')}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function Label({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
      {children}
    </label>
  )
}

// ── Internal: label + optional inline hint badge ─────────────────────────────

function HintBadge({ matched, text }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      color:      matched ? '#22c55e' : '#14b8a6',
      background: matched ? 'rgba(34,197,94,0.1)' : 'rgba(20,184,166,0.1)',
      border:     `1px solid ${matched ? 'rgba(34,197,94,0.3)' : 'rgba(20,184,166,0.3)'}`,
      borderRadius: 4, padding: '1px 6px',
      maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      display: 'inline-block', verticalAlign: 'middle',
    }} title={text}>
      {matched ? '✓ auto' : `📂 ${text}`}
    </span>
  )
}

function LabelRow({ label, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </label>
      {hint && <HintBadge matched={hint.matched} text={hint.text} />}
    </div>
  )
}

// ── Buttons ─────────────────────────────────────────────────────────────────

export function Button({ children, variant = 'primary', onClick, type = 'button', style = {}, disabled = false }) {
  const variants = {
    primary:  { background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff', border: 'none' },
    ghost:    { background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-input)' },
    danger:   { background: 'transparent', color: '#ef4444', border: '1px solid var(--border-input)' },
    active:   { background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid #f97316' },
    inactive: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: 13, transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
        fontFamily: 'DM Sans, sans-serif',
        ...variants[variant], ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Player Combobox ──────────────────────────────────────────────────────────

export function PlayerCombobox({ label, players = [], value, onChange, hint = null }) {
  const [query,  setQuery]  = useState('')
  const [open,   setOpen]   = useState(false)

  const selectedName = value != null ? (players.find(p => p.id === value)?.name ?? '') : ''

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (player) => {
    onChange(player.id)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && <LabelRow label={label} hint={hint} />}
      <div style={{ position: 'relative' }}>
        <input
          value={open ? query : selectedName}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setQuery(''); setOpen(true) }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={players.length ? 'Type to search…' : 'Select teams first'}
          disabled={!players.length}
          style={{ ...baseInput, paddingRight: value != null ? 30 : 12 }}
          onFocusCapture={e => (e.target.style.borderColor = '#f97316')}
          onBlurCapture={e  => (e.target.style.borderColor = 'var(--border-input)')}
        />
        {value != null && (
          <button
            type="button"
            onMouseDown={handleClear}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
            }}
          >✕</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', borderRadius: 8,
          marginTop: 4, maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-modal)',
        }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseDown={() => handleSelect(p)}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex', gap: 8, alignItems: 'center',
                background: p.id === value ? 'rgba(249,115,22,0.08)' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = p.id === value ? 'rgba(249,115,22,0.08)' : 'transparent')}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>{p.teamId} · {p.role}</span>
            </div>
          ))}
        </div>
      )}
      {open && players.length > 0 && filtered.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', borderRadius: 8,
          marginTop: 4, padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-modal)',
        }}>
          No players match "{query}"
        </div>
      )}
    </div>
  )
}

// ── Team Chip ───────────────────────────────────────────────────────────────

export function TeamChip({ teamId, score, wickets, overs, won, size = 'sm' }) {
  const team = getTeam(teamId)
  const big = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: won ? 1 : 0.6 }}>
      <div style={{ width: 4, height: big ? 32 : 24, borderRadius: 2, background: team.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: big ? 15 : 13, color: won ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{teamId}</div>
        {score != null && (
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: big ? 20 : 15, color: won ? '#f97316' : 'var(--text-secondary)', lineHeight: 1 }}>
            {score}{wickets != null ? `/${wickets}` : ''}{overs ? ` (${overs})` : ''}
          </div>
        )}
      </div>
      {won && <span style={{ fontSize: 13 }}>✅</span>}
    </div>
  )
}

// ── Bar Stat Row ─────────────────────────────────────────────────────────────

export function StatBar({ rank, name, value, label, max, color = '#f97316' }) {
  return (
    <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, borderTop: rank > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: rank === 0 ? color : 'var(--bg-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 12, color: rank === 0 ? '#fff' : 'var(--text-secondary)',
      }}>{rank + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{name}</div>
      </div>
      <div style={{ textAlign: 'right', marginRight: 12 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
      </div>
      <div style={{ width: 80, background: 'var(--bg-subtle)', borderRadius: 4, height: 5, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${(value / max) * 100}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon = '📭', text, sub }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{text}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  )
}

// ── Loading ─────────────────────────────────────────────────────────────────

export function Spinner({ size = 40, color = '#f97316', label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, gap: 16 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx={size/2} cy={size/2} r={size/2 - 3}
            fill="none" stroke={`${color}22`} strokeWidth={3} />
          <circle cx={size/2} cy={size/2} r={size/2 - 3}
            fill="none" stroke={color} strokeWidth={3}
            strokeDasharray={`${(size/2-3)*2*Math.PI*0.25} ${(size/2-3)*2*Math.PI*0.75}`}
            strokeLinecap="round" />
        </svg>
      </div>
      {label && <div style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>{label}</div>}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
