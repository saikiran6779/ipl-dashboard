import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Card, Input, Button } from '../components/UI'

export default function Register({ onNavigate }) {
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

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
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome.')
      onNavigate('dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
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
        <div style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Create your account</div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
            required
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={set('password')}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={set('confirm')}
            required
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 18px', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      </Card>

      <p style={{ textAlign: 'center', color: '#8b949e', fontSize: 13, marginTop: 20 }}>
        Already have an account?{' '}
        <button
          onClick={() => onNavigate('login')}
          style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
