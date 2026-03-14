import { useState } from 'react'
import { Swords, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/UI'

export default function Login({ onNavigate }) {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🏏')
      onNavigate('dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: '0 20px' }} className="fade-up">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg,#f97316,#dc2626)',
          borderRadius: 20, width: 68, height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
        }}><Swords size={34} strokeWidth={1.5} color="#fff" /></div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: 3,
          background: 'linear-gradient(135deg, #f97316, #dc2626)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>IPL 2025</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Sign in to your account</div>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(22,27,34,0.9)',
        border: '1px solid rgba(48,54,61,0.7)',
        borderRadius: 20, overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #f97316, #dc2626)' }} />

        <form onSubmit={handleSubmit} style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              cursor: 'pointer', textAlign: 'right', padding: 0,
              fontFamily: 'var(--font-body)', fontWeight: 600,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fb923c'}
            onMouseLeave={e => e.currentTarget.style.color = '#f97316'}
          >
            Forgot password?
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 18px', marginTop: 4,
              borderRadius: 10, border: 'none',
              background: loading ? '#374151' : 'linear-gradient(135deg, #f97316, #dc2626)',
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(249,115,22,0.35)',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : <><Lock size={16} strokeWidth={2} /> Sign In</>}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 20 }}>
        Don't have an account?{' '}
        <button
          onClick={() => onNavigate('register')}
          style={{
            background: 'none', border: 'none', color: '#f97316', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
          }}
        >
          Register now →
        </button>
      </p>
    </div>
  )
}
