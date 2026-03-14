/**
 * Cricsheet JSON parsing utilities for IPL match data.
 * Handles team/venue name normalisation, innings computation,
 * top-scorer and top-wicket-taker extraction.
 */

// ── Team name → IPL team ID ───────────────────────────────────────────────────

const TEAM_MAP = {
  'Mumbai Indians':                'MI',
  'Chennai Super Kings':           'CSK',
  'Royal Challengers Bengaluru':   'RCB',
  'Royal Challengers Bangalore':   'RCB',  // legacy spelling
  'Kolkata Knight Riders':         'KKR',
  'Delhi Capitals':                'DC',
  'Punjab Kings':                  'PBKS',
  'Rajasthan Royals':              'RR',
  'Sunrisers Hyderabad':           'SRH',
  'Gujarat Titans':                'GT',
  'Lucknow Super Giants':          'LSG',
}

function mapTeam(name, warnings) {
  if (!name) return ''
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(TEAM_MAP)) {
    if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) return v
  }
  warnings.push(`Unknown team: "${name}" — select manually`)
  return ''
}

// ── Venue name normalisation (Cricsheet → DB VENUES list) ────────────────────

const VENUE_MAP = {
  'wankhede stadium':                                              'Wankhede Stadium, Mumbai',
  'ma chidambaram stadium':                                        'M. A. Chidambaram Stadium, Chennai',
  'm.a. chidambaram stadium':                                      'M. A. Chidambaram Stadium, Chennai',
  'chepauk':                                                       'M. A. Chidambaram Stadium, Chennai',
  'm.chinnaswamy stadium':                                         'M. Chinnaswamy Stadium, Bengaluru',
  'm chinnaswamy stadium':                                         'M. Chinnaswamy Stadium, Bengaluru',
  'chinnaswamy stadium':                                           'M. Chinnaswamy Stadium, Bengaluru',
  'eden gardens':                                                  'Eden Gardens, Kolkata',
  'arun jaitley stadium':                                          'Arun Jaitley Stadium, Delhi',
  'feroz shah kotla':                                              'Arun Jaitley Stadium, Delhi',
  'hpca stadium':                                                  'HPCA Stadium, Dharamsala',
  'sawai mansingh stadium':                                        'Sawai Mansingh Stadium, Jaipur',
  'rajiv gandhi international cricket stadium':                    'Rajiv Gandhi Intl Stadium, Hyderabad',
  'rajiv gandhi intl stadium':                                     'Rajiv Gandhi Intl Stadium, Hyderabad',
  'narendra modi stadium':                                         'Narendra Modi Stadium, Ahmedabad',
  'bharat ratna shri atal bihari vajpayee ekana cricket stadium':  'BRSABV Ekana Stadium, Lucknow',
  'brsabv ekana stadium':                                          'BRSABV Ekana Stadium, Lucknow',
  'ekana cricket stadium':                                         'BRSABV Ekana Stadium, Lucknow',
  'ekana stadium':                                                 'BRSABV Ekana Stadium, Lucknow',
}

function mapVenue(raw) {
  if (!raw) return ''
  const lower = raw.toLowerCase().trim()
  if (VENUE_MAP[lower]) return VENUE_MAP[lower]
  // Partial: raw venue starts with a known key prefix  (handles "Eden Gardens, Kolkata")
  for (const [k, v] of Object.entries(VENUE_MAP)) {
    const base = k.split(',')[0]
    if (lower.startsWith(base) || base.startsWith(lower.split(',')[0].trim())) return v
  }
  return raw  // fall back to raw — user can adjust via dropdown
}

// ── Innings computations ──────────────────────────────────────────────────────

function computeInnings(inn) {
  let runs = 0, wickets = 0, balls = 0
  for (const over of (inn.overs || [])) {
    for (const d of (over.deliveries || [])) {
      runs += d.runs?.total ?? 0
      if (!d.extras?.wides && !d.extras?.noballs) balls++
      if (d.wickets) wickets += d.wickets.length
    }
  }
  const full = Math.floor(balls / 6)
  const rem  = balls % 6
  const overs = rem === 0 ? full : parseFloat(`${full}.${rem}`)
  return { runs, wickets, overs }
}

function computeTopScorer(inn) {
  const runs = {}
  for (const over of (inn.overs || [])) {
    for (const d of (over.deliveries || [])) {
      runs[d.batter] = (runs[d.batter] || 0) + (d.runs?.batter ?? 0)
    }
  }
  let name = '', top = -1
  for (const [n, r] of Object.entries(runs)) {
    if (r > top) { top = r; name = n }
  }
  return { name, runs: top >= 0 ? top : null }
}

const NON_BOWLER_KINDS = new Set(['run out', 'retired hurt', 'obstructing the field'])

function computeTopWicketTaker(inn) {
  const wkts = {}
  for (const over of (inn.overs || [])) {
    for (const d of (over.deliveries || [])) {
      if (!d.wickets) continue
      for (const w of d.wickets) {
        if (!NON_BOWLER_KINDS.has(w.kind)) {
          wkts[d.bowler] = (wkts[d.bowler] || 0) + 1
        }
      }
    }
  }
  let name = '', top = -1
  for (const [n, w] of Object.entries(wkts)) {
    if (w > top) { top = w; name = n }
  }
  return { name, wickets: top >= 0 ? top : null }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parse a raw Cricsheet JSON object.
 * @returns {{ fields: object, hints: object, warnings: string[] }}
 */
export function parseCricsheetData(data) {
  const warnings = []
  const info    = data.info    || {}
  const innings = data.innings || []

  // Skip super-over innings to avoid inflated scores
  const regular = innings.filter(i => !i.super_over)

  const [team1Name, team2Name] = [info.teams?.[0] || '', info.teams?.[1] || '']
  const team1 = mapTeam(team1Name, warnings)
  const team2 = mapTeam(team2Name, warnings)

  const tossWinner  = mapTeam(info.toss?.winner || '', warnings)
  const tossDecision = info.toss?.decision === 'bat' ? 'bat' : 'field'
  const venue       = mapVenue(info.venue || '')

  let winner = '', winMargin = '', winType = '', noResult = false
  const outcome = info.outcome || {}
  if (outcome.result === 'no result' || outcome.result === 'tie') {
    noResult = true
  } else if (outcome.winner) {
    winner = mapTeam(outcome.winner, warnings)
    if      (outcome.by?.wickets)         { winMargin = String(outcome.by.wickets); winType = 'wickets' }
    else if (outcome.by?.runs)            { winMargin = String(outcome.by.runs);    winType = 'runs'    }
    else if (outcome.by?.['super over'])  { winMargin = '1'; winType = 'runs' }
  }

  const playerOfMatchName = info.player_of_match?.[0] || ''
  if (!playerOfMatchName) warnings.push('Player of the match not available')

  // Match innings to team names (first occurrence = regular inning for that team)
  const inn1   = regular.find(i => i.team === team1Name) || regular[0]
  const inn2   = regular.find(i => i.team === team2Name) || regular[1]
  const score1 = inn1 ? computeInnings(inn1) : { runs: null, wickets: null, overs: null }
  const score2 = inn2 ? computeInnings(inn2) : { runs: null, wickets: null, overs: null }

  const sc1 = inn1 ? computeTopScorer(inn1) : { name: '', runs: null }
  const sc2 = inn2 ? computeTopScorer(inn2) : { name: '', runs: null }
  const topScorer = (sc1.runs ?? 0) >= (sc2.runs ?? 0) ? sc1 : sc2

  const wk1 = inn1 ? computeTopWicketTaker(inn1) : { name: '', wickets: null }
  const wk2 = inn2 ? computeTopWicketTaker(inn2) : { name: '', wickets: null }
  const topWicketTaker = (wk1.wickets ?? 0) >= (wk2.wickets ?? 0) ? wk1 : wk2

  if (!topScorer.name)      warnings.push('Could not determine top scorer')
  if (!topWicketTaker.name) warnings.push('Could not determine top wicket taker')

  return {
    fields: {
      date:                  info.dates?.[0] || '',
      matchNo:               info.event?.match_number ?? '',
      venue, team1, team2,
      team1Score:            score1.runs,
      team1Wickets:          score1.wickets,
      team1Overs:            score1.overs,
      team2Score:            score2.runs,
      team2Wickets:          score2.wickets,
      team2Overs:            score2.overs,
      tossWinner, tossDecision,
      winner, winMargin, winType, noResult,
      topScorerRuns:         topScorer.runs,
      topWicketTakerWickets: topWicketTaker.wickets,
    },
    hints: {
      playerOfMatchName,
      topScorerName:      topScorer.name,
      topWicketTakerName: topWicketTaker.name,
    },
    warnings,
  }
}
