import { useState } from 'react'
import { Button } from './UI'

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Dashboard', activeFor: ['dashboard'] },
  { id: 'matches',   label: '📋 Matches',   activeFor: ['matches'] },
  { id: 'players',  label: '👤 Players',   activeFor: ['players', 'profile'] },
]

export default function Header({ view, setView, onAddClick }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (id) => { setView(id); setMenuOpen(false) }
  const handleAdd = () => { onAddClick(); setMenuOpen(false) }

  return (
    <header style={{
      background: 'linear-gradient(135deg,#1a1f29 0%,#0d1117 100%)',
      borderBottom: '1px solid #21262d',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg,#f97316,#dc2626)', borderRadius: 10,
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🏏</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f97316', lineHeight: 1 }}>IPL 2025</div>
            <div style={{ fontSize: 10, color: '#8b949e', letterSpacing: 3, textTransform: 'uppercase' }}>Season Dashboard</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{ display: 'flex', gap: 8 }}>
          {NAV_ITEMS.map(item => (
            <Button
              key={item.id}
              variant={item.activeFor.includes(view) ? 'active' : 'inactive'}
              onClick={() => setView(item.id)}
            >{item.label}</Button>
          ))}
          <Button variant="primary" onClick={onAddClick}>＋ Add Match</Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          style={{
            background: menuOpen ? 'rgba(249,115,22,0.1)' : '#21262d',
            border: `1px solid ${menuOpen ? '#f97316' : '#30363d'}`,
            borderRadius: 8, color: menuOpen ? '#f97316' : '#e6edf3',
            cursor: 'pointer', fontSize: 20, width: 40, height: 40,
            transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={{
          background: '#161b22', borderTop: '1px solid #21262d',
          padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                background: item.activeFor.includes(view) ? 'rgba(249,115,22,0.1)' : 'transparent',
                color: item.activeFor.includes(view) ? '#f97316' : '#e6edf3',
                transition: 'all 0.2s',
              }}
            >{item.label}</button>
          ))}
          <button
            onClick={handleAdd}
            style={{
              padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
              background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
              marginTop: 4,
            }}
          >＋ Add Match</button>
        </div>
      )}
    </header>
  )
}
