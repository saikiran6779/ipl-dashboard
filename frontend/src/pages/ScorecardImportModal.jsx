/**
 * ScorecardImportModal — 4-step Cricsheet JSON import for a single match.
 *
 * Step 1 (upload):  Drop / select a Cricsheet JSON file.
 *                   On load, all player names are auto-resolved via resolvePlayerFromJson.
 * Step 2 (preview): Full batting + bowling tables per innings.
 *                   Combobox filtered to the innings team's players.
 *                   Green chip   = auto-matched (click to override)
 *                   Red combobox = unresolved (admin picks)
 *                   Import button disabled until every non-skipped row is resolved.
 * Step 3 (saving):  API call in progress.
 * Step 4 (done):    Success confirmation.
 *
 * Props:
 *   matchId      – match DB id
 *   team1        – team ID e.g. 'GT'
 *   team2        – team ID e.g. 'LSG'
 *   matchNo      – optional match number for header display
 *   date         – optional match date for header display
 *   onImported() – called after successful save
 *   onClose()    – called to close the modal
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { parseScorecardFromJson } from '../services/cricsheet'
import { resolvePlayerFromJson } from '../services/constants'
import { replaceScorecard, getPlayers } from '../services/api'
import { Button, PlayerCombobox, Spinner } from '../components/UI'
import { formatDate } from '../services/constants'

// ── Teal colour (import actions) ──────────────────────────────────────────
const TEAL = '#0d9488'
const STEPS = ['upload', 'preview', 'saving', 'done']

// ── Helper: overs float → display string ─────────────────────────────────
function fmtOvers(v) {
  if (v == null) return '—'
  return Number.isInteger(v) ? `${v}.0` : String(v)
}

// ── Inline player resolution chip / combobox ──────────────────────────────
function PlayerResolver({ cricsheetName, resolvedId, teamPlayers, onChange, skipped, onSkip }) {
  const [overriding, setOverriding] = useState(false)

  if (skipped) {
    return (
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        not played
      </span>
    )
  }

  // Green chip: auto-matched or manually chosen
  if (resolvedId && !overriding) {
    const p = teamPlayers.find(x => x.id === resolvedId)
    return (
      <span
        title="Click to change"
        onClick={() => setOverriding(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600,
          color: TEAL, background: `${TEAL}18`,
          border: `1px solid ${TEAL}55`,
          borderRadius: 4, padding: '2px 7px',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        ✓ {p ? p.name : `#${resolvedId}`}
      </span>
    )
  }

  // Red: unresolved or overriding
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 180 }}>
      <div style={{ flex: 1 }}>
        <PlayerCombobox
          players={teamPlayers}
          value={resolvedId}
          onChange={id => { onChange(id); setOverriding(false) }}
        />
      </div>
      {onSkip && (
        <button
          title="Skip this player"
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 11, padding: '2px 4px',
          }}
        >skip</button>
      )}
    </div>
  )
}

// ── Batting preview table for one innings ─────────────────────────────────
function BattingTable({ rows, resolutions, teamPlayers, onResolve, onSkip, onMoveUp, onMoveDown }) {
  const thS = {
    padding: '7px 10px', fontSize: 10, fontWeight: 600,
    color: 'var(--text-secondary)', textTransform: 'uppercase',
    letterSpacing: 1.2, whiteSpace: 'nowrap', textAlign: 'center',
  }
  const tdS = (bold) => ({
    padding: '8px 10px', textAlign: 'center',
    fontSize: bold ? 15 : 12,
    fontFamily: bold ? "'Bebas Neue',sans-serif" : 'inherit',
    color: 'var(--text-primary)',
  })
  const moveBtn = (label, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'block', background: 'none', border: 'none',
        color: disabled ? 'var(--border-subtle)' : 'var(--text-muted)',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 9, padding: '1px 3px', lineHeight: 1,
      }}
    >{label}</button>
  )

  return (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--bg-subtle)' }}>
            <th style={{ ...thS, width: 32 }}></th>
            <th style={{ ...thS, textAlign: 'left' }}>#</th>
            <th style={{ ...thS, textAlign: 'left' }}>Batter (Cricsheet)</th>
            <th style={{ ...thS, textAlign: 'left' }}>DB Player</th>
            <th style={thS}>R</th>
            <th style={thS}>B</th>
            <th style={thS}>4s</th>
            <th style={thS}>6s</th>
            <th style={thS}>Dismissal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const res = resolutions[row.cricsheetName] || {}
            const isSkipped = res.skipped
            return (
              <tr
                key={row.cricsheetName}
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  opacity: isSkipped ? 0.45 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* ↑↓ move buttons */}
                <td style={{ padding: '4px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                  {moveBtn('▲', () => onMoveUp(i), i === 0)}
                  {moveBtn('▼', () => onMoveDown(i), i === rows.length - 1)}
                </td>
                <td style={{ ...tdS(false), color: 'var(--text-muted)' }}>
                  {row.battingPosition ?? '—'}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {row.cricsheetName}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <PlayerResolver
                    cricsheetName={row.cricsheetName}
                    resolvedId={res.playerId ?? null}
                    teamPlayers={teamPlayers}
                    onChange={id => onResolve(row.cricsheetName, id)}
                    skipped={isSkipped}
                    onSkip={() => onSkip(row.cricsheetName)}
                  />
                </td>
                <td style={tdS(true)}>{row.runs}</td>
                <td style={tdS(false)}>{row.balls}</td>
                <td style={{ ...tdS(false), color: '#22c55e' }}>{row.fours}</td>
                <td style={{ ...tdS(false), color: '#f97316' }}>{row.sixes}</td>
                <td style={{
                  padding: '8px 10px', fontSize: 11,
                  color: row.dismissalType === 'not out' ? '#22c55e' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {row.dismissalType}
                  {row.dismissedByName && (
                    <span style={{ color: 'var(--text-muted)' }}> b. {row.dismissedByName}</span>
                  )}
                  {row.caughtByName && (
                    <span style={{ color: 'var(--text-muted)' }}> c. {row.caughtByName}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Bowling preview table for one innings ─────────────────────────────────
function BowlingTable({ rows, resolutions, teamPlayers, onResolve, onSkip }) {
  const thS = {
    padding: '7px 10px', fontSize: 10, fontWeight: 600,
    color: 'var(--text-secondary)', textTransform: 'uppercase',
    letterSpacing: 1.2, whiteSpace: 'nowrap', textAlign: 'center',
  }
  const tdS = (bold) => ({
    padding: '8px 10px', textAlign: 'center',
    fontSize: bold ? 15 : 12,
    fontFamily: bold ? "'Bebas Neue',sans-serif" : 'inherit',
    color: 'var(--text-primary)',
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--bg-subtle)' }}>
            <th style={{ ...thS, textAlign: 'left' }}>Bowler (Cricsheet)</th>
            <th style={{ ...thS, textAlign: 'left' }}>DB Player</th>
            <th style={thS}>O</th>
            <th style={thS}>R</th>
            <th style={thS}>W</th>
            <th style={thS}>Wd</th>
            <th style={thS}>Nb</th>
            <th style={thS}>Dots</th>
            <th style={thS}>Econ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const res = resolutions[row.cricsheetName] || {}
            const isSkipped = res.skipped
            const econ = row.oversBowled > 0
              ? (row.runsConceded / row.oversBowled).toFixed(2) : '—'
            return (
              <tr
                key={row.cricsheetName}
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  opacity: isSkipped ? 0.45 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {row.cricsheetName}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <PlayerResolver
                    cricsheetName={row.cricsheetName}
                    resolvedId={res.playerId ?? null}
                    teamPlayers={teamPlayers}
                    onChange={id => onResolve(row.cricsheetName, id)}
                    skipped={isSkipped}
                    onSkip={() => onSkip(row.cricsheetName)}
                  />
                </td>
                <td style={tdS(false)}>{fmtOvers(row.oversBowled)}</td>
                <td style={tdS(true)}>{row.runsConceded}</td>
                <td style={{ ...tdS(true), color: row.wickets >= 3 ? '#8b5cf6' : 'var(--text-primary)' }}>
                  {row.wickets}
                </td>
                <td style={tdS(false)}>{row.wides ?? 0}</td>
                <td style={tdS(false)}>{row.noBalls ?? 0}</td>
                <td style={tdS(false)}>{row.dotBalls ?? 0}</td>
                <td style={{
                  ...tdS(false),
                  color: parseFloat(econ) < 7 ? '#22c55e'
                       : parseFloat(econ) < 9 ? 'var(--text-primary)'
                       : '#ef4444',
                }}>{econ}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function ScorecardImportModal({
  matchId, team1, team2, matchNo, date,
  onImported, onClose,
}) {
  const [step,          setStep]          = useState('upload')   // upload | preview | saving | done
  const [parsedData,    setParsedData]    = useState(null)       // { innings: [...] }
  const [resolutions,   setResolutions]   = useState({})         // { cricsheetName: { playerId, skipped } }
  const [battingOrders, setBattingOrders] = useState({})         // { innIdx: [cricsheetName, ...] }
  const [dragging,      setDragging]      = useState(false)
  const [allPlayers,    setAllPlayers]    = useState([])
  const fileRef = useRef(null)

  // Fetch all players on mount for auto-resolution and comboboxes
  useEffect(() => {
    getPlayers()
      .then(setAllPlayers)
      .catch(() => toast.error('Failed to load players'))
  }, [])

  // ── Team-filtered player lists ────────────────────────────────────────────
  const getBattingPlayers = (innTeamId) =>
    innTeamId ? allPlayers.filter(p => p.teamId === innTeamId) : allPlayers

  const getBowlingPlayers = (innTeamId) => {
    if (!innTeamId) return allPlayers
    const bowlingTeam = innTeamId === team1 ? team2 : team1
    return allPlayers.filter(p => p.teamId === bowlingTeam)
  }

  // ── Parse JSON and auto-resolve players ──────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        const parsed = parseScorecardFromJson(json)

        // Collect every unique cricsheet name across all innings,
        // including dismissedByName / caughtByName for FK resolution.
        const allNames = new Set()
        for (const inn of parsed.innings) {
          inn.battingRows.forEach(r => {
            allNames.add(r.cricsheetName)
            if (r.dismissedByName) allNames.add(r.dismissedByName)
            if (r.caughtByName)    allNames.add(r.caughtByName)
          })
          inn.bowlingRows.forEach(r => allNames.add(r.cricsheetName))
        }

        // Auto-resolve via constants.js helper
        const res = {}
        for (const name of allNames) {
          const player = resolvePlayerFromJson(name, allPlayers)
          res[name] = { playerId: player?.id ?? null, skipped: false }
        }

        // Initial batting order = parse order (position 1 at index 0)
        const orders = {}
        parsed.innings.forEach((inn, idx) => {
          orders[idx] = inn.battingRows.map(r => r.cricsheetName)
        })

        setParsedData(parsed)
        setResolutions(res)
        setBattingOrders(orders)
        setStep('preview')
      } catch {
        toast.error('Invalid JSON file — could not parse')
      }
    }
    reader.readAsText(file)
  }, [allPlayers])

  const handleFilePick = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  // ── Resolution helpers ────────────────────────────────────────────────────
  const resolvePlayer = (cricsheetName, playerId) => {
    setResolutions(r => ({ ...r, [cricsheetName]: { ...r[cricsheetName], playerId, skipped: false } }))
  }

  const skipPlayer = (cricsheetName) => {
    setResolutions(r => ({ ...r, [cricsheetName]: { ...r[cricsheetName], skipped: true } }))
  }

  // ── Batting order: swap two adjacent rows for one innings ─────────────────
  const moveBatter = (innIdx, fromIdx, toIdx) => {
    setBattingOrders(prev => {
      const order = [...prev[innIdx]]
      const [removed] = order.splice(fromIdx, 1)
      order.splice(toIdx, 0, removed)
      return { ...prev, [innIdx]: order }
    })
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const canImport = parsedData && Object.values(resolutions).every(r => r.skipped || r.playerId)

  const { autoCount, unresolvedCount } = Object.values(resolutions).reduce(
    (acc, r) => {
      if (r.skipped) return acc
      if (r.playerId) acc.autoCount++
      else acc.unresolvedCount++
      return acc
    },
    { autoCount: 0, unresolvedCount: 0 }
  )

  // ── Import: merge batting + bowling per player, then call API ─────────────
  const handleImport = async () => {
    if (!canImport) return
    setStep('saving')

    try {
      const playerMap = {}

      const getEntry = (playerId) => {
        if (!playerMap[playerId]) playerMap[playerId] = { playerId }
        return playerMap[playerId]
      }

      // Reverse map: cricsheetName → playerId (skipped names excluded)
      const idByName = {}
      for (const [name, r] of Object.entries(resolutions)) {
        if (!r.skipped && r.playerId) idByName[name] = r.playerId
      }

      // Build a lookup: innIdx → { cricsheetName → 1-based position }
      const positionsByInn = {}
      parsedData.innings.forEach((inn, innIdx) => {
        const order = battingOrders[innIdx] || inn.battingRows.map(r => r.cricsheetName)
        positionsByInn[innIdx] = {}
        order.forEach((name, i) => { positionsByInn[innIdx][name] = i + 1 })
      })

      parsedData.innings.forEach((inn, innIdx) => {
        // ── Batting rows ───────────────────────────────────────────────────
        for (const row of inn.battingRows) {
          const pid = idByName[row.cricsheetName]
          if (!pid) continue
          const entry = getEntry(pid)

          entry.battingPosition = positionsByInn[innIdx][row.cricsheetName] ?? null
          entry.runs            = row.runs
          entry.balls           = row.balls
          entry.fours           = row.fours
          entry.sixes           = row.sixes
          entry.dismissal       = row.dismissalType        // cricsheet field → backend field
          entry.ppRuns          = row.ppRuns
          entry.ppBalls         = row.ppBalls
          entry.midRuns         = row.middleRuns           // middleRuns → midRuns
          entry.midBalls        = row.middleBalls          // middleBalls → midBalls
          entry.deathRuns       = row.deathRuns
          entry.deathBalls      = row.deathBalls

          // Dismissal FK resolution
          if (row.dismissedByName) {
            entry.dismissedById = idByName[row.dismissedByName] ?? null
          }
          if (row.caughtByName) {
            entry.caughtById = idByName[row.caughtByName] ?? null
          }
        }

        // ── Bowling rows ───────────────────────────────────────────────────
        for (const row of inn.bowlingRows) {
          const pid = idByName[row.cricsheetName]
          if (!pid) continue
          const entry = getEntry(pid)

          entry.bowlingOrder      = row.bowlingOrder ?? null
          entry.oversBowled       = row.oversBowled
          entry.wickets           = row.wickets
          entry.runsConceded      = row.runsConceded
          entry.wides             = row.wides
          entry.noBalls           = row.noBalls
          entry.byes              = row.byes
          entry.legByes           = row.legByes
          entry.maidens           = row.maidens
          entry.dotBalls          = row.dotBalls
          entry.ppRunsConceded    = row.ppRuns             // bowling ppRuns → ppRunsConceded
          entry.ppBallsBowled     = row.ppBalls            // bowling ppBalls → ppBallsBowled
          entry.deathRunsConceded = row.deathRuns          // bowling deathRuns → deathRunsConceded
          entry.deathBallsBowled  = row.deathBalls         // bowling deathBalls → deathBallsBowled
        }

        // ── Fielding from dismissal data ───────────────────────────────────
        for (const row of inn.battingRows) {
          if (!row.caughtByName) continue
          const fielderId = idByName[row.caughtByName]
          if (!fielderId) continue
          const fielderEntry = getEntry(fielderId)

          const kind = row.dismissalType
          if (kind === 'caught' || kind === 'caught and bowled' || kind === 'stumped') {
            fielderEntry.catches = (fielderEntry.catches ?? 0) + 1
          } else if (kind === 'run out') {
            fielderEntry.runOuts = (fielderEntry.runOuts ?? 0) + 1
          }
        }
      })

      const payload = Object.values(playerMap)
      await replaceScorecard(matchId, payload)
      setStep('done')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed')
      setStep('preview')   // return to preview on error so user can retry
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const stepIndex = STEPS.indexOf(step)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={step === 'saving' ? undefined : onClose}
    >
      <div
        style={{
          background: 'var(--bg-elevated)', border: `1px solid ${TEAL}44`,
          borderRadius: 16, width: '100%', maxWidth: 860, maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeUp 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: TEAL }}>
              Import Scorecard from JSON
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {team1} vs {team2}
              {matchNo ? ` · Match ${matchNo}` : ''}
              {date ? ` · ${formatDate(date)}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    background: step === s ? TEAL : (i < stepIndex ? `${TEAL}55` : 'var(--bg-subtle)'),
                    color: step === s ? '#fff' : (i < stepIndex ? TEAL : 'var(--text-muted)'),
                    border: `1px solid ${step === s || i < stepIndex ? TEAL : 'var(--border-subtle)'}`,
                  }}>{i + 1}</div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 16, height: 1, background: 'var(--border-subtle)' }} />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={step === 'saving' ? undefined : onClose}
              disabled={step === 'saving'}
              style={{
                background: 'var(--border-subtle)', border: '1px solid var(--border-input)',
                borderRadius: 8, color: 'var(--text-secondary)', fontSize: 18, cursor: step === 'saving' ? 'default' : 'pointer',
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: step === 'saving' ? 0.4 : 1,
              }}
            >✕</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Drop a Cricsheet match JSON file to auto-parse batting and bowling stats.
                Player names will be matched against the DB automatically.
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? TEAL : 'var(--border-input)'}`,
                  borderRadius: 12, padding: '48px 24px',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragging ? `${TEAL}08` : 'var(--bg-subtle)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = `${TEAL}08` }}
                onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.background = 'var(--bg-subtle)' } }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Drop Cricsheet JSON here
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  or click to browse
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".json" onChange={handleFilePick} style={{ display: 'none' }} />
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 'preview' && parsedData && (
            <div>
              {/* Resolution summary */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Player resolution:</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: TEAL,
                  background: `${TEAL}15`, border: `1px solid ${TEAL}44`,
                  borderRadius: 4, padding: '2px 8px',
                }}>
                  ✓ {autoCount} auto-matched
                </span>
                {unresolvedCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#ef4444',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 4, padding: '2px 8px',
                  }}>
                    ⚠ {unresolvedCount} need manual selection
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  (click a green chip to override · click skip to exclude a player)
                </span>
              </div>

              {/* ── Fielder-only resolution (names in dismissals but not in any batting/bowling row) ── */}
              {(() => {
                const inTableNames = new Set()
                parsedData.innings.forEach(inn => {
                  inn.battingRows.forEach(r => inTableNames.add(r.cricsheetName))
                  inn.bowlingRows.forEach(r => inTableNames.add(r.cricsheetName))
                })
                const fielderNames = Object.keys(resolutions).filter(n => !inTableNames.has(n))
                if (fielderNames.length === 0) return null
                return (
                  <div style={{
                    marginBottom: 20, padding: '12px 14px',
                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8,
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: '#ef4444',
                      textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
                    }}>
                      🧤 Fielders (appear only in dismissal data)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {fielderNames.map(name => {
                        const res = resolutions[name] || {}
                        return (
                          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 160 }}>{name}</span>
                            <PlayerResolver
                              cricsheetName={name}
                              resolvedId={res.playerId ?? null}
                              teamPlayers={allPlayers}
                              onChange={id => resolvePlayer(name, id)}
                              skipped={res.skipped}
                              onSkip={() => skipPlayer(name)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {parsedData.innings.map((inn, idx) => (
                <div key={idx} style={{ marginBottom: 28 }}>
                  {/* Innings heading */}
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: TEAL,
                    textTransform: 'uppercase', letterSpacing: 1.5,
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ height: 1, width: 20, background: TEAL, opacity: 0.5 }} />
                    Innings {idx + 1} — {inn.team}
                    {inn.teamId && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                        ({inn.teamId})
                      </span>
                    )}
                    <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
                  </div>

                  {/* Batting */}
                  {inn.battingRows.length > 0 && (() => {
                    // Build ordered rows from battingOrders state, re-number position
                    const order = battingOrders[idx] || inn.battingRows.map(r => r.cricsheetName)
                    const rowByName = Object.fromEntries(inn.battingRows.map(r => [r.cricsheetName, r]))
                    const orderedRows = order.map((name, i) => ({ ...rowByName[name], battingPosition: i + 1 }))
                    return (
                    <>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                        textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6,
                      }}>
                        🏏 Batting
                      </div>
                      <BattingTable
                        rows={orderedRows}
                        resolutions={resolutions}
                        teamPlayers={getBattingPlayers(inn.teamId)}
                        onResolve={resolvePlayer}
                        onSkip={skipPlayer}
                        onMoveUp={i => i > 0 && moveBatter(idx, i, i - 1)}
                        onMoveDown={i => i < orderedRows.length - 1 && moveBatter(idx, i, i + 1)}
                      />
                    </>
                    )
                  })()}

                  {/* Bowling */}
                  {inn.bowlingRows.length > 0 && (
                    <>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                        textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 14, marginBottom: 6,
                      }}>
                        ⚡ Bowling
                      </div>
                      <BowlingTable
                        rows={inn.bowlingRows}
                        resolutions={resolutions}
                        teamPlayers={getBowlingPlayers(inn.teamId)}
                        onResolve={resolvePlayer}
                        onSkip={skipPlayer}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Step 3: Saving ── */}
          {step === 'saving' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spinner />
              <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Saving to database…
              </div>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Scorecard imported successfully!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
                All player stats have been saved to the database.
              </div>
              <Button
                style={{ background: TEAL, border: 'none', color: '#fff' }}
                onClick={() => { onImported(); onClose() }}
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* ── Footer (preview step only) ── */}
        {step === 'preview' && (
          <div style={{
            padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <button
              onClick={() => setStep('upload')}
              style={{
                background: 'none', border: '1px solid var(--border-input)', borderRadius: 8,
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                padding: '7px 16px', fontFamily: 'Rajdhani,sans-serif',
              }}
            >
              ← Back
            </button>
            <Button
              disabled={!canImport}
              onClick={handleImport}
              style={{ background: canImport ? TEAL : undefined, border: 'none', color: '#fff' }}
            >
              {`⬆ Import ${Object.values(resolutions).filter(r => !r.skipped && r.playerId).length} players`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
