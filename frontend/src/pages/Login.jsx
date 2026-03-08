import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Card, Input, Button } from '../components/UI'

export default function Login({ onNavigate }) {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      onNavigate('dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg,#f97316,#dc2626)', borderRadius: 14,
          width: 56, height: 56, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28, margin: '0 auto 16px',
        }}>🏏</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f97316', letterSpacing: 2 }}>
          IPL 2025
        </div>
        <div style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Sign in to your account</div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            required
          />

          <button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            style={{
              background: 'none', border: 'none', color: '#f97316', fontSize: 12,
              cursor: 'pointer', textAlign: 'right', padding: 0, fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Forgot password?
          </button>

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 18px', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Card>

      <p style={{ textAlign: 'center', color: '#8b949e', fontSize: 13, marginTop: 20 }}>
        Don't have an account?{' '}
        <button
          onClick={() => onNavigate('register')}
          style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}
        >
          Register
        </button>
      </p>
    </div>
  )
}
