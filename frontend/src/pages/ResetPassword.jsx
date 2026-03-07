import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { resetPassword } from '../services/api'
import { Card, Input, Button } from '../components/UI'

export default function ResetPassword({ onNavigate }) {
  const [form,    setForm]    = useState({ password: '', confirm: '' })
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) setToken(t)
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!token) {
      toast.error('Missing reset token — please use the link from your email')
      return
    }
    setLoading(true)
    try {
      await resetPassword({ token, password: form.password })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#8b949e' }}>Invalid reset link. Please request a new one.</p>
        <Button variant="ghost" onClick={() => onNavigate('forgot-password')} style={{ marginTop: 16 }}>
          Request New Link
        </Button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#e6edf3', marginBottom: 6 }}>Reset Password</div>
        <div style={{ color: '#8b949e', fontSize: 13 }}>Choose a strong new password</div>
      </div>

      <Card>
        {done ? (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
            <p style={{ color: '#e6edf3', marginBottom: 8, fontWeight: 600 }}>Password reset!</p>
            <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>
              Your password has been updated. You can now sign in.
            </p>
            <Button variant="primary" onClick={() => onNavigate('login')} style={{ width: '100%' }}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
              required
              autoFocus
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 18px' }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
