import { useState } from 'react'
import { Sparkles, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/UI'

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
      toast.success('Account created! Welcome to IPL 2025 🎉')
      onNavigate('dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: '0 20px' }} className="fade-up">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg,#22c55e,#16a34a)',
          borderRadius: 20, width: 68, height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
        }}><Sparkles size={34} strokeWidth={1.5} color="#fff" /></div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: 3,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Join IPL 2025</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Create your account</div>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(22,27,34,0.9)',
        border: '1px solid rgba(48,54,61,0.7)',
        borderRadius: 20, overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />

        <form onSubmit={handleSubmit} style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 18px', marginTop: 4,
              borderRadius: 10, border: 'none',
              background: loading ? '#374151' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(34,197,94,0.35)',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : <><Rocket size={16} strokeWidth={2} /> Create Account</>}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 20 }}>
        Already have an account?{' '}
        <button
          onClick={() => onNavigate('login')}
          style={{
            background: 'none', border: 'none', color: '#f97316', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
          }}
        >
          Sign in →
        </button>
      </p>
    </div>
  )
}
