/**
 * cricsheetParser.js
 * Pure functions for parsing Cricsheet-format JSON into MatchForm fields.
 * No React, no state — all deterministic transforms.
 */

// ── Team name → team ID ───────────────────────────────────────────────────────
const TEAM_MAP = {
  'Mumbai Indians':              'MI',
  'Chennai Super Kings':         'CSK',
  'Royal Challengers Bengaluru': 'RCB',
  'Royal Challengers Bangalore': 'RCB',
  'Kolkata Knight Riders':       'KKR',
  'Delhi Capitals':              'DC',
  'Punjab Kings':                'PBKS',
  'Rajasthan Royals':            'RR',
  'Sunrisers Hyderabad':         'SRH',
  'Gujarat Titans':              'GT',
  'Lucknow Super Giants':        'LSG',
}

// ── Cricsheet venue → DB venue string ─────────────────────────────────────────
// Cricsheet often omits the city or uses the full official name.
const VENUE_MAP = [
  ['Wankhede',                           'Wankhede Stadium, Mumbai'],
  ['Chidambaram',                        'M. A. Chidambaram Stadium, Chennai'],
  ['Chinnaswamy',                        'M. Chinnaswamy Stadium, Bengaluru'],
  ['Eden Gardens',                       'Eden Gardens, Kolkata'],
  ['Arun Jaitley',                       'Arun Jaitley Stadium, Delhi'],
  ['HPCA',                               'HPCA Stadium, Dharamsala'],
  ['Sawai Mansingh',                     'Sawai Mansingh Stadium, Jaipur'],
  ['Rajiv Gandhi',                       'Rajiv Gandhi Intl Stadium, Hyderabad'],
  ['Narendra Modi',                      'Narendra Modi Stadium, Ahmedabad'],
  ['Ekana',                              'BRSABV Ekana Stadium, Lucknow'],
]

function mapTeam(name, warnings) {
  if (!name) return ''
  const hit = Object.entries(TEAM_MAP).find(
    ([k]) => name.toLowerCase() === k.toLowerCase()
  )
  if (hit) return hit[1]
  if (warnings) warnings.push(`Unknown team: "${name}" — select manually`)
  return ''
}

function mapVenue(cricsheetVenue) {
  if (!cricsheetVenue) return ''
  for (const [keyword, dbVenue] of VENUE_MAP) {
    if (cricsheetVenue.includes(keyword)) return dbVenue
  }
  return cricsheetVenue // return as-is; the Select will just show nothing selected
}

// ── Delivery-level aggregators ────────────────────────────────────────────────
const NON_BOWLER_DISMISSALS = new Set(['run out', 'retired hurt', 'obstructing the field'])

function computeInnings(inningsObj) {
  // Skip super-over innings
  if (inningsObj.super_over) return null

  let runs = 0, wickets = 0, balls = 0
  for (const over of (inningsObj.overs || [])) {
    for (const d of (over.deliveries || [])) {
      runs += d.runs?.total ?? 0
      if (!d.extras?.wides && !d.extras?.noballs) balls++
      if (d.wickets) wickets += d.wickets.length
    }
  }
  const full = Math.floor(balls / 6)
  const rem  = balls % 6
  return { runs, wickets, overs: rem === 0 ? full : parseFloat(`${full}.${rem}`) }
}

function computeTopScorer(inningsObj) {
  if (!inningsObj || inningsObj.super_over) return { name: '', runs: null }
  const tally = {}
  for (const over of (inningsObj.overs || [])) {
    for (const d of (over.deliveries || [])) {
      tally[d.batter] = (tally[d.batter] || 0) + (d.runs?.batter ?? 0)
    }
  }
  return Object.entries(tally).reduce(
    (best, [name, runs]) => (runs > (best.runs ?? -1) ? { name, runs } : best),
    { name: '', runs: null }
  )
}

function computeTopWicketTaker(inningsObj) {
  if (!inningsObj || inningsObj.super_over) return { name: '', wickets: null }
  const tally = {}
  for (const over of (inningsObj.overs || [])) {
    for (const d of (over.deliveries || [])) {
      if (!d.wickets) continue
      for (const w of d.wickets) {
        if (!NON_BOWLER_DISMISSALS.has(w.kind)) {
          tally[d.bowler] = (tally[d.bowler] || 0) + 1
        }
      }
    }
  }
  return Object.entries(tally).reduce(
    (best, [name, wickets]) => (wickets > (best.wickets ?? -1) ? { name, wickets } : best),
    { name: '', wickets: null }
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Parses a Cricsheet JSON object.
 *
 * Returns:
 *   fields            – object with all form-fillable fields (null = not found)
 *   playerOfMatchName – raw Cricsheet name string
 *   topScorer         – { name, runs }
 *   topWicketTaker    – { name, wickets }
 *   warnings          – string[] of issues for the user
 */
export function parseCricsheet(data) {
  const warnings = []
  const info    = data.info    || {}
  const innings = data.innings || []

  // Teams
  const [team1Name = '', team2Name = ''] = info.teams || []
  const team1 = mapTeam(team1Name, warnings)
  const team2 = mapTeam(team2Name, warnings)

  // Basic match info
  const date    = info.dates?.[0]             || ''
  const matchNo = info.event?.match_number    ?? ''
  const venue   = mapVenue(info.venue         || '')

  // Toss
  const tossWinner   = mapTeam(info.toss?.winner || '', null) // silent — covered by team warnings
  const tossDecision = info.toss?.decision === 'bat' ? 'bat' : 'field'

  // Outcome
  let winner = '', winMargin = '', winType = '', noResult = false
  const outcome = info.outcome || {}
  if (outcome.result === 'no result' || outcome.result === 'tie') {
    noResult = true
  } else if (outcome.winner) {
    winner = mapTeam(outcome.winner, null)
    if (outcome.by?.wickets) { winMargin = String(outcome.by.wickets); winType = 'wickets' }
    else if (outcome.by?.runs) { winMargin = String(outcome.by.runs); winType = 'runs' }
  }

  // Player of match
  const playerOfMatchName = info.player_of_match?.[0] || ''
  if (!playerOfMatchName) warnings.push('Player of the match not available in JSON')

  // Find regular (non-super-over) innings per team
  const inn1 = innings.find(i => i.team === team1Name && !i.super_over) || innings[0]
  const inn2 = innings.find(i => i.team === team2Name && !i.super_over) || innings[1]

  const score1 = (inn1 ? computeInnings(inn1) : null) || { runs: null, wickets: null, overs: null }
  const score2 = (inn2 ? computeInnings(inn2) : null) || { runs: null, wickets: null, overs: null }

  // Best performer across both innings
  const ts1 = computeTopScorer(inn1)
  const ts2 = computeTopScorer(inn2)
  const topScorer = (ts1.runs ?? -1) >= (ts2.runs ?? -1) ? ts1 : ts2

  const tw1 = computeTopWicketTaker(inn1)
  const tw2 = computeTopWicketTaker(inn2)
  const topWicketTaker = (tw1.wickets ?? -1) >= (tw2.wickets ?? -1) ? tw1 : tw2

  if (!topScorer.name)      warnings.push('Could not determine top scorer from deliveries')
  if (!topWicketTaker.name) warnings.push('Could not determine top wicket taker from deliveries')

  return {
    fields: {
      date, matchNo, venue,
      team1, team2,
      team1Score:   score1.runs,    team1Wickets: score1.wickets, team1Overs: score1.overs,
      team2Score:   score2.runs,    team2Wickets: score2.wickets, team2Overs: score2.overs,
      tossWinner,   tossDecision,
      winner,       winMargin,      winType,      noResult,
      topScorerRuns:         topScorer.runs,
      topWicketTakerWickets: topWicketTaker.wickets,
    },
    playerOfMatchName,
    topScorer,
    topWicketTaker,
    warnings,
  }
}
