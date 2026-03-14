import { useState, useEffect } from 'react'
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

  const teamOptions = [form.team1, form.team2].filter(Boolean)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', marginBottom: 20 }}>
        {editMatch ? 'Edit Match' : 'Add Match'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Match Info */}
        <SectionLabel>Match Info</SectionLabel>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#c9d1d9' }}>
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
          <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : editMatch ? 'Update Match' : 'Save Match'}
          </Button>
        </div>
      </form>
    </div>
  )
}
