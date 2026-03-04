package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.MatchDTO;
import com.ipl.dashboard.dto.StatsDTO;
import com.ipl.dashboard.model.Match;
import com.ipl.dashboard.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;

    private static final Map<String, String> TEAM_NAMES = Map.ofEntries(
        Map.entry("MI",   "Mumbai Indians"),
        Map.entry("CSK",  "Chennai Super Kings"),
        Map.entry("RCB",  "Royal Challengers Bengaluru"),
        Map.entry("KKR",  "Kolkata Knight Riders"),
        Map.entry("DC",   "Delhi Capitals"),
        Map.entry("PBKS", "Punjab Kings"),
        Map.entry("RR",   "Rajasthan Royals"),
        Map.entry("SRH",  "Sunrisers Hyderabad"),
        Map.entry("GT",   "Gujarat Titans"),
        Map.entry("LSG",  "Lucknow Super Giants")
    );

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public List<MatchDTO> getAllMatches() {
        return matchRepository.findAllByOrderByDateDescMatchNoDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MatchDTO getMatchById(Long id) {
        return matchRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Match not found: " + id));
    }

    public MatchDTO createMatch(MatchDTO dto) {
        Match saved = matchRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    public MatchDTO updateMatch(Long id, MatchDTO dto) {
        if (!matchRepository.existsById(id)) {
            throw new NoSuchElementException("Match not found: " + id);
        }
        Match entity = toEntity(dto);
        entity.setId(id);
        return toDTO(matchRepository.save(entity));
    }

    public void deleteMatch(Long id) {
        if (!matchRepository.existsById(id)) {
            throw new NoSuchElementException("Match not found: " + id);
        }
        matchRepository.deleteById(id);
    }

    // ── STATS ─────────────────────────────────────────────────────────────────

    public StatsDTO.Summary getStats() {
        List<Match> all = matchRepository.findAll();

        int totalRuns = all.stream()
                .mapToInt(m -> safe(m.getTeam1Score()) + safe(m.getTeam2Score()))
                .sum();

        int highestScore = all.stream()
                .mapToInt(m -> Math.max(safe(m.getTeam1Score()), safe(m.getTeam2Score())))
                .max().orElse(0);

        Set<String> teams = new HashSet<>();
        all.forEach(m -> { teams.add(m.getTeam1()); teams.add(m.getTeam2()); });

        return StatsDTO.Summary.builder()
                .totalMatches(all.size())
                .totalRuns(totalRuns)
                .highestScore(highestScore)
                .teamsActive(teams.size())
                .standings(computeStandings(all))
                .topBatters(computeTopBatters(all))
                .topBowlers(computeTopBowlers(all))
                .topMom(computeMom(all))
                .build();
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private List<StatsDTO.TeamStanding> computeStandings(List<Match> matches) {
        Map<String, StatsDTO.TeamStanding> table = new LinkedHashMap<>();

        // Seed all known teams
        TEAM_NAMES.forEach((id, name) -> table.put(id, StatsDTO.TeamStanding.builder()
                .teamId(id).teamName(name).build()));

        for (Match m : matches) {
            String t1 = m.getTeam1(), t2 = m.getTeam2();
            table.putIfAbsent(t1, StatsDTO.TeamStanding.builder().teamId(t1).teamName(TEAM_NAMES.getOrDefault(t1, t1)).build());
            table.putIfAbsent(t2, StatsDTO.TeamStanding.builder().teamId(t2).teamName(TEAM_NAMES.getOrDefault(t2, t2)).build());

            StatsDTO.TeamStanding s1 = table.get(t1);
            StatsDTO.TeamStanding s2 = table.get(t2);

            int r1 = safe(m.getTeam1Score()), r2 = safe(m.getTeam2Score());
            int b1 = oversToBalls(m.getTeam1Overs()), b2 = oversToBalls(m.getTeam2Overs());

            s1.setPlayed(s1.getPlayed() + 1);
            s2.setPlayed(s2.getPlayed() + 1);
            s1.setRunsFor(s1.getRunsFor() + r1);       s1.setBallsFor(s1.getBallsFor() + b1);
            s1.setRunsAgainst(s1.getRunsAgainst() + r2); s1.setBallsAgainst(s1.getBallsAgainst() + b2);
            s2.setRunsFor(s2.getRunsFor() + r2);       s2.setBallsFor(s2.getBallsFor() + b2);
            s2.setRunsAgainst(s2.getRunsAgainst() + r1); s2.setBallsAgainst(s2.getBallsAgainst() + b1);

            if (t1.equals(m.getWinner())) {
                s1.setWon(s1.getWon() + 1); s1.setPoints(s1.getPoints() + 2);
                s2.setLost(s2.getLost() + 1);
            } else if (t2.equals(m.getWinner())) {
                s2.setWon(s2.getWon() + 1); s2.setPoints(s2.getPoints() + 2);
                s1.setLost(s1.getLost() + 1);
            }
        }

        // Compute NRR
        table.values().forEach(s -> {
            double rr1 = s.getBallsFor() > 0 ? ((double) s.getRunsFor() / s.getBallsFor()) * 6 : 0;
            double rr2 = s.getBallsAgainst() > 0 ? ((double) s.getRunsAgainst() / s.getBallsAgainst()) * 6 : 0;
            s.setNrr(Math.round((rr1 - rr2) * 1000.0) / 1000.0);
        });

        return table.values().stream()
                .sorted(Comparator.comparingInt(StatsDTO.TeamStanding::getPoints).reversed()
                        .thenComparingDouble(StatsDTO.TeamStanding::getNrr).reversed())
                .collect(Collectors.toList());
    }

    private List<StatsDTO.BatterStat> computeTopBatters(List<Match> matches) {
        Map<String, StatsDTO.BatterStat> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getTopScorer() != null && !m.getTopScorer().isBlank())
               .forEach(m -> {
                   map.computeIfAbsent(m.getTopScorer(), n -> StatsDTO.BatterStat.builder().name(n).build());
                   StatsDTO.BatterStat s = map.get(m.getTopScorer());
                   s.setTotalRuns(s.getTotalRuns() + safe(m.getTopScorerRuns()));
                   s.setInnings(s.getInnings() + 1);
               });
        return map.values().stream()
                .sorted(Comparator.comparingInt(StatsDTO.BatterStat::getTotalRuns).reversed())
                .limit(10).collect(Collectors.toList());
    }

    private List<StatsDTO.BowlerStat> computeTopBowlers(List<Match> matches) {
        Map<String, StatsDTO.BowlerStat> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getTopWicketTaker() != null && !m.getTopWicketTaker().isBlank())
               .forEach(m -> {
                   map.computeIfAbsent(m.getTopWicketTaker(), n -> StatsDTO.BowlerStat.builder().name(n).build());
                   StatsDTO.BowlerStat s = map.get(m.getTopWicketTaker());
                   s.setTotalWickets(s.getTotalWickets() + safe(m.getTopWicketTakerWickets()));
                   s.setInnings(s.getInnings() + 1);
               });
        return map.values().stream()
                .sorted(Comparator.comparingInt(StatsDTO.BowlerStat::getTotalWickets).reversed())
                .limit(10).collect(Collectors.toList());
    }

    private List<StatsDTO.MomStat> computeMom(List<Match> matches) {
        Map<String, Integer> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getPlayerOfMatch() != null && !m.getPlayerOfMatch().isBlank())
               .forEach(m -> map.merge(m.getPlayerOfMatch(), 1, Integer::sum));
        return map.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(e -> StatsDTO.MomStat.builder().name(e.getKey()).awards(e.getValue()).build())
                .collect(Collectors.toList());
    }

    private int oversToBalls(Double overs) {
        if (overs == null) return 120;
        int full = (int) Math.floor(overs);
        int extra = (int) Math.round((overs - full) * 10);
        return full * 6 + extra;
    }

    private int safe(Integer v) { return v == null ? 0 : v; }

    // ── MAPPER ────────────────────────────────────────────────────────────────

    private MatchDTO toDTO(Match m) {
        return MatchDTO.builder()
                .id(m.getId()).matchNo(m.getMatchNo()).date(m.getDate()).venue(m.getVenue())
                .team1(m.getTeam1()).team2(m.getTeam2())
                .team1Score(m.getTeam1Score()).team1Wickets(m.getTeam1Wickets()).team1Overs(m.getTeam1Overs())
                .team2Score(m.getTeam2Score()).team2Wickets(m.getTeam2Wickets()).team2Overs(m.getTeam2Overs())
                .tossWinner(m.getTossWinner()).tossDecision(m.getTossDecision())
                .winner(m.getWinner()).winMargin(m.getWinMargin()).winType(m.getWinType())
                .playerOfMatch(m.getPlayerOfMatch())
                .topScorer(m.getTopScorer()).topScorerRuns(m.getTopScorerRuns())
                .topWicketTaker(m.getTopWicketTaker()).topWicketTakerWickets(m.getTopWicketTakerWickets())
                .build();
    }

    private Match toEntity(MatchDTO dto) {
        return Match.builder()
                .matchNo(dto.getMatchNo()).date(dto.getDate()).venue(dto.getVenue())
                .team1(dto.getTeam1()).team2(dto.getTeam2())
                .team1Score(dto.getTeam1Score()).team1Wickets(dto.getTeam1Wickets()).team1Overs(dto.getTeam1Overs())
                .team2Score(dto.getTeam2Score()).team2Wickets(dto.getTeam2Wickets()).team2Overs(dto.getTeam2Overs())
                .tossWinner(dto.getTossWinner()).tossDecision(dto.getTossDecision())
                .winner(dto.getWinner()).winMargin(dto.getWinMargin()).winType(dto.getWinType())
                .playerOfMatch(dto.getPlayerOfMatch())
                .topScorer(dto.getTopScorer()).topScorerRuns(dto.getTopScorerRuns())
                .topWicketTaker(dto.getTopWicketTaker()).topWicketTakerWickets(dto.getTopWicketTakerWickets())
                .build();
    }
}
