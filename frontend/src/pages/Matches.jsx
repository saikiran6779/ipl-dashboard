import { useState } from 'react'
import { TeamLogo, EmptyState, Spinner } from '../components/UI'
import ScorecardModal from './Scorecard'
import { useAuth } from '../context/AuthContext'
import { getTeam, formatDate } from '../services/constants'

// ── Single match card ──────────────────────────────────────────────────────

const TEAL = '#0d9488'

function MatchCard({ m, onEdit, onDelete, onScorecard, onImport, isAdmin }) {
  const [hovered, setHovered] = useState(false)

  const team1Won = !m.noResult && m.winner === m.team1
  const team2Won = !m.noResult && m.winner === m.team2
  const t1 = getTeam(m.team1)
  const t2 = getTeam(m.team2)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${hovered ? 'var(--border-input)' : 'var(--border-subtle)'}`,
        borderRadius: 16,
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.13)' : 'var(--shadow-card)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* ── Top accent bar: winner's team colour ── */}
      {!m.noResult && m.winner && (() => {
        const winTeam = getTeam(m.winner)
        return (
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${winTeam.color}, ${winTeam.color}44)`,
          }} />
        )
      })()}

      <div style={{ padding: '14px 16px' }}>

        {/* ── Meta row ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {m.matchNo && (
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 1,
                color: '#fff', background: '#f97316', borderRadius: 4,
                padding: '1px 6px', lineHeight: 1.4,
              }}>M{m.matchNo}</span>
            )}
            <span>{formatDate(m.date)}</span>
            {m.venueName && <span style={{ color: 'var(--text-muted)' }}>· {m.venueName}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onScorecard}
              style={{
                padding: '4px 10px', background: 'var(--bg-hover)',
                border: '1px solid var(--border-input)', borderRadius: 6,
                color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = '#f97316' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-input)' }}
            >📋 Scorecard</button>
            {isAdmin && <>
              <button
                onClick={onImport}
                style={{
                  padding: '4px 10px', background: `${TEAL}15`,
                  border: `1px solid ${TEAL}55`, borderRadius: 6, color: TEAL,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${TEAL}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${TEAL}15`}
              >📂 Import</button>
              <button
                onClick={onEdit}
                style={{ padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}
              >✏️ Edit</button>
              <button
                onClick={onDelete}
                style={{ padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
              >🗑️</button>
            </>}
          </div>
        </div>

        {/* ── Battle row: Team1 | Result | Team2 ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 148px 1fr',
          alignItems: 'center',
          gap: 0,
        }}>

          {/* Team 1 — right-aligned */}
          <TeamSide
            teamId={m.team1}
            score={m.team1Score}
            wickets={m.team1Wickets}
            overs={m.team1Overs}
            won={team1Won}
            align="right"
            team={t1}
          />

          {/* Center result */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            {m.noResult ? (
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)', borderRadius: 20,
                padding: '6px 12px', display: 'inline-block',
              }}>
                No Result
              </div>
            ) : (
              <WinnerBadge match={m} />
            )}
          </div>

          {/* Team 2 — left-aligned */}
          <TeamSide
            teamId={m.team2}
            score={m.team2Score}
            wickets={m.team2Wickets}
            overs={m.team2Overs}
            won={team2Won}
            align="left"
            team={t2}
          />
        </div>

        {/* ── Toss footer ── */}
        {m.tossWinner && (
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 11, color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>🪙</span>
            <span>{m.tossWinner} won toss · elected to {m.tossDecision}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Team side (left or right) ──────────────────────────────────────────────

function TeamSide({ teamId, score, wickets, overs, won, align, team }) {
  const isRight = align === 'right'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isRight ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 10,
      background: won
        ? `linear-gradient(${isRight ? '270deg' : '90deg'}, ${team.color}12, transparent)`
        : 'transparent',
      transition: 'background 0.3s',
    }}>
      {/* Logo */}
      <div style={{
        flexShrink: 0,
        filter: won ? 'none' : 'grayscale(40%) opacity(0.6)',
        transition: 'filter 0.3s',
      }}>
        <TeamLogo teamId={teamId} size={44} />
      </div>

      {/* Text */}
      <div style={{ textAlign: isRight ? 'right' : 'left' }}>
        <div style={{
          fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
          color: won ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}>
          {teamId}
        </div>
        {score != null ? (
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 26, lineHeight: 1.1,
            color: won ? team.color : 'var(--text-muted)',
            letterSpacing: 1,
          }}>
            {score}{wickets != null ? `/${wickets}` : ''}{overs ? ` (${overs})` : ''}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>—</div>
        )}
      </div>
    </div>
  )
}

// ── Winner badge (center column) ───────────────────────────────────────────

function WinnerBadge({ match: m }) {
  const winTeam = getTeam(m.winner)
  return (
    <div>
      {/* Trophy pill */}
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
        background: `linear-gradient(135deg, ${winTeam.color}22, ${winTeam.color}0a)`,
        border: `1px solid ${winTeam.color}55`,
        borderRadius: 12, padding: '8px 14px',
        minWidth: 110,
      }}>
        <span style={{ fontSize: 18, lineHeight: 1, marginBottom: 2 }}>🏆</span>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20, color: winTeam.color,
          letterSpacing: 2, lineHeight: 1,
        }}>{m.winner}</div>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>Winner</div>
      </div>

      {/* Margin */}
      {m.winMargin && (
        <div style={{
          marginTop: 5, fontSize: 11,
          color: 'var(--text-secondary)', fontWeight: 600,
        }}>
          by {m.winMargin} {m.winType}
        </div>
      )}

      {/* MOM */}
      {m.playerOfMatchName && (
        <div style={{
          marginTop: 4, fontSize: 10,
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          <span style={{ color: '#f59e0b' }}>⭐</span>
          <span>{m.playerOfMatchName}</span>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Matches({ matches, loading, onEdit, onDelete }) {
  const { isAdmin } = useAuth()
  const [scorecardMatch, setScorecardMatch] = useState(null)
  const [importMatch,    setImportMatch]    = useState(null)

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
      {importMatch && (
        <ScorecardModal
          match={importMatch}
          onClose={() => setImportMatch(null)}
          isAdmin={isAdmin}
          openImportDirectly={true}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', margin: 0 }}>
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
            <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <MatchCard
                m={m}
                isAdmin={isAdmin}
                onScorecard={() => setScorecardMatch(m)}
                onImport={() => setImportMatch(m)}
                onEdit={() => onEdit(m)}
                onDelete={() => onDelete(m.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
