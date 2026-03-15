package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.MatchDTO;
import com.ipl.dashboard.dto.StatsDTO;
import com.ipl.dashboard.model.Match;
import com.ipl.dashboard.model.Player;
import com.ipl.dashboard.model.Team;
import com.ipl.dashboard.model.Venue;
import com.ipl.dashboard.repository.MatchRepository;
import com.ipl.dashboard.repository.PlayerRepository;
import com.ipl.dashboard.repository.TeamRepository;
import com.ipl.dashboard.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository  matchRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository   teamRepository;
    private final VenueRepository  venueRepository;

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

    @Transactional(readOnly = true)
    public List<MatchDTO> getAllMatches() {
        return matchRepository.findAllByOrderByDateDescMatchNoDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MatchDTO getMatchById(Long id) {
        return matchRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Match not found: " + id));
    }

    public MatchDTO createMatch(MatchDTO dto) {
        if (dto.getTeam1CaptainId() == null) {
            Player def = resolveDefaultCaptain(dto.getTeam1());
            if (def != null) dto.setTeam1CaptainId(def.getId());
        }
        if (dto.getTeam2CaptainId() == null) {
            Player def = resolveDefaultCaptain(dto.getTeam2());
            if (def != null) dto.setTeam2CaptainId(def.getId());
        }
        Match saved = matchRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    public MatchDTO updateMatch(Long id, MatchDTO dto) {
        if (!matchRepository.existsById(id)) {
            throw new NoSuchElementException("Match not found: " + id);
        }
        if (dto.getTeam1CaptainId() == null) {
            Player def = resolveDefaultCaptain(dto.getTeam1());
            if (def != null) dto.setTeam1CaptainId(def.getId());
        }
        if (dto.getTeam2CaptainId() == null) {
            Player def = resolveDefaultCaptain(dto.getTeam2());
            if (def != null) dto.setTeam2CaptainId(def.getId());
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

    @Transactional(readOnly = true)
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

            if (m.isNoResult()) {
                s1.setNr(s1.getNr() + 1);
                s2.setNr(s2.getNr() + 1);
                s1.setPoints(s1.getPoints() + 1);
                s2.setPoints(s2.getPoints() + 1);
            } else if (t1.equals(m.getWinner())) {
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
                        .thenComparing(Comparator.comparingDouble(StatsDTO.TeamStanding::getNrr).reversed()))
                .collect(Collectors.toList());
    }

    private List<StatsDTO.BatterStat> computeTopBatters(List<Match> matches) {
        Map<Long, StatsDTO.BatterStat> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getTopScorer() != null)
               .forEach(m -> {
                   Player p = m.getTopScorer();
                   map.computeIfAbsent(p.getId(), id -> StatsDTO.BatterStat.builder()
                           .playerId(id).name(p.getName()).build());
                   StatsDTO.BatterStat s = map.get(p.getId());
                   s.setTotalRuns(s.getTotalRuns() + safe(m.getTopScorerRuns()));
                   s.setInnings(s.getInnings() + 1);
               });
        return map.values().stream()
                .sorted(Comparator.comparingInt(StatsDTO.BatterStat::getTotalRuns).reversed())
                .limit(10).collect(Collectors.toList());
    }

    private List<StatsDTO.BowlerStat> computeTopBowlers(List<Match> matches) {
        Map<Long, StatsDTO.BowlerStat> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getTopWicketTaker() != null)
               .forEach(m -> {
                   Player p = m.getTopWicketTaker();
                   map.computeIfAbsent(p.getId(), id -> StatsDTO.BowlerStat.builder()
                           .playerId(id).name(p.getName()).build());
                   StatsDTO.BowlerStat s = map.get(p.getId());
                   s.setTotalWickets(s.getTotalWickets() + safe(m.getTopWicketTakerWickets()));
                   s.setInnings(s.getInnings() + 1);
               });
        return map.values().stream()
                .sorted(Comparator.comparingInt(StatsDTO.BowlerStat::getTotalWickets).reversed())
                .limit(10).collect(Collectors.toList());
    }

    private List<StatsDTO.MomStat> computeMom(List<Match> matches) {
        Map<Long, StatsDTO.MomStat> map = new LinkedHashMap<>();
        matches.stream()
               .filter(m -> m.getPlayerOfMatch() != null)
               .forEach(m -> {
                   Player p = m.getPlayerOfMatch();
                   map.computeIfAbsent(p.getId(), id -> StatsDTO.MomStat.builder()
                           .playerId(id).name(p.getName()).awards(0).build());
                   StatsDTO.MomStat s = map.get(p.getId());
                   s.setAwards(s.getAwards() + 1);
               });
        return map.entrySet().stream()
                .sorted(Map.Entry.<Long, StatsDTO.MomStat>comparingByValue(
                        Comparator.comparingInt(StatsDTO.MomStat::getAwards)).reversed())
                .limit(10)
                .map(Map.Entry::getValue)
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
        Venue v = m.getVenue();
        return MatchDTO.builder()
                .id(m.getId()).matchNo(m.getMatchNo()).date(m.getDate())
                .venueId(v != null ? v.getId() : null)
                .venueName(v != null ? v.getName() : null)
                .venueCity(v != null ? v.getCity() : null)
                .team1(m.getTeam1()).team2(m.getTeam2())
                .team1Score(m.getTeam1Score()).team1Wickets(m.getTeam1Wickets()).team1Overs(m.getTeam1Overs())
                .team2Score(m.getTeam2Score()).team2Wickets(m.getTeam2Wickets()).team2Overs(m.getTeam2Overs())
                .tossWinner(m.getTossWinner()).tossDecision(m.getTossDecision())
                .noResult(m.isNoResult()).winner(m.getWinner()).winMargin(m.getWinMargin()).winType(m.getWinType())
                .playerOfMatchId(m.getPlayerOfMatch() != null ? m.getPlayerOfMatch().getId() : null)
                .playerOfMatchName(m.getPlayerOfMatch() != null ? m.getPlayerOfMatch().getName() : null)
                .topScorerId(m.getTopScorer() != null ? m.getTopScorer().getId() : null)
                .topScorerName(m.getTopScorer() != null ? m.getTopScorer().getName() : null)
                .topScorerRuns(m.getTopScorerRuns())
                .topWicketTakerId(m.getTopWicketTaker() != null ? m.getTopWicketTaker().getId() : null)
                .topWicketTakerName(m.getTopWicketTaker() != null ? m.getTopWicketTaker().getName() : null)
                .topWicketTakerWickets(m.getTopWicketTakerWickets())
                .team1CaptainId(m.getTeam1Captain() != null ? m.getTeam1Captain().getId() : null)
                .team1CaptainName(m.getTeam1Captain() != null ? m.getTeam1Captain().getName() : null)
                .team2CaptainId(m.getTeam2Captain() != null ? m.getTeam2Captain().getId() : null)
                .team2CaptainName(m.getTeam2Captain() != null ? m.getTeam2Captain().getName() : null)
                .build();
    }

    private Match toEntity(MatchDTO dto) {
        Player mom          = resolvePlayer(dto.getPlayerOfMatchId());
        Player topScorer    = resolvePlayer(dto.getTopScorerId());
        Player topWktTaker  = resolvePlayer(dto.getTopWicketTakerId());
        Player team1Captain = resolvePlayer(dto.getTeam1CaptainId());
        Player team2Captain = resolvePlayer(dto.getTeam2CaptainId());
        Venue  venue        = dto.getVenueId() != null
                                ? venueRepository.findById(dto.getVenueId()).orElse(null)
                                : null;

        return Match.builder()
                .matchNo(dto.getMatchNo()).date(dto.getDate()).venue(venue)
                .team1(dto.getTeam1()).team2(dto.getTeam2())
                .team1Score(dto.getTeam1Score()).team1Wickets(dto.getTeam1Wickets()).team1Overs(dto.getTeam1Overs())
                .team2Score(dto.getTeam2Score()).team2Wickets(dto.getTeam2Wickets()).team2Overs(dto.getTeam2Overs())
                .tossWinner(dto.getTossWinner()).tossDecision(dto.getTossDecision())
                .noResult(dto.isNoResult()).winner(dto.getWinner()).winMargin(dto.getWinMargin()).winType(dto.getWinType())
                .playerOfMatch(mom)
                .topScorer(topScorer).topScorerRuns(dto.getTopScorerRuns())
                .topWicketTaker(topWktTaker).topWicketTakerWickets(dto.getTopWicketTakerWickets())
                .team1Captain(team1Captain)
                .team2Captain(team2Captain)
                .build();
    }

    private Player resolvePlayer(Long id) {
        if (id == null) return null;
        return playerRepository.findById(id).orElse(null);
    }

    private Player resolveDefaultCaptain(String teamId) {
        return teamRepository.findById(teamId)
                .map(Team::getCaptain)
                .orElse(null);
    }
}
