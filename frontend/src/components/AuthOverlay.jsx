import { Swords, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CONFIG = {
  login: {
    Icon: Swords,
    title: 'Signing In',
    subtitle: 'Welcome back to IPL 2025',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #dc2626)',
  },
  register: {
    Icon: Sparkles,
    title: 'Creating Account',
    subtitle: 'Joining IPL 2025 Season',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
  logout: {
    Icon: LogOut,
    title: 'Signing Out',
    subtitle: 'See you next match!',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  },
}

export default function AuthOverlay() {
  const { authAction } = useAuth()

  if (!authAction) return null

  const cfg = CONFIG[authAction] || CONFIG.login

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(13, 17, 23, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'authOverlayIn 0.25s ease both',
    }}>
      <style>{`
        @keyframes authOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes authPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes authDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        animation: 'authSlideUp 0.3s ease both',
      }}>
        {/* Spinning ring + icon */}
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          {/* Outer spinning ring */}
          <svg width={100} height={100} style={{
            position: 'absolute', inset: 0,
            animation: 'authSpin 1.2s linear infinite',
          }}>
            <circle cx={50} cy={50} r={44}
              fill="none"
              stroke={`${cfg.color}33`}
              strokeWidth={4}
            />
            <circle cx={50} cy={50} r={44}
              fill="none"
              stroke={cfg.color}
              strokeWidth={4}
              strokeDasharray="60 220"
              strokeLinecap="round"
            />
          </svg>
          {/* Inner icon */}
          <div style={{
            position: 'absolute', inset: 12,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${cfg.color}22, transparent)`,
            border: `1px solid ${cfg.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'authPulse 1.5s ease-in-out infinite',
          }}>
            <cfg.Icon size={32} strokeWidth={1.5} color={cfg.color} />
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)', letterSpacing: 3,
            background: cfg.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}>{cfg.title}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: '#8b949e', marginTop: 6 }}>{cfg.subtitle}</div>
        </div>

        {/* Bouncing dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: cfg.color,
              animation: `authDotBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
