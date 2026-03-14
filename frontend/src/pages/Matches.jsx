import { useState } from 'react'
import { TeamChip, EmptyState, Spinner } from '../components/UI'
import ScorecardModal from './Scorecard'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../services/constants'

export default function Matches({ matches, loading, onEdit, onDelete }) {
  const { isAdmin } = useAuth()
  const [scorecardMatch, setScorecardMatch] = useState(null)

  if (loading) return <Spinner />

  return (
    <div>
      {scorecardMatch && (
        <ScorecardModal
          match={scorecardMatch}
          onClose={() => setScorecardMatch(null)}
          isAdmin={isAdmin}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316' }}>
          All Matches
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''} recorded
        </span>
      </div>

      {!matches.length ? (
        <EmptyState icon="🏏" text="No matches yet" sub='Click "Add Match" to get started' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matches.map((m, i) => (
            <div key={m.id} className="fade-up" style={{
              animationDelay: `${i * 0.04}s`,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 14, padding: 16,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: 'var(--shadow-card)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
            >
              {/* Meta row */}
              <div className="match-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {m.matchNo ? <span style={{ color: '#f97316', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, marginRight: 6 }}>M{m.matchNo}</span> : null}
                  {formatDate(m.date)}{m.venueName ? ` · ${m.venueName}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setScorecardMatch(m)}
                    style={{
                      padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)',
                      borderRadius: 6, color: '#f97316', cursor: 'pointer', fontSize: 12,
                      fontWeight: 600, transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = '#f97316' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-input)' }}
                  >📋 Scorecard</button>
                  {isAdmin && <>
                    <button
                      onClick={() => onEdit(m)}
                      style={{ padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}
                    >✏️ Edit</button>
                    <button
                      onClick={() => onDelete(m.id)}
                      style={{ padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                    >🗑️</button>
                  </>}
                </div>
              </div>

              {/* Scores */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <TeamChip teamId={m.team1} score={m.team1Score} wickets={m.team1Wickets} overs={m.team1Overs} won={!m.noResult && m.winner === m.team1} size="lg" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700, padding: '0 4px' }}>VS</span>
                <TeamChip teamId={m.team2} score={m.team2Score} wickets={m.team2Wickets} overs={m.team2Overs} won={!m.noResult && m.winner === m.team2} size="lg" />

                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  {m.noResult ? (
                    <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 8px', display: 'inline-block' }}>No Result</div>
                  ) : (
                    <div style={{ fontWeight: 700, color: '#f97316', fontSize: 13 }}>{m.winner} won</div>
                  )}
                  {!m.noResult && m.winMargin && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>by {m.winMargin} {m.winType}</div>}
                  {m.playerOfMatchName && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>⭐ {m.playerOfMatchName}</div>}
                </div>
              </div>

              {/* Toss */}
              {m.tossWinner && (
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  🪙 {m.tossWinner} won toss · elected to {m.tossDecision}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
