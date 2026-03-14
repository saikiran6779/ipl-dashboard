import { useState } from 'react'
import { TeamLogo, EmptyState, Spinner } from '../components/UI'
import ScorecardModal from './Scorecard'
import { useAuth } from '../context/AuthContext'
import { getTeam, formatDate } from '../services/constants'
import { ClipboardList, FileJson, Pencil, Trash2, Trophy, Star, Coins, Plus } from 'lucide-react'

const TEAL = '#0d9488'

function MatchCard({ m, onEdit, onDelete, onOpenMatch, onImport, isAdmin }) {
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

        {/* Meta row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {m.matchNo && (
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)', letterSpacing: 1,
                color: '#fff', background: '#f97316', borderRadius: 4,
                padding: '1px 6px', lineHeight: 1.4,
              }}>M{m.matchNo}</span>
            )}
            <span>{formatDate(m.date)}</span>
            {m.venueName && <span style={{ color: 'var(--text-muted)' }}>· {m.venueName}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onOpenMatch}
              style={{
                padding: '4px 10px', background: 'var(--bg-hover)',
                border: '1px solid var(--border-input)', borderRadius: 6,
                color: '#f97316', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = '#f97316' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-input)' }}
            >
              <ClipboardList size={16} strokeWidth={2} />
              Match Details
            </button>
            {isAdmin && <>
              <button
                onClick={onImport}
                style={{
                  padding: '4px 10px', background: `${TEAL}15`,
                  border: `1px solid ${TEAL}55`, borderRadius: 6, color: TEAL,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${TEAL}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${TEAL}15`}
              >
                <FileJson size={16} strokeWidth={2} />
                Import
              </button>
              <button
                onClick={onEdit}
                style={{
                  padding: '4px 10px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border-input)', borderRadius: 6,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Pencil size={14} strokeWidth={2} />
                Edit
              </button>
              <button
                onClick={onDelete}
                style={{
                  padding: '4px 10px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border-input)', borderRadius: 6,
                  color: '#ef4444', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </>}
          </div>
        </div>

        {/* Battle row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 148px 1fr',
          alignItems: 'center',
          gap: 0,
        }}>
          <TeamSide
            teamId={m.team1}
            score={m.team1Score}
            wickets={m.team1Wickets}
            overs={m.team1Overs}
            won={team1Won}
            align="right"
            team={t1}
          />
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            {m.noResult ? (
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)', borderRadius: 20,
                padding: '6px 12px', display: 'inline-block',
              }}>
                No Result
              </div>
            ) : (
              <WinnerBadge match={m} />
            )}
          </div>
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

        {/* Toss footer */}
        {m.tossWinner && (
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Coins size={14} strokeWidth={2} />
            <span>{m.tossWinner} won toss · elected to {m.tossDecision}</span>
          </div>
        )}
      </div>
    </div>
  )
}

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
      <div style={{
        flexShrink: 0,
        filter: won ? 'none' : 'grayscale(40%) opacity(0.6)',
        transition: 'filter 0.3s',
      }}>
        <TeamLogo teamId={teamId} size={44} />
      </div>

      <div style={{ textAlign: isRight ? 'right' : 'left' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800, fontSize: 'var(--text-md)', letterSpacing: 0.5,
          color: won ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}>
          {teamId}
        </div>
        {score != null ? (
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)', lineHeight: 1.1,
            color: won ? team.color : 'var(--text-muted)',
            letterSpacing: 1,
          }}>
            {score}{wickets != null ? `/${wickets}` : ''}{overs ? ` (${overs})` : ''}
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontStyle: 'italic',
          }}>—</div>
        )}
      </div>
    </div>
  )
}

function WinnerBadge({ match: m }) {
  const winTeam = getTeam(m.winner)
  return (
    <div>
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
        background: `linear-gradient(135deg, ${winTeam.color}22, ${winTeam.color}0a)`,
        border: `1px solid ${winTeam.color}55`,
        borderRadius: 12, padding: '8px 14px',
        minWidth: 110,
      }}>
        <Trophy size={20} strokeWidth={1.8} color="#f59e0b" style={{ marginBottom: 2 }} />
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-md)', color: winTeam.color,
          letterSpacing: 2, lineHeight: 1,
        }}>{m.winner}</div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>Winner</div>
      </div>

      {m.winMargin && (
        <div style={{
          marginTop: 5,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)', fontWeight: 600,
        }}>
          by {m.winMargin} {m.winType}
        </div>
      )}

      {m.playerOfMatchName && (
        <div style={{
          marginTop: 4,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          <Star size={12} strokeWidth={1.8} color="#f59e0b" />
          <span>{m.playerOfMatchName}</span>
        </div>
      )}
    </div>
  )
}

export default function Matches({ matches, loading, onEdit, onDelete, onOpenMatch }) {
  const { isAdmin } = useAuth()
  const [importMatch, setImportMatch] = useState(null)

  if (loading) return <Spinner />

  return (
    <div>
      {importMatch && (
        <ScorecardModal
          match={importMatch}
          onClose={() => setImportMatch(null)}
          isAdmin={isAdmin}
          openImportDirectly={true}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-lg)', letterSpacing: 2, color: '#f97316', margin: 0,
        }}>
          All Matches
        </h2>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        }}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''} recorded
        </span>
      </div>

      {!matches.length ? (
        <EmptyState text="No matches yet" sub='Click "Add Match" to get started' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matches.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <MatchCard
                m={m}
                isAdmin={isAdmin}
                onOpenMatch={() => onOpenMatch(m)}
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
