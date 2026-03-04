import { Button } from './UI'

export default function Header({ view, setView, onAddClick }) {
  return (
      <header style={{
        background: 'linear-gradient(135deg,#1a1f29 0%,#0d1117 100%)',
        borderBottom: '1px solid #21262d',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              background: 'linear-gradient(135deg,#f97316,#dc2626)', borderRadius: 10,
              width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🏏</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f97316', lineHeight: 1 }}>IPL 2025</div>
              <div style={{ fontSize: 10, color: '#8b949e', letterSpacing: 3, textTransform: 'uppercase' }}>Season Dashboard</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
                variant={view === 'dashboard' ? 'active' : 'inactive'}
                onClick={() => setView('dashboard')}
            >📊 Dashboard</Button>

            <Button
                variant={view === 'matches' ? 'active' : 'inactive'}
                onClick={() => setView('matches')}
            >📋 Matches</Button>

            <Button
                variant={view === 'players' || view === 'profile' ? 'active' : 'inactive'}
                onClick={() => setView('players')}
            >👤 Players</Button>

            <Button
                variant={view === 'teams' || view === 'team-profile' ? 'active' : 'inactive'}
                onClick={() => setView('teams')}
            >🏆 Teams</Button>

            <Button variant="primary" onClick={onAddClick}>＋ Add Match</Button>
          </div>
        </div>
      </header>
  )
}