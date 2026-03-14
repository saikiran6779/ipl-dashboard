import { useState, useEffect } from 'react'
import { Input, Select, SectionLabel, Button, PlayerCombobox } from '../components/UI'
import { TEAMS, VENUES } from '../services/constants'
import { getSquad } from '../services/api'
import { cricApiSearch, cricApiFetch } from '../services/api'
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

export default function MatchForm({ editMatch, onSubmit, onCancel, loading }) {
  const [form,    setForm]    = useState(EMPTY)
  const [players, setPlayers] = useState([])

  const { isSuperAdmin } = useAuth()
  const [showCricApi,    setShowCricApi]    = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [searching,      setSearching]      = useState(false)
  const [fetchingMatch,  setFetchingMatch]  = useState(false)
  const [scrapeHints,    setScrapeHints]    = useState({})
  const [scrapeWarnings, setScrapeWarnings] = useState([])

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
    setScrapeHints({})
    setScrapeWarnings([])
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const results = await cricApiSearch(searchQuery)
      setSearchResults(results)
    } catch {
      // show empty
    } finally {
      setSearching(false)
    }
  }

  const handleLoadMatch = async (matchId) => {
    setFetchingMatch(true)
    try {
      const data = await cricApiFetch(matchId)
      // Auto-fill form fields
      setForm(prev => ({
        ...prev,
        date:                  data.date            || prev.date,
        venue:                 data.venue           || prev.venue,
        team1:                 data.team1           || prev.team1,
        team2:                 data.team2           || prev.team2,
        team1Score:            data.team1Score      ?? prev.team1Score,
        team1Wickets:          data.team1Wickets    ?? prev.team1Wickets,
        team1Overs:            data.team1Overs      ?? prev.team1Overs,
        team2Score:            data.team2Score      ?? prev.team2Score,
        team2Wickets:          data.team2Wickets    ?? prev.team2Wickets,
        team2Overs:            data.team2Overs      ?? prev.team2Overs,
        tossWinner:            data.tossWinner      || prev.tossWinner,
        tossDecision:          data.tossDecision    || prev.tossDecision,
        winner:                data.winner          || prev.winner,
        winMargin:             data.winMargin       || prev.winMargin,
        winType:               data.winType         || prev.winType,
        noResult:              data.noResult        ?? prev.noResult,
        topScorerRuns:         data.topScorerRuns   ?? prev.topScorerRuns,
        topWicketTakerWickets: data.topWicketTakerWickets ?? prev.topWicketTakerWickets,
      }))
      setScrapeHints({
        playerOfMatchName:    data.playerOfMatchName    || '',
        topScorerName:        data.topScorerName        || '',
        topWicketTakerName:   data.topWicketTakerName   || '',
      })
      setScrapeWarnings(data.warnings || [])
      setShowCricApi(false)
      setSearchResults([])
      setSearchQuery('')
    } catch {
      setScrapeWarnings(['Failed to load match data from CricAPI'])
    } finally {
      setFetchingMatch(false)
    }
  }

  const teamOptions = [form.team1, form.team2].filter(Boolean)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f97316', margin: 0 }}>
          {editMatch ? 'Edit Match' : 'Add Match'}
        </h2>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowCricApi(true)}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid rgba(249,115,22,0.5)',
              background: 'rgba(249,115,22,0.08)',
              color: '#f97316', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            🏏 Load from CricAPI
          </button>
        )}
      </div>

      {/* CricAPI Modal */}
      {showCricApi && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setShowCricApi(false)}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 540,
            animation: 'fadeUp 0.2s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color: '#f97316' }}>
                🏏 Load from CricAPI
              </div>
              <button onClick={() => setShowCricApi(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search e.g. RCB vs KKR IPL 2025"
                autoFocus
                style={{
                  flex: 1, background: '#0d1117', border: '1px solid #30363d',
                  borderRadius: 8, padding: '9px 12px', color: '#e6edf3',
                  fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#f97316,#dc2626)',
                  color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  opacity: searching ? 0.7 : 1,
                }}
              >
                {searching ? '…' : 'Search'}
              </button>
            </div>
            {/* Results list */}
            {searchResults.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #21262d', borderRadius: 8 }}>
                {searchResults.map((m, i) => (
                  <div key={m.id} style={{
                    padding: '12px 16px', borderTop: i > 0 ? '1px solid #21262d' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleLoadMatch(m.id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#e6edf3' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#8b949e', marginTop: 3 }}>
                      {m.date} {m.status && <span style={{ marginLeft: 8, color: '#f97316' }}>{m.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fetchingMatch && (
              <div style={{ textAlign: 'center', padding: 20, color: '#8b949e', fontSize: 13 }}>
                Loading match data…
              </div>
            )}
            {searchResults.length === 0 && !searching && searchQuery && (
              <div style={{ textAlign: 'center', padding: 20, color: '#8b949e', fontSize: 13 }}>
                No IPL matches found. Try different search terms.
              </div>
            )}
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 16, borderTop: '1px solid #21262d', paddingTop: 12 }}>
              💡 Search by team names e.g. "Mumbai Indians" or match number e.g. "Match 1 IPL"
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Match Info */}
        <SectionLabel>Match Info</SectionLabel>

        {scrapeWarnings.length > 0 && (
          <div style={{
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#eab308', marginBottom: 6 }}>
              ⚠️ Some fields could not be auto-filled:
            </div>
            {scrapeWarnings.map((w, i) => (
              <div key={i} style={{ fontSize: 11, color: '#ca8a04', marginTop: 3 }}>• {w}</div>
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
              <div style={{ fontSize: 11, color: '#f97316', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '3px 8px', marginBottom: 4, display: 'inline-block' }}>
                🏏 ESPN: {scrapeHints.playerOfMatchName}
              </div>
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
              <div style={{ fontSize: 11, color: '#f97316', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '3px 8px', marginBottom: 4, display: 'inline-block' }}>
                🏏 ESPN: {scrapeHints.topScorerName}
              </div>
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
              <div style={{ fontSize: 11, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, padding: '3px 8px', marginBottom: 4, display: 'inline-block' }}>
                ⚡ ESPN: {scrapeHints.topWicketTakerName}
              </div>
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
          <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : editMatch ? 'Update Match' : 'Save Match'}
          </Button>
        </div>
      </form>
    </div>
  )
}
