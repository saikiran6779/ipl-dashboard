import { useState } from 'react'
import toast from 'react-hot-toast'
import { forgotPassword } from '../services/api'
import { Card, Input, Button } from '../components/UI'

export default function ForgotPassword({ onNavigate }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword({ email })
      setSent(true)
    } catch {
      // Always show success to avoid email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Forgot Password</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {sent ? 'Check your inbox' : "We'll email you a reset link"}
        </div>
      </div>

      <Card>
        {sent ? (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>Reset link sent!</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              If an account exists for <strong style={{ color: '#f97316' }}>{email}</strong>,
              you'll receive an email with instructions shortly.
            </p>
            <Button variant="ghost" onClick={() => onNavigate('login')} style={{ width: '100%' }}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 18px' }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onNavigate('login')} style={{ width: '100%' }}>
              Back to Login
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
