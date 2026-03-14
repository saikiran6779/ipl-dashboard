import { useState, useEffect, useRef } from 'react'
import { Input, Select, SectionLabel, Button, PlayerCombobox } from '../components/UI'
import { TEAMS, VENUES, resolvePlayerFromJson } from '../services/constants'
import { parseCricsheet } from '../services/cricsheetParser'
import { getSquad, getPlayers } from '../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY = {
  matchNo: '', date: '', venue: '',
  team1: '', team2: '',
  team1Score: '', team1Wickets: '', team1Overs: '',
  team2Score: '', team2Wickets: '', team2Overs: '',
  tossWinner: '', tossDecision: '',
  noResult: false,
  winner: '', winMargin: '', winType: 'runs',
  playerOfMatchId: null,
  topScorerId: null,      topScorerRuns: '',
  topWicketTakerId: null, topWicketTakerWickets: '',
}

// ── Small presentational component ───────────────────────────────────────────
function HintTag({ name, matched }) {
  return (
    <div style={{
      fontSize: 11,
      color:      matched ? '#22c55e' : '#0d9488',
      background: matched ? 'rgba(34,197,94,0.1)'  : 'rgba(13,148,136,0.1)',
      border:     `1px solid ${matched ? 'rgba(34,197,94,0.3)' : 'rgba(13,148,136,0.3)'}`,
      borderRadius: 6, padding: '3px 8px', marginBottom: 4, display: 'inline-block',
    }}>
      {matched ? '✅' : '📂'} {name}{matched ? ' — auto-matched' : ' — select manually'}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MatchForm({ editMatch, onSubmit, onCancel, loading }) {
  const [form,       setForm]       = useState(EMPTY)
  const [players,    setPlayers]    = useState([])   // squad for selected teams
  const [allPlayers, setAllPlayers] = useState([])   // all players — for JSON auto-resolve
  const [jsonHints,    setJsonHints]    = useState({})
  const [jsonWarnings, setJsonWarnings] = useState([])
  const fileInputRef = useRef(null)

  // Pre-load all players once on mount for JSON resolution
  useEffect(() => { getPlayers().then(setAllPlayers).catch(() => {}) }, [])

  // Populate/reset form when editMatch prop changes
  useEffect(() => {
    if (editMatch) {
      setForm({
        ...EMPTY, ...editMatch,
        matchNo:               editMatch.matchNo               ?? '',
        team1Score:            editMatch.team1Score            ?? '',
        team1Wickets:          editMatch.team1Wickets          ?? '',
        team1Overs:            editMatch.team1Overs            ?? '',
        team2Score:            editMatch.team2Score            ?? '',
        team2Wickets:          editMatch.team2Wickets          ?? '',
        team2Overs:            editMatch.team2Overs            ?? '',
        playerOfMatchId:       editMatch.playerOfMatchId       ?? null,
        topScorerId:           editMatch.topScorerId           ?? null,
        topScorerRuns:         editMatch.topScorerRuns         ?? '',
        topWicketTakerId:      editMatch.topWicketTakerId      ?? null,
        topWicketTakerWickets: editMatch.topWicketTakerWickets ?? '',
      })
    } else {
      setForm(EMPTY)
      setJsonHints({})
      setJsonWarnings([])
    }
  }, [editMatch])

  // Fetch squad whenever the selected teams change
  useEffect(() => {
    const teams = [form.team1, form.team2].filter(Boolean)
    if (!teams.length) { setPlayers([]); return }
    Promise.all(teams.map(t => getSquad(t)))
      .then(results => setPlayers(results.flat()))
      .catch(() => setPlayers([]))
  }, [form.team1, form.team2])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const set           = (name, value) => setForm(prev => ({ ...prev, [name]: value }))
  const handle        = e => set(e.target.name, e.target.value)
  const handleCheckbox = e => set(e.target.name, e.target.checked)

  // ── JSON loader ───────────────────────────────────────────────────────────
  const handleJsonFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const { fields, playerOfMatchName, topScorer, topWicketTaker, warnings } =
          parseCricsheet(JSON.parse(ev.target.result))

        const resolvedMOM    = resolvePlayerFromJson(playerOfMatchName,   allPlayers)
        const resolvedScorer = resolvePlayerFromJson(topScorer.name,      allPlayers)
        const resolvedWkt    = resolvePlayerFromJson(topWicketTaker.name, allPlayers)

        if (playerOfMatchName   && !resolvedMOM)
          warnings.push(`Could not auto-match: "${playerOfMatchName}" — select manually`)
        if (topScorer.name      && !resolvedScorer)
          warnings.push(`Could not auto-match scorer: "${topScorer.name}" — select manually`)
        if (topWicketTaker.name && !resolvedWkt)
          warnings.push(`Could not auto-match wicket taker: "${topWicketTaker.name}" — select manually`)

        setForm(prev => {
          const next = { ...prev }
          // Merge non-null fields from parsed data
          for (const [k, v] of Object.entries(fields)) {
            if (v !== null && v !== '') next[k] = v
          }
          // noResult must always overwrite (false is valid)
          next.noResult = fields.noResult
          // matchNo: prefer parsed value (0 is still valid)
          if (fields.matchNo !== '' && fields.matchNo != null) next.matchNo = fields.matchNo
          // Resolved player IDs (keep existing if not matched)
          if (resolvedMOM)    next.playerOfMatchId  = resolvedMOM.id
          if (resolvedScorer) next.topScorerId       = resolvedScorer.id
          if (resolvedWkt)    next.topWicketTakerId  = resolvedWkt.id
          return next
        })

        setJsonHints({
          playerOfMatchName,
          topScorerName:      topScorer.name,
          topWicketTakerName: topWicketTaker.name,
        })
        setJsonWarnings(warnings)
      } catch (err) {
        setJsonWarnings([`Failed to parse JSON: ${err.message}`])
      }
      e.target.value = '' // allow re-uploading the same file
    }
    reader.readAsText(file)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = e => {
    e.preventDefault()
    const payload = {
      ...form,
      matchNo:               form.matchNo               ? parseInt(form.matchNo)               : null,
      team1Score:            form.team1Score             ? parseInt(form.team1Score)            : null,
      team1Wickets:          form.team1Wickets           ? parseInt(form.team1Wickets)          : null,
      team1Overs:            form.team1Overs             ? parseFloat(form.team1Overs)          : null,
      team2Score:            form.team2Score             ? parseInt(form.team2Score)            : null,
      team2Wickets:          form.team2Wickets           ? parseInt(form.team2Wickets)          : null,
      team2Overs:            form.team2Overs             ? parseFloat(form.team2Overs)          : null,
      topScorerRuns:         form.topScorerRuns          ? parseInt(form.topScorerRuns)         : null,
      topWicketTakerWickets: form.topWicketTakerWickets  ? parseInt(form.topWicketTakerWickets) : null,
    }
    if (payload.noResult) {
      payload.winner = null; payload.winMargin = null; payload.winType = null
    }
    onSubmit(payload)
  }

  const handleCancel = () => {
    setJsonHints({})
    setJsonWarnings([])
    onCancel()
  }

  const teamOptions = [form.team1, form.team2].filter(Boolean)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', margin: 0 }}>
          {editMatch ? 'Edit Match' : 'Add Match'}
        </h2>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonFile} style={{ display: 'none' }} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            fontSize: 13, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
            border: '1px solid rgba(13,148,136,0.5)', background: 'rgba(13,148,136,0.08)', color: '#0d9488',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.15)'; e.currentTarget.style.borderColor = '#0d9488' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(13,148,136,0.5)' }}
        >
          📂 Load from JSON
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Match Info ── */}
        <SectionLabel>Match Info</SectionLabel>
        {jsonWarnings.length > 0 && (
          <div style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 6 }}>⚠️ Some fields need manual input:</div>
            {jsonWarnings.map((w, i) => <div key={i} style={{ fontSize: 11, color: '#d97706', marginTop: 3 }}>• {w}</div>)}
          </div>
        )}
        <div className="rg-1-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 24 }}>
          <Input label="Match No." name="matchNo" type="number" value={form.matchNo}  onChange={handle} placeholder="e.g. 1" />
          <Input label="Date *"    name="date"    type="date"   value={form.date}     onChange={handle} required />
          <Select label="Venue"    name="venue"                 value={form.venue}    onChange={handle}>
            <option value="">Select venue</option>
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>

        {/* ── Teams & Scores ── */}
        <SectionLabel>Teams &amp; Scores</SectionLabel>
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[{ label: 'Team 1', prefix: 'team1' }, { label: 'Team 2', prefix: 'team2' }].map(({ label, prefix }) => (
            <div key={prefix} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{label}</div>
              <div style={{ marginBottom: 10 }}>
                <Select label="Team *" name={prefix} value={form[prefix]} onChange={handle} required>
                  <option value="">Select team</option>
                  {TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} – {t.name}</option>)}
                </Select>
              </div>
              <div className="rg-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Input label="Runs"  name={`${prefix}Score`}   type="number" value={form[`${prefix}Score`]}   onChange={handle} placeholder="0" />
                <Input label="Wkts"  name={`${prefix}Wickets`} type="number" value={form[`${prefix}Wickets`]} onChange={handle} placeholder="0" />
                <Input label="Overs" name={`${prefix}Overs`}   type="number" step="0.1" value={form[`${prefix}Overs`]} onChange={handle} placeholder="20" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Result ── */}
        <SectionLabel>Result</SectionLabel>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
            <input type="checkbox" name="noResult" checked={form.noResult} onChange={handleCheckbox}
              style={{ width: 15, height: 15, accentColor: 'var(--text-secondary)', cursor: 'pointer' }} />
            No Result / Abandoned
          </label>
        </div>
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {!form.noResult && <>
            <Select label="Winner *"    name="winner"   value={form.winner}   onChange={handle} required>
              <option value="">Select winner</option>
              {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input  label="Win Margin"  name="winMargin" value={form.winMargin} onChange={handle} placeholder="e.g. 24" />
            <Select label="Win Type"    name="winType"   value={form.winType}  onChange={handle}>
              <option value="runs">runs</option>
              <option value="wickets">wickets</option>
            </Select>
          </>}
          <Select label="Toss Winner"   name="tossWinner"   value={form.tossWinner}   onChange={handle}>
            <option value="">Select</option>
            {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Toss Decision" name="tossDecision" value={form.tossDecision} onChange={handle}>
            <option value="">Select</option>
            <option value="bat">Bat</option>
            <option value="field">Field</option>
          </Select>
        </div>

        {/* ── Player Stats ── */}
        <SectionLabel>Player Stats</SectionLabel>
        {!form.team1 && !form.team2 && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Select teams above to enable player search
          </div>
        )}
        {/* Per-field hint tags — grid uses alignItems:start so varying heights don't misalign */}
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28, alignItems: 'start' }}>

          <div>
            {jsonHints.playerOfMatchName && <HintTag name={jsonHints.playerOfMatchName} matched={!!form.playerOfMatchId} />}
            <PlayerCombobox label="Player of the Match" players={players} value={form.playerOfMatchId} onChange={id => set('playerOfMatchId', id)} />
          </div>
          <div /> {/* spacer */}

          <div>
            {jsonHints.topScorerName && <HintTag name={jsonHints.topScorerName} matched={!!form.topScorerId} />}
            <PlayerCombobox label="Top Scorer" players={players} value={form.topScorerId} onChange={id => set('topScorerId', id)} />
          </div>
          <Input label="Runs Scored" name="topScorerRuns" type="number" value={form.topScorerRuns} onChange={handle} placeholder="e.g. 82" />

          <div>
            {jsonHints.topWicketTakerName && <HintTag name={jsonHints.topWicketTakerName} matched={!!form.topWicketTakerId} />}
            <PlayerCombobox label="Top Wicket Taker" players={players} value={form.topWicketTakerId} onChange={id => set('topWicketTakerId', id)} />
          </div>
          <Input label="Wickets Taken" name="topWicketTakerWickets" type="number" value={form.topWicketTakerWickets} onChange={handle} placeholder="e.g. 3" />

        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost"   onClick={handleCancel} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : editMatch ? 'Update Match' : 'Save Match'}
          </Button>
        </div>

      </form>
    </div>
  )
}
