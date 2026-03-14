import { useState } from 'react'
import { Button } from './UI'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Dashboard', activeFor: ['dashboard'] },
  { id: 'teams',     label: '🛡️ Teams',     activeFor: ['teams'] },
  { id: 'matches',   label: '📋 Matches',   activeFor: ['matches'] },
  { id: 'players',   label: '👤 Players',   activeFor: ['players', 'profile'] },
]

export default function Header({ view, setView, onAddClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAdmin, isSuperAdmin, logout } = useAuth()

  const handleNav = (id) => { setView(id); setMenuOpen(false) }
  const handleAdd = () => { onAddClick(); setMenuOpen(false) }

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    toast.success('Logged out successfully')
    setView('dashboard')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* ── Top gradient bar ── */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #f97316 0%, #dc2626 30%, #8b5cf6 60%, #3b82f6 100%)',
      }} />

      {/* ── Main navbar ── */}
      <div style={{
        background: 'rgba(8, 12, 18, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
        }}>
          {/* Logo */}
          <div
            onClick={() => setView('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div style={{
              background: 'linear-gradient(135deg,#f97316,#dc2626)',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
              flexShrink: 0,
            }}>🏏</div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20, letterSpacing: 3,
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>IPL 2025</div>
              <div style={{ fontSize: 9, color: '#8b949e', letterSpacing: 3, textTransform: 'uppercase' }}>Season Dashboard</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="nav-desktop" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {NAV_ITEMS.map(item => {
              const active = item.activeFor.includes(view)
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 8,
                    border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                    background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: active ? '#f97316' : '#8b949e',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.background = 'transparent' }}}
                >
                  {item.label}
                </button>
              )
            })}

            {isSuperAdmin && (
              <button
                onClick={() => setView('super-admin')}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: view === 'super-admin' ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                  background: view === 'super-admin' ? 'rgba(249,115,22,0.1)' : 'transparent',
                  color: view === 'super-admin' ? '#f97316' : '#8b949e',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                }}
              >👑 Users</button>
            )}

            {isAdmin && (
              <button
                onClick={onAddClick}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#f97316,#dc2626)',
                  color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.2s',
                  boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >＋ Add Match</button>
            )}

            {/* Auth section */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 6, paddingLeft: 10, borderLeft: '1px solid rgba(48,54,61,0.6)' }}>
              {user ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                    padding: '5px 12px', border: '1px solid rgba(48,54,61,0.6)',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f97316, #dc2626)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
                    <span style={{ fontSize: 12, color: '#e6edf3', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                    {user.role !== 'USER' && (
                      <span style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 4,
                        background: 'rgba(249,115,22,0.15)', color: '#f97316',
                        fontWeight: 700, letterSpacing: 0.5,
                      }}>{user.role}</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#ef4444', cursor: 'pointer',
                      fontWeight: 600, fontSize: 12,
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                  >Logout</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setView('login')}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      border: '1px solid rgba(48,54,61,0.8)',
                      background: 'transparent', color: '#e6edf3',
                      cursor: 'pointer', fontWeight: 600, fontSize: 12,
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = '#8b949e' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)' }}
                  >Login</button>
                  <button
                    onClick={() => setView('register')}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg,#f97316,#dc2626)',
                      color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      fontFamily: 'DM Sans, sans-serif',
                      boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
                    }}
                  >Register</button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: menuOpen ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${menuOpen ? 'rgba(249,115,22,0.5)' : 'rgba(48,54,61,0.6)'}`,
              borderRadius: 8, color: menuOpen ? '#f97316' : '#e6edf3',
              cursor: 'pointer', fontSize: 18, width: 38, height: 38,
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(8, 12, 18, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
          padding: '12px 16px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
          animation: 'fadeUp 0.2s ease both',
        }}>
          {NAV_ITEMS.map(item => {
            const active = item.activeFor.includes(view)
            return (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{
                padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                color: active ? '#f97316' : '#e6edf3',
                transition: 'all 0.2s',
              }}>{item.label}</button>
            )
          })}

          {isSuperAdmin && (
            <button onClick={() => handleNav('super-admin')} style={{
              padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
              background: view === 'super-admin' ? 'rgba(249,115,22,0.1)' : 'transparent',
              color: view === 'super-admin' ? '#f97316' : '#e6edf3',
            }}>👑 Users</button>
          )}

          {isAdmin && (
            <button onClick={handleAdd} style={{
              padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
              background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
              marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
            }}>＋ Add Match</button>
          )}

          <div style={{ borderTop: '1px solid rgba(48,54,61,0.6)', marginTop: 8, paddingTop: 12 }}>
            {user ? (
              <>
                <div style={{ padding: '4px 16px 10px', fontSize: 13, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #dc2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
                  <div>
                    <strong style={{ color: '#e6edf3', fontSize: 13 }}>{user.name}</strong>
                    <div style={{ fontSize: 10, color: '#f97316', marginTop: 1 }}>{user.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444', width: '100%',
                }}>🚪 Sign Out</button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => handleNav('login')} style={{
                  padding: '12px 16px', borderRadius: 10,
                  border: '1px solid rgba(48,54,61,0.8)', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                  background: 'transparent', color: '#e6edf3',
                }}>Login</button>
                <button onClick={() => handleNav('register')} style={{
                  padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                  background: 'linear-gradient(135deg,#f97316,#dc2626)', color: '#fff',
                }}>Register</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
