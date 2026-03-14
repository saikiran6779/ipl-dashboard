import { useState, useEffect } from 'react'
import { Input, Select, SectionLabel, Button, PlayerCombobox } from '../components/UI'
import { TEAMS, VENUES } from '../services/constants'
import { getSquad, scrapeMatch } from '../services/api'
import { useAuth } from '../context/AuthContext'

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

const HINT_STYLE = {
  display: 'inline-block',
  background: 'rgba(249,115,22,0.15)',
  border: '1px solid rgba(249,115,22,0.5)',
  color: '#f97316',
  fontSize: 11,
  borderRadius: 20,
  padding: '2px 8px',
  marginBottom: 4,
}

export default function MatchForm({ editMatch, onSubmit, onCancel, loading }) {
  const { isSuperAdmin } = useAuth()
  const [form,    setForm]    = useState(EMPTY)
  const [players, setPlayers] = useState([])

  // Scraper state
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [scrapeUrl,       setScrapeUrl]       = useState('')
  const [scraping,        setScraping]        = useState(false)
  const [scrapeHints,     setScrapeHints]     = useState({})
  const [scrapeWarnings,  setScrapeWarnings]  = useState([])
  const [scrapeToast,     setScrapeToast]     = useState(false)

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
    setScrapeHints({})
    setScrapeWarnings([])
    onSubmit(payload)
  }

  // ── Scraper handlers ────────────────────────────────────────────────────────

  const handleLoadFromEspn = async () => {
    if (!scrapeUrl.trim()) return
    setScraping(true)
    try {
      const data = await scrapeMatch(scrapeUrl.trim())

      // Auto-fill form fields
      setForm(prev => ({
        ...prev,
        ...(data.date         != null && { date:                 data.date }),
        ...(data.venue        != null && { venue:                data.venue }),
        ...(data.team1        != null && { team1:                data.team1 }),
        ...(data.team2        != null && { team2:                data.team2 }),
        ...(data.team1Score   != null && { team1Score:           String(data.team1Score) }),
        ...(data.team1Wickets != null && { team1Wickets:         String(data.team1Wickets) }),
        ...(data.team1Overs   != null && { team1Overs:           String(data.team1Overs) }),
        ...(data.team2Score   != null && { team2Score:           String(data.team2Score) }),
        ...(data.team2Wickets != null && { team2Wickets:         String(data.team2Wickets) }),
        ...(data.team2Overs   != null && { team2Overs:           String(data.team2Overs) }),
        ...(data.tossWinner   != null && { tossWinner:           data.tossWinner }),
        ...(data.tossDecision != null && { tossDecision:         data.tossDecision }),
        ...(data.winner       != null && { winner:               data.winner }),
        ...(data.winMargin    != null && { winMargin:            data.winMargin }),
        ...(data.winType      != null && { winType:              data.winType }),
        noResult: data.noResult ?? prev.noResult,
        ...(data.topScorerRuns         != null && { topScorerRuns:         String(data.topScorerRuns) }),
        ...(data.topWicketTakerWickets != null && { topWicketTakerWickets: String(data.topWicketTakerWickets) }),
        ...(data.matchNo      != null && { matchNo:              String(data.matchNo) }),
      }))

      // Store raw player name hints
      setScrapeHints({
        playerOfMatchName:   data.playerOfMatchName   || null,
        topScorerName:       data.topScorerName       || null,
        topWicketTakerName:  data.topWicketTakerName  || null,
      })

      setScrapeWarnings(data.warnings || [])
      setShowScrapeModal(false)
      setScrapeUrl('')

      // Show toast
      setScrapeToast(true)
      setTimeout(() => setScrapeToast(false), 4000)

    } catch (err) {
      setScrapeWarnings([`Failed to load data: ${err?.response?.data?.message || err.message}`])
      setShowScrapeModal(false)
    } finally {
      setScraping(false)
    }
  }

  const handleCancelScrape = () => {
    setShowScrapeModal(false)
    setScrapeUrl('')
  }

  const handleCancel = () => {
    setScrapeHints({})
    setScrapeWarnings([])
    onCancel()
  }

  const teamOptions = [form.team1, form.team2].filter(Boolean)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', margin: 0, flex: 1 }}>
          {editMatch ? 'Edit Match' : 'Add Match'}
        </h2>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowScrapeModal(true)}
            style={{
              background: 'transparent',
              border: '1px solid #f97316',
              color: '#f97316',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: 0.3,
            }}
          >
            🏏 Load from ESPN
          </button>
        )}
      </div>

      {/* Toast */}
      {scrapeToast && (
        <div style={{
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.4)',
          color: '#4ade80',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 13,
        }}>
          Match data loaded! Please select players from the dropdowns.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Match Info */}
        <SectionLabel>Match Info</SectionLabel>
        <div className="rg-1-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 16 }}>
          <Input label="Match No." name="matchNo" type="number" value={form.matchNo} onChange={handle} placeholder="e.g. 1" />
          <Input label="Date *"    name="date"    type="date"   value={form.date}    onChange={handle} required />
          <Select label="Venue" name="venue" value={form.venue} onChange={handle}>
            <option value="">Select venue</option>
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>

        {/* Scrape warnings */}
        {scrapeWarnings.length > 0 && (
          <div style={{
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#eab308', marginBottom: 6 }}>
              ⚠️ Some fields could not be auto-filled:
            </div>
            {scrapeWarnings.map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: 'rgba(234,179,8,0.8)', marginTop: 2 }}>• {w}</div>
            ))}
          </div>
        )}

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
          <div>
            {scrapeHints.playerOfMatchName && (
              <div style={HINT_STYLE}>ESPN: {scrapeHints.playerOfMatchName} — select from dropdown</div>
            )}
            <PlayerCombobox
              label="Player of the Match"
              players={players}
              value={form.playerOfMatchId}
              onChange={id => set('playerOfMatchId', id)}
            />
          </div>
          <div /> {/* spacer */}
          <div>
            {scrapeHints.topScorerName && (
              <div style={HINT_STYLE}>ESPN: {scrapeHints.topScorerName} — select from dropdown</div>
            )}
            <PlayerCombobox
              label="Top Scorer"
              players={players}
              value={form.topScorerId}
              onChange={id => set('topScorerId', id)}
            />
          </div>
          <Input label="Runs Scored" name="topScorerRuns" type="number" value={form.topScorerRuns} onChange={handle} placeholder="e.g. 82" />
          <div>
            {scrapeHints.topWicketTakerName && (
              <div style={HINT_STYLE}>ESPN: {scrapeHints.topWicketTakerName} — select from dropdown</div>
            )}
            <PlayerCombobox
              label="Top Wicket Taker"
              players={players}
              value={form.topWicketTakerId}
              onChange={id => set('topWicketTakerId', id)}
            />
          </div>
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

      {/* ESPN Scrape Modal */}
      {showScrapeModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card, #1a1f2e)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: 12,
            padding: 28,
            width: '100%',
            maxWidth: 480,
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#f97316', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1 }}>
              Load from ESPN Cricinfo
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary, #8b949e)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Scorecard URL
              </label>
              <input
                type="url"
                value={scrapeUrl}
                onChange={e => setScrapeUrl(e.target.value)}
                placeholder="https://www.espncricinfo.com/series/.../scorecard/..."
                disabled={scraping}
                style={{
                  width: '100%',
                  background: 'var(--bg-input, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#e6edf3',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onKeyDown={e => e.key === 'Enter' && !scraping && handleLoadFromEspn()}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleCancelScrape} type="button" disabled={scraping}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleLoadFromEspn}
                disabled={scraping || !scrapeUrl.trim()}
                style={{
                  background: scraping || !scrapeUrl.trim() ? 'rgba(249,115,22,0.4)' : '#f97316',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: scraping || !scrapeUrl.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {scraping ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Loading…
                  </>
                ) : 'Load Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
