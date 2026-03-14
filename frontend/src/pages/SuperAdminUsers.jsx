import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getAllUsers, promoteUser, demoteUser } from '../services/api'
import { Card, CardHeader, Spinner, SectionLabel, Button } from '../components/UI'
import { useAuth } from '../context/AuthContext'

const ROLE_COLORS = {
  SUPER_ADMIN: '#f97316',
  ADMIN:       '#22c55e',
  USER:        'var(--text-secondary)',
}

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  USER:        'User',
}

function RoleBadge({ role }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      background: `${ROLE_COLORS[role]}22`,
      color: ROLE_COLORS[role],
      border: `1px solid ${ROLE_COLORS[role]}44`,
      textTransform: 'uppercase',
    }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

export default function SuperAdminUsers() {
  const { user: currentUser } = useAuth()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(null)  // userId being acted on

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handlePromote = async (userId, name) => {
    if (!window.confirm(`Promote ${name} to ADMIN?`)) return
    setBusy(userId)
    try {
      await promoteUser(userId)
      toast.success(`${name} promoted to Admin`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to promote user')
    } finally {
      setBusy(null)
    }
  }

  const handleDemote = async (userId, name) => {
    if (!window.confirm(`Demote ${name} back to USER?`)) return
    setBusy(userId)
    try {
      await demoteUser(userId)
      toast.success(`${name} demoted to User`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to demote user')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f97316', letterSpacing: 2, lineHeight: 1 }}>
          User Management
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Promote trusted users to Admin or demote Admins back to User.
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <CardHeader
            title={`All Users (${users.length})`}
            subtitle="SUPER_ADMIN role cannot be changed"
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                      background: u.id === currentUser?.id ? 'rgba(249,115,22,0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-secondary)' }}>(you)</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.role === 'SUPER_ADMIN' && (
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Protected</span>
                      )}
                      {u.role === 'USER' && (
                        <Button
                          variant="ghost"
                          disabled={busy === u.id}
                          onClick={() => handlePromote(u.id, u.name)}
                          style={{ fontSize: 12, padding: '5px 12px' }}
                        >
                          {busy === u.id ? '…' : '↑ Promote'}
                        </Button>
                      )}
                      {u.role === 'ADMIN' && (
                        <Button
                          variant="danger"
                          disabled={busy === u.id}
                          onClick={() => handleDemote(u.id, u.name)}
                          style={{ fontSize: 12, padding: '5px 12px' }}
                        >
                          {busy === u.id ? '…' : '↓ Demote'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users found
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
