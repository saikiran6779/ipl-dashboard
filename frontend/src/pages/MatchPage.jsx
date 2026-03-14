import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { TeamLogo, Spinner } from '../components/UI'
import { getScorecard, deleteScorecard } from '../services/api'
import { getTeam, formatDate } from '../services/constants'
import ScorecardModal, { ScorecardView } from './Scorecard'
import ScorecardImportModal from './ScorecardImportModal'

// ── Phase helpers ──────────────────────────────────────────────────────────
function computePhases(entries, team) {
  const batted = entries.filter(e => e.teamId === team && e.balls != null)
  return {
    ppRuns:     batted.reduce((s, e) => s + (e.ppRuns     ?? 0), 0),
    ppBalls:    batted.reduce((s, e) => s + (e.ppBalls    ?? 0), 0),
    midRuns:    batted.reduce((s, e) => s + (e.midRuns    ?? 0), 0),
    midBalls:   batted.reduce((s, e) => s + (e.midBalls   ?? 0), 0),
    deathRuns:  batted.reduce((s, e) => s + (e.deathRuns  ?? 0), 0),
    deathBalls: batted.reduce((s, e) => s + (e.deathBalls ?? 0), 0),
  }
}

// ── Hero ───────────────────────────────────────────────────────────────────
function MatchHero({ match, onBack, onEdit, onDelete, isAdmin }) {
  const t1 = getTeam(match.team1)
  const t2 = getTeam(match.team2)
  const team1Won = !match.noResult && match.winner === match.team1
  const team2Won = !match.noResult && match.winner === match.team2
  const winTeam  = match.winner ? getTeam(match.winner) : null

  return (
    <div style={{
      margin: '-28px -20px 0',
      background: `linear-gradient(135deg, ${t1.color}cc 0%, #0a0a0f 42%, #0a0a0f 58%, ${t2.color}cc 100%)`,
      padding: '24px 32px 36px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle radial glows from each team side */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 50% 100% at 0% 50%, ${t1.color}18 0%, transparent 70%),
                     radial-gradient(ellipse 50% 100% at 100% 50%, ${t2.color}18 0%, transparent 70%)`,
      }} />

      {/* Top bar: back + match no + admin actions */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, position: 'relative',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8, color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 7,
            backdropFilter: 'blur(6px)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          ← All Matches
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {match.matchNo && (
            <div style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 1.5,
              background: '#f97316', color: '#fff', borderRadius: 6, padding: '3px 10px',
            }}>M{match.matchNo}</div>
          )}
          {isAdmin && <>
            <button
              onClick={onEdit}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                padding: '6px 13px', fontSize: 12, backdropFilter: 'blur(6px)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >✏️ Edit Match</button>
            <button
              onClick={onDelete}
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 8, color: '#ef4444', cursor: 'pointer',
                padding: '6px 12px', fontSize: 12, backdropFilter: 'blur(6px)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            >🗑️</button>
          </>}
        </div>
      </div>

      {/* Meta strip: date · venue · toss */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 32,
        fontSize: 12, color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap',
        position: 'relative',
      }}>
        <span>{formatDate(match.date)}</span>
        {match.venueName && <>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span>{match.venueName}</span>
        </>}
        {match.tossWinner && <>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span>🪙 {match.tossWinner} won toss · elected to {match.tossDecision}</span>
        </>}
      </div>

      {/* Main battle row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 140px 1fr',
        gap: 16, alignItems: 'center', position: 'relative',
      }}>

        {/* Team 1 — right aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 3,
              color: team1Won ? t1.color : 'rgba(255,255,255,0.35)', marginBottom: 4,
            }}>{t1.name}</div>
            {match.team1Score != null ? (
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 54, lineHeight: 1,
                color: team1Won ? '#fff' : 'rgba(255,255,255,0.38)', letterSpacing: 1,
              }}>
                {match.team1Score}{match.team1Wickets != null ? `/${match.team1Wickets}` : ''}
              </div>
            ) : (
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>—</div>
            )}
            {match.team1Overs != null && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>
                ({match.team1Overs} overs)
              </div>
            )}
          </div>
          <div style={{
            filter: team1Won
              ? `drop-shadow(0 0 18px ${t1.color}88)`
              : 'grayscale(55%) opacity(0.45)',
            transition: 'filter 0.3s',
          }}>
            <TeamLogo teamId={match.team1} size={84} />
          </div>
        </div>

        {/* Centre: VS + winner */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 5,
            color: 'rgba(255,255,255,0.18)', marginBottom: 10,
          }}>VS</div>

          {winTeam && (
            <div style={{
              background: `linear-gradient(135deg, ${winTeam.color}44, ${winTeam.color}18)`,
              border: `1px solid ${winTeam.color}66`,
              borderRadius: 12, padding: '10px 14px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 3 }}>🏆</div>
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2,
                color: winTeam.color, lineHeight: 1,
              }}>{match.winner}</div>
              {match.winMargin && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 4 }}>
                  by {match.winMargin} {match.winType}
                </div>
              )}
            </div>
          )}

          {match.noResult && (
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '10px 14px',
              color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700,
            }}>No Result</div>
          )}
        </div>

        {/* Team 2 — left aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            filter: team2Won
              ? `drop-shadow(0 0 18px ${t2.color}88)`
              : 'grayscale(55%) opacity(0.45)',
            transition: 'filter 0.3s',
          }}>
            <TeamLogo teamId={match.team2} size={84} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 3,
              color: team2Won ? t2.color : 'rgba(255,255,255,0.35)', marginBottom: 4,
            }}>{t2.name}</div>
            {match.team2Score != null ? (
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 54, lineHeight: 1,
                color: team2Won ? '#fff' : 'rgba(255,255,255,0.38)', letterSpacing: 1,
              }}>
                {match.team2Score}{match.team2Wickets != null ? `/${match.team2Wickets}` : ''}
              </div>
            ) : (
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>—</div>
            )}
            {match.team2Overs != null && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>
                ({match.team2Overs} overs)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Performer spotlight cards ──────────────────────────────────────────────
function PerformerSpotlight({ match, onOpenProfile }) {
  const items = []
  if (match.playerOfMatchName) items.push({
    icon: '⭐', label: 'Player of the Match',
    name: match.playerOfMatchName, stat: null,
    id: match.playerOfMatchId, color: '#f59e0b',
  })
  if (match.topScorerName) items.push({
    icon: '🏏', label: 'Top Scorer',
    name: match.topScorerName,
    stat: match.topScorerRuns != null ? `${match.topScorerRuns} runs` : null,
    id: match.topScorerId, color: '#f97316',
  })
  if (match.topWicketTakerName) items.push({
    icon: '🎯', label: 'Best Bowling',
    name: match.topWicketTakerName,
    stat: match.topWicketTakerWickets != null ? `${match.topWicketTakerWickets} wickets` : null,
    id: match.topWicketTakerId, color: '#8b5cf6',
  })
  if (!items.length) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 12, marginBottom: 28,
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => item.id && onOpenProfile?.(item.id)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: '18px 22px',
            cursor: item.id ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 16,
            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            if (!item.id) return
            e.currentTarget.style.borderColor = item.color
            e.currentTarget.style.boxShadow = `0 0 0 1px ${item.color}33, 0 4px 20px ${item.color}22`
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'none'
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: item.color + '18', border: `1px solid ${item.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{item.icon}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 1.2, color: item.color, marginBottom: 4,
            }}>{item.label}</div>
            <div style={{
              fontWeight: 700, fontSize: 16, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{item.name}</div>
            {item.stat && (
              <div style={{
                fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 600,
              }}>{item.stat}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Phase analysis ─────────────────────────────────────────────────────────
function PhaseBar({ label, subLabel, team1, team2, t1Runs, t1Balls, t2Runs, t2Balls, maxRuns }) {
  const team1Info = getTeam(team1)
  const team2Info = getTeam(team2)
  const t1Pct = maxRuns > 0 ? Math.min((t1Runs / maxRuns) * 100, 100) : 0
  const t2Pct = maxRuns > 0 ? Math.min((t2Runs / maxRuns) * 100, 100) : 0
  const fmt   = (runs, balls) => balls > 0 ? ((runs / balls) * 6).toFixed(1) : '—'

  return (
    <div style={{
      flex: 1, background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '18px 20px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 18, letterSpacing: 0.5 }}>{subLabel}</div>

      {[
        { id: team1, info: team1Info, runs: t1Runs, balls: t1Balls, pct: t1Pct },
        { id: team2, info: team2Info, runs: t2Runs, balls: t2Balls, pct: t2Pct },
      ].map((side, i) => (
        <div key={side.id} style={{ marginBottom: i === 0 ? 14 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: side.info.color }}>{side.id}</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: 'var(--text-primary)', letterSpacing: 0.5 }}>
              {side.runs}
              <span style={{
                fontSize: 10, color: 'var(--text-muted)',
                fontFamily: 'Rajdhani,sans-serif', marginLeft: 5, fontWeight: 600,
              }}>RR {fmt(side.runs, side.balls)}</span>
            </span>
          </div>
          <div style={{ height: 7, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${side.pct}%`,
              background: `linear-gradient(90deg, ${side.info.color}, ${side.info.color}99)`,
              borderRadius: 4, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PhaseAnalysis({ entries, teams }) {
  const p1 = computePhases(entries, teams[0])
  const p2 = computePhases(entries, teams[1])

  const hasData = p1.ppBalls + p2.ppBalls + p1.midBalls + p2.midBalls + p1.deathBalls + p2.deathBalls > 0
  if (!hasData) return null

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="Phase Analysis" />
      <div style={{ display: 'flex', gap: 12 }}>
        <PhaseBar
          label="Powerplay" subLabel="Overs 1–6"
          team1={teams[0]} team2={teams[1]}
          t1Runs={p1.ppRuns} t1Balls={p1.ppBalls}
          t2Runs={p2.ppRuns} t2Balls={p2.ppBalls}
          maxRuns={Math.max(p1.ppRuns, p2.ppRuns, 1)}
        />
        <PhaseBar
          label="Middle Overs" subLabel="Overs 7–15"
          team1={teams[0]} team2={teams[1]}
          t1Runs={p1.midRuns} t1Balls={p1.midBalls}
          t2Runs={p2.midRuns} t2Balls={p2.midBalls}
          maxRuns={Math.max(p1.midRuns, p2.midRuns, 1)}
        />
        <PhaseBar
          label="Death Overs" subLabel="Overs 16–20"
          team1={teams[0]} team2={teams[1]}
          t1Runs={p1.deathRuns} t1Balls={p1.deathBalls}
          t2Runs={p2.deathRuns} t2Balls={p2.deathBalls}
          maxRuns={Math.max(p1.deathRuns, p2.deathRuns, 1)}
        />
      </div>
    </div>
  )
}

// ── Shared section header ──────────────────────────────────────────────────
function SectionHeader({ title, actions }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 14,
    }}>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2,
        color: '#f97316',
      }}>{title}</div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

// ── Admin action button (reusable small ghost btn) ─────────────────────────
function ActionBtn({ onClick, color = 'var(--text-secondary)', bg = 'var(--bg-hover)', border = 'var(--border-input)', children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', background: bg, border: `1px solid ${border}`,
        borderRadius: 8, color, cursor: 'pointer', fontSize: 12, fontWeight: 600,
        fontFamily: 'Rajdhani,sans-serif', transition: 'background 0.15s',
      }}
    >{children}</button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function MatchPage({ match, onBack, onEdit, onDelete, isAdmin, onOpenProfile }) {
  const [entries,     setEntries]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editModal,   setEditModal]   = useState(false)
  const [importModal, setImportModal] = useState(false)

  const teams = [match.team1, match.team2]

  useEffect(() => {
    getScorecard(match.id)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [match.id])

  const reloadScorecard = () => {
    getScorecard(match.id).then(setEntries).catch(() => {})
  }

  const handleDeleteScorecard = async () => {
    if (!window.confirm('Delete the scorecard for this match? The match itself will remain.')) return
    try {
      await deleteScorecard(match.id)
      setEntries([])
      toast.success('Scorecard deleted')
    } catch {
      toast.error('Failed to delete scorecard')
    }
  }

  const scorecardActions = isAdmin && (
    <>
      <ActionBtn
        onClick={() => setImportModal(true)}
        color='#0d9488' bg='#0d948815' border='#0d948855'
      >📂 Import JSON</ActionBtn>
      <ActionBtn
        onClick={() => setEditModal(true)}
        color='#f97316' bg='rgba(249,115,22,0.08)' border='rgba(249,115,22,0.35)'
      >✏️ Edit Scorecard</ActionBtn>
      {entries.length > 0 && (
        <ActionBtn
          onClick={handleDeleteScorecard}
          color='#ef4444' bg='rgba(239,68,68,0.08)' border='rgba(239,68,68,0.3)'
        >🗑 Delete Scorecard</ActionBtn>
      )}
    </>
  )

  return (
    <div>
      {/* ── Full-bleed hero ── */}
      <MatchHero
        match={match}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
      />

      {/* ── Page content ── */}
      <div style={{ paddingTop: 32 }}>

        {/* Performer spotlight */}
        <PerformerSpotlight match={match} onOpenProfile={onOpenProfile} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Phase analysis */}
            <PhaseAnalysis entries={entries} teams={teams} />

            {/* Scorecard */}
            <SectionHeader title="Scorecard" actions={scorecardActions} />

            {entries.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 14, color: 'var(--text-secondary)',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No scorecard yet</div>
                {isAdmin
                  ? <div style={{ fontSize: 13 }}>Use <b>Import JSON</b> or <b>Edit Scorecard</b> above to add stats</div>
                  : <div style={{ fontSize: 13 }}>Stats haven't been entered for this match</div>
                }
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 14, overflow: 'hidden', paddingBottom: 16,
              }}>
                <ScorecardView entries={entries} teams={teams} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit scorecard modal */}
      {editModal && (
        <ScorecardModal
          match={match}
          isAdmin={isAdmin}
          onClose={() => { setEditModal(false); reloadScorecard() }}
        />
      )}

      {/* Import modal */}
      {importModal && (
        <ScorecardImportModal
          matchId={match.id}
          team1={match.team1}
          team2={match.team2}
          matchNo={match.matchNo}
          date={match.date}
          onImported={() => { setImportModal(false); reloadScorecard() }}
          onClose={() => setImportModal(false)}
        />
      )}
    </div>
  )
}
