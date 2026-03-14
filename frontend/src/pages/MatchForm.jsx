import { useState, useEffect, useRef } from 'react'
import { Input, Select, SectionLabel, Button, PlayerCombobox } from '../components/UI'
import { TEAMS, VENUES } from '../services/constants'
import { getSquad } from '../services/api'

const EMPTY = {
  matchNo: '', date: '', venue: '',
  team1: '', team2: '',
  team1Score: '', team1Wickets: '', team1Overs: '',
  team2Score: '', team2Wickets: '', team2Overs: '',
  tossWinner: '', tossDecision: '',
  noResult: false,
  winner: '', winMargin: '', winType: 'runs',
  playerOfMatchId: null,
  topScorerId: null,
  topScorerRuns: '',
  topWicketTakerId: null,
  topWicketTakerWickets: '',
}

export default function MatchForm({ editMatch, onSubmit, onCancel, loading }) {
  const [form,    setForm]    = useState(EMPTY)
  const [players, setPlayers] = useState([])
  const fileInputRef = useRef(null)
  const [jsonHints, setJsonHints] = useState({})
  const [jsonWarnings, setJsonWarnings] = useState([])

  // Populate form when editing an existing match
  useEffect(() => {
    if (editMatch) {
      setForm({
        ...EMPTY,
        ...editMatch,
        matchNo:              editMatch.matchNo              ?? '',
        team1Score:           editMatch.team1Score           ?? '',
        team1Wickets:         editMatch.team1Wickets         ?? '',
        team1Overs:           editMatch.team1Overs           ?? '',
        team2Score:           editMatch.team2Score           ?? '',
        team2Wickets:         editMatch.team2Wickets         ?? '',
        team2Overs:           editMatch.team2Overs           ?? '',
        playerOfMatchId:      editMatch.playerOfMatchId      ?? null,
        topScorerId:          editMatch.topScorerId          ?? null,
        topScorerRuns:        editMatch.topScorerRuns        ?? '',
        topWicketTakerId:     editMatch.topWicketTakerId     ?? null,
        topWicketTakerWickets:editMatch.topWicketTakerWickets ?? '',
      })
    } else {
      setForm(EMPTY)
      setJsonHints({})
      setJsonWarnings([])
    }
  }, [editMatch])

  // Fetch combined squad whenever team selection changes
  useEffect(() => {
    const teams = [form.team1, form.team2].filter(Boolean)
    if (!teams.length) { setPlayers([]); return }

    Promise.all(teams.map(t => getSquad(t)))
      .then(results => setPlayers(results.flat()))
      .catch(() => setPlayers([]))
  }, [form.team1, form.team2])

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))
  const handle = e => set(e.target.name, e.target.value)
  const handleCheckbox = e => set(e.target.name, e.target.checked)

  const parseCricsheetJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        const warnings = []
        const info = data.info || {}
        const innings = data.innings || []
        // Team name to team ID mapping
        const TEAM_MAP = {
          'Mumbai Indians': 'MI',
          'Chennai Super Kings': 'CSK',
          'Royal Challengers Bengaluru': 'RCB',
          'Royal Challengers Bangalore': 'RCB',
          'Kolkata Knight Riders': 'KKR',
          'Delhi Capitals': 'DC',
          'Punjab Kings': 'PBKS',
          'Rajasthan Royals': 'RR',
          'Sunrisers Hyderabad': 'SRH',
          'Gujarat Titans': 'GT',
          'Lucknow Super Giants': 'LSG',
        }
        const mapTeam = (name) => {
          if (!name) return ''
          for (const [k, v] of Object.entries(TEAM_MAP)) {
            if (name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())) return v
          }
          warnings.push(`Unknown team: "${name}" — select manually`)
          return ''
        }
        // Basic info
        const date = info.dates?.[0] || ''
        const matchNo = info.event?.match_number ?? ''
        const venue = info.venue || ''
        const teams = info.teams || []
        const team1Name = teams[0] || ''
        const team2Name = teams[1] || ''
        const team1 = mapTeam(team1Name)
        const team2 = mapTeam(team2Name)
        // Toss
        const tossWinnerName = info.toss?.winner || ''
        const tossWinner = mapTeam(tossWinnerName)
        const tossDecision = info.toss?.decision === 'bat' ? 'bat' : 'field'
        // Outcome
        let winner = '', winMargin = '', winType = '', noResult = false
        const outcome = info.outcome || {}
        if (outcome.result === 'no result' || outcome.result === 'tie') {
          noResult = true
        } else if (outcome.winner) {
          winner = mapTeam(outcome.winner)
          if (outcome.by?.wickets) { winMargin = String(outcome.by.wickets); winType = 'wickets' }
          else if (outcome.by?.runs) { winMargin = String(outcome.by.runs); winType = 'runs' }
        }
        // Player of match
        const playerOfMatchName = info.player_of_match?.[0] || ''
        if (!playerOfMatchName) warnings.push('Player of the match not available')
        // Compute innings scores from deliveries
        const computeInnings = (inningsObj) => {
          let runs = 0, wickets = 0, balls = 0
          for (const over of (inningsObj.overs || [])) {
            for (const d of (over.deliveries || [])) {
              runs += d.runs?.total ?? 0
              if (!d.extras?.wides && !d.extras?.noballs) balls++
              if (d.wickets) {
                for (const w of d.wickets) {
                  wickets++
                }
              }
            }
          }
          const completedOvers = Math.floor(balls / 6)
          const remainingBalls = balls % 6
          const overs = remainingBalls === 0 ? completedOvers : parseFloat(`${completedOvers}.${remainingBalls}`)
          return { runs, wickets, overs }
        }
        // Compute top scorer from an innings
        const computeTopScorer = (inningsObj) => {
          const runsByPlayer = {}
          for (const over of (inningsObj.overs || [])) {
            for (const d of (over.deliveries || [])) {
              const batter = d.batter
              if (!runsByPlayer[batter]) runsByPlayer[batter] = 0
              runsByPlayer[batter] += d.runs?.batter ?? 0
            }
          }
          let topName = '', topRuns = -1
          for (const [name, r] of Object.entries(runsByPlayer)) {
            if (r > topRuns) { topRuns = r; topName = name }
          }
          return { name: topName, runs: topRuns >= 0 ? topRuns : null }
        }
        // Compute top wicket taker from an innings (excludes run outs)
        const computeTopWicketTaker = (inningsObj) => {
          const wicketsByBowler = {}
          for (const over of (inningsObj.overs || [])) {
            for (const d of (over.deliveries || [])) {
              if (d.wickets) {
                const bowler = d.bowler
                if (!wicketsByBowler[bowler]) wicketsByBowler[bowler] = 0
                for (const w of d.wickets) {
                  if (w.kind !== 'run out' && w.kind !== 'retired hurt' && w.kind !== 'obstructing the field') {
                    wicketsByBowler[bowler]++
                  }
                }
              }
            }
          }
          let topName = '', topWickets = -1
          for (const [name, w] of Object.entries(wicketsByBowler)) {
            if (w > topWickets) { topWickets = w; topName = name }
          }
          return { name: topName, wickets: topWickets >= 0 ? topWickets : null }
        }
        // innings[0] = team1 batting, innings[1] = team2 batting
        const inn1 = innings.find(i => i.team === team1Name) || innings[0]
        const inn2 = innings.find(i => i.team === team2Name) || innings[1]
        const score1 = inn1 ? computeInnings(inn1) : { runs: null, wickets: null, overs: null }
        const score2 = inn2 ? computeInnings(inn2) : { runs: null, wickets: null, overs: null }
        // Top scorer = highest scorer across both innings
        const topScorer1 = inn1 ? computeTopScorer(inn1) : { name: '', runs: null }
        const topScorer2 = inn2 ? computeTopScorer(inn2) : { name: '', runs: null }
        const topScorer = (topScorer1.runs ?? 0) >= (topScorer2.runs ?? 0) ? topScorer1 : topScorer2
        // Top wicket taker = best bowler across both innings
        const wktTaker1 = inn1 ? computeTopWicketTaker(inn1) : { name: '', wickets: null }
        const wktTaker2 = inn2 ? computeTopWicketTaker(inn2) : { name: '', wickets: null }
        const topWicketTaker = (wktTaker1.wickets ?? 0) >= (wktTaker2.wickets ?? 0) ? wktTaker1 : wktTaker2
        if (!topScorer.name) warnings.push('Could not determine top scorer')
        if (!topWicketTaker.name) warnings.push('Could not determine top wicket taker')
        // Auto-fill form
        setForm(prev => ({
          ...prev,
          date:                  date || prev.date,
          matchNo:               matchNo !== '' ? matchNo : prev.matchNo,
          venue:                 venue || prev.venue,
          team1:                 team1 || prev.team1,
          team2:                 team2 || prev.team2,
          team1Score:            score1.runs    ?? prev.team1Score,
          team1Wickets:          score1.wickets ?? prev.team1Wickets,
          team1Overs:            score1.overs   ?? prev.team1Overs,
          team2Score:            score2.runs    ?? prev.team2Score,
          team2Wickets:          score2.wickets ?? prev.team2Wickets,
          team2Overs:            score2.overs   ?? prev.team2Overs,
          tossWinner:            tossWinner || prev.tossWinner,
          tossDecision:          tossDecision || prev.tossDecision,
          winner:                winner || prev.winner,
          winMargin:             winMargin || prev.winMargin,
          winType:               winType || prev.winType,
          noResult:              noResult,
          topScorerRuns:         topScorer.runs ?? prev.topScorerRuns,
          topWicketTakerWickets: topWicketTaker.wickets ?? prev.topWicketTakerWickets,
        }))
        // Set hints for player comboboxes
        setJsonHints({
          playerOfMatchName:  playerOfMatchName,
          topScorerName:      topScorer.name,
          topWicketTakerName: topWicketTaker.name,
        })
        setJsonWarnings(warnings)
      } catch (err) {
        setJsonWarnings([`Failed to parse JSON: ${err.message}`])
      }
      // Reset file input so the same file can be re-uploaded
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const payload = {
      ...form,
      matchNo:               form.matchNo       ? parseInt(form.matchNo)               : null,
      team1Score:            form.team1Score     ? parseInt(form.team1Score)            : null,
      team1Wickets:          form.team1Wickets   ? parseInt(form.team1Wickets)          : null,
      team1Overs:            form.team1Overs     ? parseFloat(form.team1Overs)          : null,
      team2Score:            form.team2Score     ? parseInt(form.team2Score)            : null,
      team2Wickets:          form.team2Wickets   ? parseInt(form.team2Wickets)          : null,
      team2Overs:            form.team2Overs     ? parseFloat(form.team2Overs)          : null,
      topScorerRuns:         form.topScorerRuns  ? parseInt(form.topScorerRuns)         : null,
      topWicketTakerWickets: form.topWicketTakerWickets ? parseInt(form.topWicketTakerWickets) : null,
    }
    if (payload.noResult) {
      payload.winner    = null
      payload.winMargin = null
      payload.winType   = null
    }
    onSubmit(payload)
  }

  const handleCancel = () => {
    setJsonHints({})
    setJsonWarnings([])
    onCancel()
  }

  const teamOptions = [form.team1, form.team2].filter(Boolean)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', margin: 0 }}>
          {editMatch ? 'Edit Match' : 'Add Match'}
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={parseCricsheetJson}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid rgba(13,148,136,0.5)',
            background: 'rgba(13,148,136,0.08)',
            color: '#0d9488', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.15)'; e.currentTarget.style.borderColor = '#0d9488' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(13,148,136,0.5)' }}
        >
          📂 Load from JSON
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Match Info */}
        <SectionLabel>Match Info</SectionLabel>
        {jsonWarnings.length > 0 && (
          <div style={{
            background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.4)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 6 }}>
              ⚠️ Some fields need manual input:
            </div>
            {jsonWarnings.map((w, i) => (
              <div key={i} style={{ fontSize: 11, color: '#d97706', marginTop: 3 }}>• {w}</div>
            ))}
          </div>
        )}
        <div className="rg-1-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 24 }}>
          <Input label="Match No." name="matchNo" type="number" value={form.matchNo} onChange={handle} placeholder="e.g. 1" />
          <Input label="Date *"    name="date"    type="date"   value={form.date}    onChange={handle} required />
          <Select label="Venue" name="venue" value={form.venue} onChange={handle}>
            <option value="">Select venue</option>
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>

        {/* Teams & Scores */}
        <SectionLabel>Teams & Scores</SectionLabel>
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Team 1', prefix: 'team1' },
            { label: 'Team 2', prefix: 'team2' },
          ].map(({ label, prefix }) => (
            <div key={prefix} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{label}</div>
              <div style={{ marginBottom: 10 }}>
                <Select label={`Team *`} name={prefix} value={form[prefix]} onChange={handle} required>
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

        {/* Result */}
        <SectionLabel>Result</SectionLabel>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              name="noResult"
              checked={form.noResult}
              onChange={handleCheckbox}
              style={{ width: 15, height: 15, accentColor: 'var(--text-secondary)', cursor: 'pointer' }}
            />
            No Result / Abandoned
          </label>
        </div>
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {!form.noResult && <>
            <Select label="Winner *" name="winner" value={form.winner} onChange={handle} required>
              <option value="">Select winner</option>
              {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input label="Win Margin" name="winMargin" value={form.winMargin} onChange={handle} placeholder="e.g. 24" />
            <Select label="Win Type" name="winType" value={form.winType} onChange={handle}>
              <option value="runs">runs</option>
              <option value="wickets">wickets</option>
            </Select>
          </>}
          <Select label="Toss Winner" name="tossWinner" value={form.tossWinner} onChange={handle}>
            <option value="">Select</option>
            {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Toss Decision" name="tossDecision" value={form.tossDecision} onChange={handle}>
            <option value="">Select</option>
            <option value="bat">Bat</option>
            <option value="field">Field</option>
          </Select>
        </div>

        {/* Player Stats */}
        <SectionLabel>Player Stats</SectionLabel>
        {!form.team1 && !form.team2 && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Select teams above to enable player search
          </div>
        )}
        {(jsonHints.playerOfMatchName || jsonHints.topScorerName || jsonHints.topWicketTakerName) && (
          <div style={{
            background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.35)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', marginBottom: 6 }}>
              📂 JSON suggestions — search and select below:
            </div>
            {jsonHints.playerOfMatchName && (
              <div style={{ fontSize: 11, color: '#0d9488', marginTop: 3 }}>
                • Player of Match: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{jsonHints.playerOfMatchName}</span>
              </div>
            )}
            {jsonHints.topScorerName && (
              <div style={{ fontSize: 11, color: '#0d9488', marginTop: 3 }}>
                • Top Scorer: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{jsonHints.topScorerName}</span>
              </div>
            )}
            {jsonHints.topWicketTakerName && (
              <div style={{ fontSize: 11, color: '#0d9488', marginTop: 3 }}>
                • Top Wicket Taker: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{jsonHints.topWicketTakerName}</span>
              </div>
            )}
          </div>
        )}
        <div className="rg-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <PlayerCombobox
            label="Player of the Match"
            players={players}
            value={form.playerOfMatchId}
            onChange={id => set('playerOfMatchId', id)}
          />
          <div /> {/* spacer */}
          <PlayerCombobox
            label="Top Scorer"
            players={players}
            value={form.topScorerId}
            onChange={id => set('topScorerId', id)}
          />
          <Input label="Runs Scored" name="topScorerRuns" type="number" value={form.topScorerRuns} onChange={handle} placeholder="e.g. 82" />
          <PlayerCombobox
            label="Top Wicket Taker"
            players={players}
            value={form.topWicketTakerId}
            onChange={id => set('topWicketTakerId', id)}
          />
          <Input label="Wickets Taken" name="topWicketTakerWickets" type="number" value={form.topWicketTakerWickets} onChange={handle} placeholder="e.g. 3" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={handleCancel} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : editMatch ? 'Update Match' : 'Save Match'}
          </Button>
        </div>
      </form>
    </div>
  )
}
