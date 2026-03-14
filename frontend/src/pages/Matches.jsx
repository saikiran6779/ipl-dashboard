import { useState } from 'react'
import { TeamChip, EmptyState, Spinner } from '../components/UI'
import ScorecardModal from './Scorecard'
import { useAuth } from '../context/AuthContext'

export default function Matches({ matches, loading, onEdit, onDelete }) {
  const { isAdmin } = useAuth()
    const [scorecardMatch, setScorecardMatch] = useState(null)

    if (loading) return <Spinner />

    return (
        <div>
            {/* Scorecard modal */}
            {scorecardMatch && (
                <ScorecardModal
                    match={scorecardMatch}
                    onClose={() => setScorecardMatch(null)}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316' }}>
                    All Matches
                </h2>
                <span style={{ fontSize: 12, color: '#8b949e' }}>
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
                            background: '#161b22', border: '1px solid #21262d',
                            borderRadius: 14, padding: 16,
                            transition: 'border-color 0.2s',
                        }}
                             onMouseEnter={e => e.currentTarget.style.borderColor = '#30363d'}
                             onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                        >
                            {/* Meta row */}
                            <div className="match-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ fontSize: 11, color: '#8b949e' }}>
                                    {m.matchNo ? `Match ${m.matchNo} · ` : ''}{m.date}{m.venue ? ` · ${m.venue}` : ''}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={() => setScorecardMatch(m)}
                                        style={{
                                            padding: '4px 10px', background: '#21262d', border: '1px solid #30363d',
                                            borderRadius: 6, color: '#f97316', cursor: 'pointer', fontSize: 12,
                                            fontWeight: 600, transition: 'background 0.15s, border-color 0.15s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = '#f97316' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#21262d'; e.currentTarget.style.borderColor = '#30363d' }}
                                    >
                                        📋 Scorecard
                                    </button>
                                    {isAdmin && <>
                                      <button
                                          onClick={() => onEdit(m)}
                                          style={{ padding: '4px 10px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', cursor: 'pointer', fontSize: 12 }}
                                      >✏️ Edit</button>
                                      <button
                                          onClick={() => onDelete(m.id)}
                                          style={{ padding: '4px 10px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                                      >🗑️</button>
                                    </>}
                                </div>
                            </div>

                            {/* Scores */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <TeamChip teamId={m.team1} score={m.team1Score} wickets={m.team1Wickets} overs={m.team1Overs} won={!m.noResult && m.winner === m.team1} size="lg" />
                                <span style={{ color: '#8b949e', fontWeight: 700, padding: '0 4px' }}>VS</span>
                                <TeamChip teamId={m.team2} score={m.team2Score} wickets={m.team2Wickets} overs={m.team2Overs} won={!m.noResult && m.winner === m.team2} size="lg" />

                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    {m.noResult ? (
                                        <div style={{ fontWeight: 700, color: '#8b949e', fontSize: 13, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, padding: '2px 8px', display: 'inline-block' }}>No Result</div>
                                    ) : (
                                        <div style={{ fontWeight: 700, color: '#f97316', fontSize: 13 }}>{m.winner} won</div>
                                    )}
                                    {!m.noResult && m.winMargin && <div style={{ fontSize: 12, color: '#8b949e' }}>by {m.winMargin} {m.winType}</div>}
                                    {m.playerOfMatch && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>⭐ {m.playerOfMatch}</div>}
                                </div>
                            </div>

                            {/* Toss */}
                            {m.tossWinner && (
                                <div style={{ marginTop: 10, fontSize: 11, color: '#8b949e', borderTop: '1px solid #21262d', paddingTop: 8 }}>
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