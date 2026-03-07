import { useState } from 'react'
import { Button } from './UI'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'dashboard',      label: '📊 Dashboard', activeFor: ['dashboard'] },
  { id: 'matches',        label: '📋 Matches',   activeFor: ['matches'] },
  { id: 'players',        label: '👤 Players',   activeFor: ['players', 'profile'] },
]

export default function Header({ view, setView, onAddClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAdmin, isSuperAdmin, logout } = useAuth()

  const handleNav = (id) => { setView(id); setMenuOpen(false) }
  const handleAdd = () => { onAddClick(); setMenuOpen(false) }

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    toast.success('Logged out')
    setView('dashboard')
  }

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
        <div className="nav-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {NAV_ITEMS.map(item => (
            <Button
              key={item.id}
              variant={item.activeFor.includes(view) ? 'active' : 'inactive'}
              onClick={() => setView(item.id)}
            >{item.label}</Button>
          ))}

          {/* Super Admin panel link */}
          {isSuperAdmin && (
            <Button
              variant={view === 'super-admin' ? 'active' : 'inactive'}
              onClick={() => setView('super-admin')}
            >👑 Users</Button>
          )}

          {/* Add Match — admins only */}
          {isAdmin && (
            <Button variant="primary" onClick={onAddClick}>＋ Add Match</Button>
          )}

          {/* Auth section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid #21262d' }}>
              <div style={{ fontSize: 12, color: '#8b949e', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <Button variant="ghost" onClick={handleLogout} style={{ fontSize: 12, padding: '5px 12px' }}>
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid #21262d' }}>
              <Button variant="ghost"   onClick={() => setView('login')}    style={{ fontSize: 12 }}>Login</Button>
              <Button variant="primary" onClick={() => setView('register')} style={{ fontSize: 12 }}>Register</Button>
            </div>
          )}
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

          {isSuperAdmin && (
            <button
              onClick={() => handleNav('super-admin')}
              style={{
                padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                background: view === 'super-admin' ? 'rgba(249,115,22,0.1)' : 'transparent',
                color: view === 'super-admin' ? '#f97316' : '#e6edf3',
              }}
            >👑 Users</button>
          )}

          {isAdmin && (
            <button
              onClick={handleAdd}
              style={{
                padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
                marginTop: 4,
              }}
            >＋ Add Match</button>
          )}

          <div style={{ borderTop: '1px solid #21262d', marginTop: 8, paddingTop: 12 }}>
            {user ? (
              <>
                <div style={{ padding: '4px 16px 10px', fontSize: 12, color: '#8b949e' }}>
                  Signed in as <strong style={{ color: '#e6edf3' }}>{user.name}</strong>
                  {' '}
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 10,
                    background: 'rgba(249,115,22,0.1)', color: '#f97316',
                  }}>{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                    background: 'transparent', color: '#ef4444', width: '100%',
                  }}
                >🚪 Logout</button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => handleNav('login')}
                  style={{
                    padding: '12px 16px', borderRadius: 8, border: '1px solid #30363d', cursor: 'pointer',
                    fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                    background: 'transparent', color: '#e6edf3',
                  }}
                >Login</button>
                <button
                  onClick={() => handleNav('register')}
                  style={{
                    padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                    background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
                  }}
                >Register</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
