import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  BarChart2, Shield, CalendarDays, MapPin, User, Crown,
  Sun, Moon, LogOut, X, Menu, Swords, Plus,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: BarChart2 },
  { id: 'teams',     label: 'Teams',     Icon: Shield },
  { id: 'matches',   label: 'Matches',   Icon: CalendarDays },
  { id: 'venues',    label: 'Venues',    Icon: MapPin },
  { id: 'players',   label: 'Players',   Icon: User },
]

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: '1px solid var(--border-input)',
        background: 'var(--bg-hover)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      {isDark
        ? <Sun size={16} strokeWidth={2} />
        : <Moon size={16} strokeWidth={2} />
      }
    </button>
  )
}

function UserDropdown({ user, isSuperAdmin, setView, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const initial = user.name?.[0]?.toUpperCase() || 'U'
  const roleColor = user.role === 'SUPER_ADMIN' ? '#a855f7' : user.role === 'ADMIN' ? '#f97316' : '#6b7280'
  const roleLabel = user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'Viewer'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={user.name}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px 4px 5px',
          borderRadius: 20, border: '1px solid var(--border-input)',
          background: open ? 'var(--bg-hover)' : 'transparent',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = 'var(--border-input)' }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>{initial}</div>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)', fontWeight: 600,
          color: 'var(--text-primary)',
          maxWidth: 90, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{user.name?.split(' ')[0]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          minWidth: 200, zIndex: 200,
          animation: 'fadeDown 0.15s ease both',
        }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>{initial}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)', fontWeight: 700,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{user.name}</div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: 0.5,
                  color: roleColor, marginTop: 2, textTransform: 'uppercase',
                }}>{roleLabel}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '6px' }}>
            {isSuperAdmin && (
              <button
                onClick={() => { setView('super-admin'); setOpen(false) }}
                style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Crown size={18} strokeWidth={1.8} />
                <span>Manage Users</span>
              </button>
            )}
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              style={{ ...menuItemStyle, color: '#ef4444' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} strokeWidth={2} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const menuItemStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: 'none', background: 'transparent',
  color: 'var(--text-primary)', cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
  transition: 'background 0.15s',
}

export default function Header({ view, setView, onAddClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAdmin, isSuperAdmin, logout } = useAuth()

  const handleNav = (id) => { setView(id); setMenuOpen(false) }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    setView('dashboard')
  }

  const allNavItems = [
    ...NAV_ITEMS,
    ...(isSuperAdmin ? [{ id: 'super-admin', label: 'Users', Icon: Crown }] : []),
  ]

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #f97316 0%, #dc2626 35%, #8b5cf6 65%, #3b82f6 100%)',
      }} />

      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 8, height: 58,
        }}>

          {/* Logo */}
          <div
            onClick={() => setView('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, marginRight: 8 }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #f97316, #dc2626)',
              borderRadius: 10, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(249,115,22,0.4)',
            }}>
              <Swords size={18} strokeWidth={1.8} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 19, letterSpacing: 3,
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>IPL 2025</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 8, color: 'var(--text-muted)', letterSpacing: 2.5, textTransform: 'uppercase',
              }}>Season Dashboard</div>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />

          {/* Desktop Nav */}
          <nav className="nav-desktop" style={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
            {allNavItems.map(item => {
              const active = item.id === 'super-admin'
                ? view === 'super-admin'
                : item.id === 'players'
                  ? ['players', 'profile'].includes(view)
                  : view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: 'none',
                    background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: active ? '#f97316' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: active ? 700 : 500,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}}
                >
                  <item.Icon size={18} strokeWidth={1.8} />
                  {item.label}
                  {active && (
                    <div style={{
                      position: 'absolute', bottom: 2, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 20, height: 2, borderRadius: 2,
                      background: '#f97316',
                    }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {isAdmin && (
              <button
                onClick={onAddClick}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #f97316, #dc2626)',
                  color: '#fff', cursor: 'pointer', fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  boxShadow: '0 2px 10px rgba(249,115,22,0.35)',
                  transition: 'opacity 0.15s, transform 0.15s',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
              >
                <Plus size={14} strokeWidth={2} />
                Add Match
              </button>
            )}

            <ThemeToggle />

            <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />

            {user ? (
              <UserDropdown
                user={user}
                isSuperAdmin={isSuperAdmin}
                setView={setView}
                onLogout={handleLogout}
              />
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setView('login')}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: '1px solid var(--border-input)',
                    background: 'transparent', color: 'var(--text-primary)',
                    cursor: 'pointer', fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Login</button>
                <button
                  onClick={() => setView('register')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #f97316, #dc2626)',
                    color: '#fff', cursor: 'pointer', fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
                  }}
                >Register</button>
              </div>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="nav-mobile-btn" style={{ display: 'none', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{
                background: menuOpen ? 'rgba(249,115,22,0.1)' : 'var(--bg-hover)',
                border: `1px solid ${menuOpen ? 'rgba(249,115,22,0.5)' : 'var(--border-input)'}`,
                borderRadius: 8, color: menuOpen ? '#f97316' : 'var(--text-primary)',
                cursor: 'pointer', width: 38, height: 38,
                transition: 'all 0.2s', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {menuOpen
                ? <X size={20} strokeWidth={2} />
                : <Menu size={20} strokeWidth={2} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-header)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '8px 12px 14px',
          display: 'flex', flexDirection: 'column', gap: 2,
          animation: 'fadeUp 0.2s ease both',
        }}>
          {allNavItems.map(item => {
            const active = view === item.id || (item.id === 'players' && view === 'profile')
            return (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{
                padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontWeight: active ? 700 : 600,
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                textAlign: 'left', background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                color: active ? '#f97316' : 'var(--text-primary)', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <item.Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            )
          })}

          {isAdmin && (
            <button onClick={() => { onAddClick(); setMenuOpen(false) }} style={{
              padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              textAlign: 'left',
              background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff',
              marginTop: 6, boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Plus size={14} strokeWidth={2} />
              Add Match
            </button>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 10 }}>
            {user ? (
              <>
                <div style={{ padding: '4px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #dc2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)',
                    }}>{user.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)', fontWeight: 700, color: '#f97316',
                      marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{user.role}</div>
                  </div>
                </div>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} style={{
                  padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  textAlign: 'left',
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444', width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <LogOut size={16} strokeWidth={2} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => handleNav('login')} style={{
                  padding: '11px 14px', borderRadius: 10,
                  border: '1px solid var(--border-input)', cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  background: 'transparent', color: 'var(--text-primary)',
                }}>Login</button>
                <button onClick={() => handleNav('register')} style={{
                  padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff',
                }}>Register</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </header>
  )
}
