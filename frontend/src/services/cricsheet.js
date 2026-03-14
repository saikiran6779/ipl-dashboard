/**
 * Cricsheet JSON parsing utilities for IPL match data.
 *
 * parseCricsheetData() — pure parser, no DB knowledge needed.
 *   Returns raw city/venue strings in `hints` so the caller can
 *   resolve against the fetched venues list.
 *
 * resolveVenueFromJson() — matches Cricsheet city/venue against
 *   the venues array returned by GET /api/venues.
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

// ── Cricsheet venue name → normalised DB venue name ───────────────────────────
// Used only as a fallback when city matching fails.

const VENUE_NAME_MAP = {
  'wankhede stadium':                                             'Wankhede Stadium',
  'ma chidambaram stadium':                                       'M. A. Chidambaram Stadium',
  'm.a. chidambaram stadium':                                     'M. A. Chidambaram Stadium',
  'chepauk':                                                      'M. A. Chidambaram Stadium',
  'm.chinnaswamy stadium':                                        'M. Chinnaswamy Stadium',
  'm chinnaswamy stadium':                                        'M. Chinnaswamy Stadium',
  'chinnaswamy stadium':                                          'M. Chinnaswamy Stadium',
  'eden gardens':                                                 'Eden Gardens',
  'arun jaitley stadium':                                         'Arun Jaitley Stadium',
  'feroz shah kotla':                                             'Arun Jaitley Stadium',
  'hpca stadium':                                                 'HPCA Stadium',
  'sawai mansingh stadium':                                       'Sawai Mansingh Stadium',
  'rajiv gandhi international cricket stadium':                   'Rajiv Gandhi Intl Stadium',
  'rajiv gandhi intl stadium':                                    'Rajiv Gandhi Intl Stadium',
  'narendra modi stadium':                                        'Narendra Modi Stadium',
  'bharat ratna shri atal bihari vajpayee ekana cricket stadium': 'BRSABV Ekana Stadium',
  'brsabv ekana stadium':                                         'BRSABV Ekana Stadium',
  'ekana cricket stadium':                                        'BRSABV Ekana Stadium',
  'ekana stadium':                                                'BRSABV Ekana Stadium',
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
 * Venue is returned as raw city + name strings — call resolveVenueFromJson
 * with the fetched venues list to get the venue ID.
 *
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

  let winner = '', winMargin = '', winType = '', noResult = false
  const outcome = info.outcome || {}
  if (outcome.result === 'no result' || outcome.result === 'tie') {
    noResult = true
  } else if (outcome.winner) {
    winner = mapTeam(outcome.winner, warnings)
    if      (outcome.by?.wickets)        { winMargin = String(outcome.by.wickets); winType = 'wickets' }
    else if (outcome.by?.runs)           { winMargin = String(outcome.by.runs);    winType = 'runs'    }
    else if (outcome.by?.['super over']) { winMargin = '1'; winType = 'runs' }
  }

  const playerOfMatchName = info.player_of_match?.[0] || ''
  if (!playerOfMatchName) warnings.push('Player of the match not available')

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
      team1, team2,
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
      // Raw Cricsheet values — used by resolveVenueFromJson
      venueCity:          info.city  || '',
      venueName:          info.venue || '',
      playerOfMatchName,
      topScorerName:      topScorer.name,
      topWicketTakerName: topWicketTaker.name,
    },
    warnings,
  }
}

// ── Phase helpers ─────────────────────────────────────────────────────────────
// over.over is 0-indexed: 0 = first over of innings.
// Powerplay : index 0-5   (overs 1-6)
// Middle    : index 6-14  (overs 7-15)
// Death     : index 15-19 (overs 16-20)

function getPhase(overIndex) {
  if (overIndex <= 5)  return 'pp'
  if (overIndex <= 14) return 'mid'
  return 'death'
}

// Dismissal kinds that do NOT credit the bowler (Rule 5).
// Separate from NON_BOWLER_KINDS to avoid touching the existing parseCricsheetData pipeline.
const BOWLER_NO_CREDIT = new Set([
  'run out', 'retired hurt', 'retired out', 'obstructing the field',
])

/**
 * Parse a raw Cricsheet JSON into a structured scorecard (one entry per innings).
 * Returns innings in match order; super-overs are skipped.
 *
 * Each innings: { team, teamId, battingRows, bowlingRows }
 * Player names are raw Cricsheet strings — callers resolve them with resolvePlayerFromJson().
 *
 * @param {object} data  Raw Cricsheet JSON
 * @returns {{ innings: Array }}
 */
export function parseScorecardFromJson(data) {
  const innings = data.innings || []
  const warnings = []
  return {
    innings: innings
      .filter(i => !i.super_over)
      .map(inn => ({
        team:        inn.team || '',
        teamId:      mapTeam(inn.team || '', warnings),  // e.g. 'GT', 'LSG'
        battingRows: _parseBatting(inn),
        bowlingRows: _parseBowling(inn),
      }))
  }
}

// ── Batting parser ────────────────────────────────────────────────────────────

function _parseBatting(inn) {
  const batters  = {}   // cricsheetName → accumulated stats
  const position = {}   // cricsheetName → 1-based batting position
  let   posCount = 0

  const ensureBatter = (name) => {
    if (!batters[name]) {
      batters[name] = {
        runs: 0, balls: 0, fours: 0, sixes: 0,
        ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
        dismissal: 'not out', dismissedBy: null, caughtBy: null,
      }
    }
    return batters[name]
  }

  for (const over of (inn.overs || [])) {
    const phase = getPhase(over.over)

    for (const d of (over.deliveries || [])) {
      const batter = d.batter

      // Batting position: order of first appearance as striker (Rule 9)
      if (!(batter in position)) { posCount++; position[batter] = posCount }

      const b          = ensureBatter(batter)
      const batterRuns = d.runs?.batter ?? 0
      const isWide     = !!d.extras?.wides

      b.runs += batterRuns

      // Wides don't count as balls faced (Rule 1 / Rule 3)
      if (!isWide) {
        b.balls++
        if (phase === 'pp')    b.ppBalls++
        else if (phase === 'mid')   b.midBalls++
        else                        b.deathBalls++
      }

      // Phase batting runs (wides always have batterRuns=0 so safe to add)
      if (phase === 'pp')    b.ppRuns    += batterRuns
      else if (phase === 'mid')   b.midRuns   += batterRuns
      else                        b.deathRuns += batterRuns

      // 4s and 6s count on legal deliveries only (wides have batterRuns=0 anyway)
      if (!isWide && batterRuns === 4) b.fours++
      if (!isWide && batterRuns === 6) b.sixes++

      // ── Dismissals (Rule 5 / Rule 6) ─────────────────────────────────────
      // w.player_out can be the striker OR the non-striker (run out).
      // We update whichever player was dismissed, creating their entry if needed.
      if (d.wickets) {
        for (const w of d.wickets) {
          const dismissed = w.player_out
          if (!dismissed) continue

          // Player might not have appeared as batter yet (non-striker run out)
          if (!(dismissed in position)) { posCount++; position[dismissed] = posCount }
          const bd = ensureBatter(dismissed)

          bd.dismissal = w.kind || 'out'

          // Bowler credit only for credited kinds
          if (!BOWLER_NO_CREDIT.has(w.kind)) {
            bd.dismissedBy = d.bowler || null
          }

          // First fielder gets caughtBy credit (catches, stumpings, run-outs)
          const fielders = w.fielders || []
          if (fielders.length > 0) {
            bd.caughtBy = fielders[0].name || null
          }
        }
      }
    }
  }

  return Object.entries(batters).map(([name, s]) => ({
    cricsheetName: name,
    battingPosition: position[name] ?? null,
    runs:   s.runs,
    balls:  s.balls,
    fours:  s.fours,
    sixes:  s.sixes,
    dismissalType:   s.dismissal,
    dismissedByName: s.dismissedBy,
    caughtByName:    s.caughtBy,
    ppRuns:      s.ppRuns    || null,
    ppBalls:     s.ppBalls   || null,
    middleRuns:  s.midRuns   || null,
    middleBalls: s.midBalls  || null,
    deathRuns:   s.deathRuns  || null,
    deathBalls:  s.deathBalls || null,
  }))
}

// ── Bowling parser ────────────────────────────────────────────────────────────

function _parseBowling(inn) {
  const bowlers = {}  // cricsheetName → accumulated stats

  const ensureBowler = (name) => {
    if (!bowlers[name]) {
      bowlers[name] = {
        balls: 0, runs: 0, wickets: 0,
        wides: 0, noBalls: 0, maidens: 0, dotBalls: 0,
        ppRuns: 0, ppBalls: 0,
        midRuns: 0, midBalls: 0,
        deathRuns: 0, deathBalls: 0,
      }
    }
    return bowlers[name]
  }

  for (const over of (inn.overs || [])) {
    const phase = getPhase(over.over)

    // Group deliveries by their actual bowler to handle rare mid-over changes
    const byBowler = {}
    for (const d of (over.deliveries || [])) {
      const b = d.bowler
      if (!b) continue
      if (!byBowler[b]) byBowler[b] = []
      byBowler[b].push(d)
    }

    for (const [bowlerName, deliveries] of Object.entries(byBowler)) {
      const bl = ensureBowler(bowlerName)
      let overLegalBalls  = 0
      let overBowlerRuns  = 0

      for (const d of deliveries) {
        const extras    = d.extras || {}
        const isWide    = !!extras.wides
        const isNoBall  = !!extras.noballs
        // A valid delivery counts toward the over: NOT a wide AND NOT a no-ball.
        // No-balls require an extra delivery to complete the over, same as wides.
        const validBall = !isWide && !isNoBall

        // ── Bowler runs formula (Rule 2) ─────────────────────────────────
        // Leg-byes and byes are NOT charged to the bowler.
        const bowlerRuns = (d.runs?.total ?? 0)
                         - (extras.legbyes ?? 0)
                         - (extras.byes    ?? 0)

        bl.runs        += bowlerRuns
        overBowlerRuns += bowlerRuns

        if (isWide) {
          bl.wides++
        } else if (isNoBall) {
          bl.noBalls++
          // no-ball does NOT advance the over ball count
        } else {
          bl.balls++
          overLegalBalls++
        }

        // Dot ball: valid delivery where bowler concedes 0 runs (Rule 4)
        // A leg-bye on a valid delivery IS a dot for the bowler.
        if (validBall && bowlerRuns === 0) bl.dotBalls++

        // Wickets — only bowler-credited kinds (Rule 5)
        if (d.wickets) {
          for (const w of d.wickets) {
            if (!BOWLER_NO_CREDIT.has(w.kind)) bl.wickets++
          }
        }

        // Phase splits: runs use bowlerRuns; balls are valid deliveries only (Rule 8)
        if (phase === 'pp') {
          bl.ppRuns += bowlerRuns
          if (validBall) bl.ppBalls++
        } else if (phase === 'mid') {
          bl.midRuns += bowlerRuns
          if (validBall) bl.midBalls++
        } else {
          bl.deathRuns += bowlerRuns
          if (validBall) bl.deathBalls++
        }
      }

      // Maiden: ≥6 legal balls in this over AND bowler conceded 0 runs (Rule 10)
      if (overLegalBalls >= 6 && overBowlerRuns === 0) bl.maidens++
    }
  }

  return Object.entries(bowlers).map(([name, s]) => {
    const full  = Math.floor(s.balls / 6)
    const rem   = s.balls % 6
    const overs = rem === 0 ? full : parseFloat(`${full}.${rem}`)
    return {
      cricsheetName:    name,
      balls:            s.balls,
      oversBowled:      overs,
      wickets:          s.wickets,
      runsConceded:     s.runs,
      wides:            s.wides    || null,
      noBalls:          s.noBalls  || null,
      maidens:          s.maidens  || null,
      dotBalls:         s.dotBalls || null,
      ppRuns:           s.ppRuns   || null,
      ppBalls:          s.ppBalls  || null,
      deathRuns:        s.deathRuns  || null,
      deathBalls:       s.deathBalls || null,
    }
  })
}

/**
 * Given Cricsheet city + venue name and the venues list from GET /api/venues,
 * return the matching venue object { id, name, city } or null.
 *
 * Resolution order:
 *   1. Exact city match (most reliable — Cricsheet city is consistent)
 *   2. Normalised venue name lookup via VENUE_NAME_MAP
 *   3. Partial venue name containment (unique match only)
 */
export function resolveVenueFromJson(city, venueName, venues) {
  if (!venues?.length) return null

  // 1. City match (fast, reliable)
  if (city) {
    const byCity = venues.filter(v => v.city.toLowerCase() === city.toLowerCase())
    if (byCity.length === 1) return byCity[0]
  }

  // 2. Normalised name lookup
  if (venueName) {
    const lower      = venueName.toLowerCase().trim()
    const normalised = VENUE_NAME_MAP[lower]
    if (normalised) {
      const byNorm = venues.find(v => v.name.toLowerCase() === normalised.toLowerCase())
      if (byNorm) return byNorm
    }

    // 3. Partial containment (unique match only)
    const partial = venues.filter(v =>
      v.name.toLowerCase().includes(lower) || lower.includes(v.name.toLowerCase())
    )
    if (partial.length === 1) return partial[0]
  }

  return null
}
