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

// ── Phase boundaries ──────────────────────────────────────────────────────────
// over.over is 0-indexed in Cricsheet (0 = first over)
// Powerplay: overs 0-5   (over numbers 1-6)
// Middle:    overs 6-14  (over numbers 7-15)
// Death:     overs 15-19 (over numbers 16-20)

function getPhase(overIndex) {
  if (overIndex <= 5)  return 'pp'
  if (overIndex <= 14) return 'mid'
  return 'death'
}

/**
 * Parse a raw Cricsheet JSON into a structured scorecard (one entry per innings).
 *
 * Each innings contains:
 *   team         – team name string from JSON
 *   battingRows  – per-batter stats including phase splits and dismissal detail
 *   bowlingRows  – per-bowler stats including phase splits, wides, no-balls, dots
 *
 * Player names are the raw Cricsheet names — callers must resolve them with
 * resolvePlayerFromJson().
 *
 * @param {object} data  Raw Cricsheet JSON
 * @returns {{ innings: Array<{ team: string, battingRows: object[], bowlingRows: object[] }> }}
 */
export function parseScorecardFromJson(data) {
  const innings = data.innings || []
  // Skip super-overs
  const regular = innings.filter(i => !i.super_over)

  return {
    innings: regular.map(inn => ({
      team:        inn.team || '',
      battingRows: parseBatting(inn),
      bowlingRows: parseBowling(inn),
    }))
  }
}

function parseBatting(inn) {
  // Track per-batter stats keyed by player name
  const batters = {}          // name → { runs, balls, fours, sixes, phases, position }
  const position = {}         // name → batting position (first delivery faced)
  let posCounter = 0
  let lastNonStriker = null   // tracks non-striker for position assignment

  for (const over of (inn.overs || [])) {
    const phase = getPhase(over.over)

    for (const d of (over.deliveries || [])) {
      const batter = d.batter
      const nonStk = d.non_striker

      // Assign position on first appearance
      if (!(batter in position)) {
        posCounter++
        position[batter] = posCounter
      }
      // Non-striker gets the next position slot if they haven't batted yet
      if (nonStk && !(nonStk in position)) {
        lastNonStriker = nonStk
      }

      if (!batters[batter]) {
        batters[batter] = {
          runs: 0, balls: 0, fours: 0, sixes: 0,
          ppRuns: 0, ppBalls: 0,
          midRuns: 0, midBalls: 0,
          deathRuns: 0, deathBalls: 0,
          dismissal: 'not out', dismissedBy: null, caughtBy: null,
        }
      }

      const b = batters[batter]
      const batterRuns = d.runs?.batter ?? 0
      b.runs += batterRuns

      // Only legal deliveries count as balls faced
      const isWide = !!d.extras?.wides
      if (!isWide) {
        b.balls++
        // Phase balls faced
        if (phase === 'pp')    b.ppBalls++
        if (phase === 'mid')   b.midBalls++
        if (phase === 'death') b.deathBalls++
      }

      // Phase runs
      if (phase === 'pp')    b.ppRuns    += batterRuns
      if (phase === 'mid')   b.midRuns   += batterRuns
      if (phase === 'death') b.deathRuns += batterRuns

      if (batterRuns === 4) b.fours++
      if (batterRuns === 6) b.sixes++

      // Dismissal
      if (d.wickets) {
        for (const w of d.wickets) {
          if (w.player_out === batter) {
            b.dismissal   = w.kind || 'out'
            // Bowled / lbw / caught / stumped — bowler gets credit
            if (!NON_BOWLER_KINDS.has(w.kind)) {
              b.dismissedBy = d.bowler || null
            }
            // Fielder for caught / stumped / run out
            const fielders = w.fielders || []
            if (fielders.length > 0) {
              b.caughtBy = fielders[0].name || null
            }
          }
        }
      }
    }
  }

  // Assign position to non-strikers who never faced a ball (walked in but no delivery yet)
  if (lastNonStriker && !(lastNonStriker in position)) {
    posCounter++
    position[lastNonStriker] = posCounter
  }

  return Object.entries(batters).map(([name, s]) => ({
    cricsheetName:   name,
    position:        position[name] ?? null,
    runs:            s.runs,
    balls:           s.balls,
    fours:           s.fours,
    sixes:           s.sixes,
    dismissal:       s.dismissal,
    dismissedBy:     s.dismissedBy,   // cricsheet name of bowler
    caughtBy:        s.caughtBy,      // cricsheet name of fielder
    ppRuns:          s.ppRuns   || null,
    ppBalls:         s.ppBalls  || null,
    midRuns:         s.midRuns  || null,
    midBalls:        s.midBalls || null,
    deathRuns:       s.deathRuns   || null,
    deathBalls:      s.deathBalls  || null,
  }))
}

function parseBowling(inn) {
  const bowlers = {}   // name → stats

  for (const over of (inn.overs || [])) {
    const phase    = getPhase(over.over)
    const bowler   = over.deliveries?.[0]?.bowler   // all deliveries in an over share one bowler
    if (!bowler) continue

    if (!bowlers[bowler]) {
      bowlers[bowler] = {
        balls: 0, runs: 0, wickets: 0,
        wides: 0, noBalls: 0, maidens: 0, dotBalls: 0,
        ppRuns: 0, ppBalls: 0,
        midRuns: 0, midBalls: 0,
        deathRuns: 0, deathBalls: 0,
      }
    }

    const bl = bowlers[bowler]
    let overRuns = 0
    let legalBalls = 0
    let overDots = 0

    for (const d of (over.deliveries || [])) {
      // Use the actual bowler of each delivery (rare mid-over change)
      const delBowler = d.bowler || bowler
      if (delBowler !== bowler) {
        // Edge case: delivery belongs to a different bowler — skip for simplicity
        continue
      }

      const totalRuns = d.runs?.total ?? 0
      const extras    = d.extras || {}
      const isWide    = !!extras.wides
      const isNoBall  = !!extras.noballs

      bl.runs += totalRuns
      overRuns += totalRuns

      if (isWide) {
        bl.wides++
      } else if (isNoBall) {
        bl.noBalls++
        bl.balls++
        legalBalls++
      } else {
        bl.balls++
        legalBalls++
        if (totalRuns === 0) {
          bl.dotBalls++
          overDots++
        }
      }

      // Wickets (not run-outs, which don't count as bowler wickets)
      if (d.wickets) {
        for (const w of d.wickets) {
          if (!NON_BOWLER_KINDS.has(w.kind)) {
            bl.wickets++
          }
        }
      }

      // Phase splits (legal balls only)
      if (!isWide) {
        if (phase === 'pp') {
          bl.ppRuns  += totalRuns
          bl.ppBalls += 1
        } else if (phase === 'mid') {
          bl.midRuns  += totalRuns
          bl.midBalls += 1
        } else {
          bl.deathRuns  += totalRuns
          bl.deathBalls += 1
        }
      }
    }

    // Maiden: over completed with 0 runs from legal deliveries
    if (legalBalls === 6 && overRuns === 0) {
      bl.maidens++
    }
  }

  return Object.entries(bowlers).map(([name, s]) => {
    const full  = Math.floor(s.balls / 6)
    const rem   = s.balls % 6
    const overs = rem === 0 ? full : parseFloat(`${full}.${rem}`)
    return {
      cricsheetName:       name,
      oversBowled:         overs,
      wickets:             s.wickets,
      runsConceded:        s.runs,
      wides:               s.wides    || null,
      noBalls:             s.noBalls  || null,
      maidens:             s.maidens  || null,
      dotBalls:            s.dotBalls || null,
      ppRunsConceded:      s.ppRuns   || null,
      ppBallsBowled:       s.ppBalls  || null,
      midRunsConceded:     s.midRuns  || null,
      midBallsBowled:      s.midBalls || null,
      deathRunsConceded:   s.deathRuns   || null,
      deathBallsBowled:    s.deathBalls  || null,
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
