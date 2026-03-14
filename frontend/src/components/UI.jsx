import { useState } from 'react'
import { getTeam } from '../services/constants'
import { useTeamLogos } from '../context/TeamsContext'
import { X } from 'lucide-react'

const ROLE_COLORS = { BAT: '#f97316', BOWL: '#8b5cf6', ALL: '#22c55e', WK: '#3b82f6' }
const ROLE_LABELS = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-rounder', WK: 'Wicket-keeper' }

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
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-primary)',
      }}>{title}</div>
      {subtitle && <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
      }}>{subtitle}</div>}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)', fontWeight: 700, color: '#f97316',
      textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
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
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

export function Input({ label, hint = null, ...props }) {
  return (
    <div>
      {label && <LabelRow label={label} hint={hint} />}
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
    <label style={{
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
    }}>
      {children}
    </label>
  )
}

// ── Internal: label + optional inline hint badge ─────────────────────────────

function HintBadge({ matched, text }) {
  return (
    <span style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)', fontWeight: 600,
      color:      matched ? '#22c55e' : '#14b8a6',
      background: matched ? 'rgba(34,197,94,0.1)' : 'rgba(20,184,166,0.1)',
      border:     `1px solid ${matched ? 'rgba(34,197,94,0.3)' : 'rgba(20,184,166,0.3)'}`,
      borderRadius: 4, padding: '1px 6px',
      maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      display: 'inline-block', verticalAlign: 'middle',
    }} title={text}>
      {matched ? 'auto' : text}
    </span>
  )
}

function LabelRow({ label, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4, minHeight: 18 }}>
      <label style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: '18px',
      }}>
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
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
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
              cursor: 'pointer', padding: 0, lineHeight: 1,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
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
                padding: '8px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex', gap: 8, alignItems: 'center',
                background: p.id === value ? 'rgba(249,115,22,0.08)' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = p.id === value ? 'rgba(249,115,22,0.08)' : 'transparent')}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600, color: 'var(--text-primary)', flex: 1,
              }}>{p.name}</span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {p.teamId}
                <span title={ROLE_LABELS[p.role]} style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: 0.5,
                  color: ROLE_COLORS[p.role], background: ROLE_COLORS[p.role] + '22',
                  borderRadius: 3, padding: '1px 4px',
                }}>{p.role}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      {open && players.length > 0 && filtered.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', borderRadius: 8,
          marginTop: 4, padding: '10px 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-modal)',
        }}>
          No players match "{query}"
        </div>
      )}
    </div>
  )
}

// ── Team Logo ───────────────────────────────────────────────────────────────

export function TeamLogo({ teamId, size = 28 }) {
  const logos = useTeamLogos()
  const team  = getTeam(teamId)
  const url   = logos[teamId]

  if (url) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={url} alt={teamId} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    )
  }

  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: size * 0.18,
      background: `linear-gradient(135deg, ${team.color}dd, ${team.color}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.max(7, Math.floor(size * 0.32)), fontWeight: 800,
      fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: 0.5,
    }}>
      {teamId}
    </div>
  )
}

// ── Team Chip ───────────────────────────────────────────────────────────────

export function TeamChip({ teamId, score, wickets, overs, won, size = 'sm' }) {
  const big = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: won ? 1 : 0.6 }}>
      <TeamLogo teamId={teamId} size={big ? 36 : 28} />
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700, fontSize: big ? 'var(--text-md)' : 'var(--text-base)',
          color: won ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}>{teamId}</div>
        {score != null && (
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: big ? 'var(--text-xl)' : 'var(--text-md)',
            color: won ? '#f97316' : 'var(--text-secondary)', lineHeight: 1,
          }}>
            {score}{wickets != null ? `/${wickets}` : ''}{overs ? ` (${overs})` : ''}
          </div>
        )}
      </div>
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
        fontWeight: 800,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: rank === 0 ? '#fff' : 'var(--text-secondary)',
      }}>{rank + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600, fontSize: 'var(--text-base)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)',
        }}>{name}</div>
      </div>
      <div style={{ textAlign: 'right', marginRight: 12 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-xl)', color, lineHeight: 1,
        }}>{value}</div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        }}>{label}</div>
      </div>
      <div style={{ width: 80, background: 'var(--bg-subtle)', borderRadius: 4, height: 5, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${(value / max) * 100}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────
// Accepts icon as a React node (Lucide component) or string (legacy, renders as text)

export function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {icon ? (
          typeof icon === 'string'
            ? <span style={{ fontSize: 36 }}>{icon}</span>
            : icon
        ) : null}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)',
      }}>{text}</div>
      {sub && <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
      }}>{sub}</div>}
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
      {label && <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', letterSpacing: 1,
      }}>{label}</div>}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
