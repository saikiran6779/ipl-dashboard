package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.PlayerDTO;
import com.ipl.dashboard.model.Match;
import com.ipl.dashboard.model.Player;
import com.ipl.dashboard.model.PlayerMatchStats;
import com.ipl.dashboard.repository.MatchRepository;
import com.ipl.dashboard.repository.PlayerMatchStatsRepository;
import com.ipl.dashboard.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository            playerRepo;
    private final PlayerMatchStatsRepository  statsRepo;
    private final MatchRepository             matchRepo;

    // ── Player CRUD ───────────────────────────────────────────────────────

    public List<PlayerDTO.Summary> getAllPlayers() {
        return playerRepo.findAllByOrderByTeamIdAscNameAsc()
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    public List<PlayerDTO.Summary> getSquad(String teamId) {
        return playerRepo.findByTeamIdOrderByNameAsc(teamId)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    public PlayerDTO.Summary createPlayer(PlayerDTO.Request req) {
        if (playerRepo.existsByNameAndTeamId(req.getName(), req.getTeamId())) {
            throw new IllegalArgumentException(
                req.getName() + " already exists in team " + req.getTeamId());
        }
        Player saved = playerRepo.save(Player.builder()
                .name(req.getName())
                .teamId(req.getTeamId())
                .role(req.getRole())
                .build());
        return toSummary(saved);
    }

    public PlayerDTO.Summary updatePlayer(Long id, PlayerDTO.Request req) {
        Player p = playerRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Player not found: " + id));
        p.setName(req.getName());
        p.setTeamId(req.getTeamId());
        p.setRole(req.getRole());
        return toSummary(playerRepo.save(p));
    }

    public void deletePlayer(Long id) {
        if (!playerRepo.existsById(id)) {
            throw new NoSuchElementException("Player not found: " + id);
        }
        playerRepo.deleteById(id);
    }

    // ── Player Profile (career stats + match log) ─────────────────────────
    @Transactional(readOnly = true)
    public PlayerDTO.Profile getProfile(Long playerId) {
        Player p = playerRepo.findById(playerId)
                .orElseThrow(() -> new NoSuchElementException("Player not found: " + playerId));

        Object[] agg = statsRepo.findCareerAggregates(playerId);

        if (agg == null || agg[0] == null) {
            return PlayerDTO.Profile.builder()
                    .id(p.getId()).name(p.getName())
                    .teamId(p.getTeamId()).role(p.getRole())
                    .matches(0).matchLog(List.of())
                    .build();
        }

        List<PlayerMatchStats> logs = statsRepo.findByPlayerId(playerId);

        int matches          = toInt(agg[0]);
        int totalRuns        = toInt(agg[1]);
        int highScore        = toInt(agg[2]);
        int totalBalls       = toInt(agg[3]);
        int totalFours       = toInt(agg[4]);
        int totalSixes       = toInt(agg[5]);
        int totalWickets     = toInt(agg[6]);
        int totalRunsConceded= toInt(agg[7]);
        double totalOvers    = toDouble(agg[8]);
        int totalCatches     = toInt(agg[9]);
        int totalRunOuts     = toInt(agg[10]);

        // Count not-outs for batting average
        long notOuts = logs.stream()
                .filter(s -> "not out".equalsIgnoreCase(s.getDismissal()))
                .count();
        int dismissals = matches - (int) notOuts;

        Double battingAvg = dismissals > 0
                ? round2((double) totalRuns / dismissals) : null;
        Double sr = totalBalls > 0
                ? round2(totalRuns * 100.0 / totalBalls) : null;
        Double bowlingAvg = totalWickets > 0
                ? round2((double) totalRunsConceded / totalWickets) : null;
        Double eco = totalOvers > 0
                ? round2(totalRunsConceded / totalOvers) : null;

        List<PlayerDTO.MatchLog> matchLog = logs.stream()
                .map(s -> toMatchLog(s, p))
                .collect(Collectors.toList());

        return PlayerDTO.Profile.builder()
                .id(p.getId()).name(p.getName()).teamId(p.getTeamId()).role(p.getRole())
                .matches(matches)
                .totalRuns(totalRuns).highScore(highScore)
                .totalBalls(totalBalls).totalFours(totalFours).totalSixes(totalSixes)
                .battingAverage(battingAvg).strikeRate(sr)
                .totalWickets(totalWickets).totalRunsConceded(totalRunsConceded)
                .totalOversBowled(totalOvers > 0 ? totalOvers : null)
                .bowlingAverage(bowlingAvg).economy(eco)
                .totalCatches(totalCatches).totalRunOuts(totalRunOuts)
                .matchLog(matchLog)
                .build();
    }

    // ── Scorecard ─────────────────────────────────────────────────────────

    @Transactional
    public List<PlayerDTO.ScorecardEntry> saveScorecard(Long matchId,
                                                         List<PlayerDTO.StatEntry> entries) {
        Match match = matchRepo.findById(matchId)
                .orElseThrow(() -> new NoSuchElementException("Match not found: " + matchId));

        List<PlayerDTO.ScorecardEntry> result = new ArrayList<>();

        for (PlayerDTO.StatEntry e : entries) {
            Player player = playerRepo.findById(e.getPlayerId())
                    .orElseThrow(() -> new NoSuchElementException("Player not found: " + e.getPlayerId()));

            // Upsert: update existing row if present
            PlayerMatchStats stats = statsRepo
                    .findByPlayerIdAndMatchId(e.getPlayerId(), matchId)
                    .orElseGet(PlayerMatchStats::new);

            stats.setPlayer(player);
            stats.setMatch(match);
            stats.setTeamId(player.getTeamId());
            stats.setRuns(e.getRuns());
            stats.setBalls(e.getBalls());
            stats.setFours(e.getFours());
            stats.setSixes(e.getSixes());
            stats.setDismissal(e.getDismissal());
            stats.setOversBowled(e.getOversBowled());
            stats.setWickets(e.getWickets());
            stats.setRunsConceded(e.getRunsConceded());
            stats.setCatches(e.getCatches());
            stats.setRunOuts(e.getRunOuts());

            PlayerMatchStats saved = statsRepo.save(stats);
            result.add(toScorecardEntry(saved));
        }
        return result;
    }

    public List<PlayerDTO.ScorecardEntry> getScorecard(Long matchId) {
        return statsRepo.findByMatchId(matchId).stream()
                .map(this::toScorecardEntry)
                .collect(Collectors.toList());
    }

    // ── Leaderboard helpers (used by MatchService stats) ──────────────────

    public List<Map<String, Object>> getTopBattersDetailed() {
        return statsRepo.findTopBatters().stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name",        row[0]);
            m.put("teamId",      row[1]);
            m.put("totalRuns",   toLong(row[2]));
            m.put("innings",     toLong(row[3]));
            m.put("highScore",   toLong(row[4]));
            m.put("totalFours",  toLong(row[5]));
            m.put("totalSixes",  toLong(row[6]));
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopBowlersDetailed() {
        return statsRepo.findTopBowlers().stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name",             row[0]);
            m.put("teamId",           row[1]);
            m.put("totalWickets",     toLong(row[2]));
            m.put("innings",          toLong(row[3]));
            m.put("totalRunsConceded",toLong(row[4]));
            double overs = toDouble(row[5]);
            m.put("totalOvers", overs);
            m.put("economy",    overs > 0 ? round2(toLong(row[4]) / overs) : null);
            return m;
        }).collect(Collectors.toList());
    }

    // ── Mappers ───────────────────────────────────────────────────────────

    private PlayerDTO.Summary toSummary(Player p) {
        return PlayerDTO.Summary.builder()
                .id(p.getId()).name(p.getName())
                .teamId(p.getTeamId()).role(p.getRole())
                .build();
    }

    private PlayerDTO.ScorecardEntry toScorecardEntry(PlayerMatchStats s) {
        return PlayerDTO.ScorecardEntry.builder()
                .statsId(s.getId())
                .playerId(s.getPlayer().getId())
                .playerName(s.getPlayer().getName())
                .teamId(s.getTeamId())
                .role(s.getPlayer().getRole())
                .runs(s.getRuns()).balls(s.getBalls())
                .fours(s.getFours()).sixes(s.getSixes())
                .dismissal(s.getDismissal())
                .strikeRate(s.getStrikeRate())
                .oversBowled(s.getOversBowled())
                .wickets(s.getWickets())
                .runsConceded(s.getRunsConceded())
                .economy(s.getEconomy())
                .catches(s.getCatches()).runOuts(s.getRunOuts())
                .build();
    }

    private PlayerDTO.MatchLog toMatchLog(PlayerMatchStats s, Player p) {
        Match m = s.getMatch();
        String opponent = m.getTeam1().equals(p.getTeamId()) ? m.getTeam2() : m.getTeam1();
        return PlayerDTO.MatchLog.builder()
                .matchId(m.getId()).matchNo(m.getMatchNo())
                .date(m.getDate() != null ? m.getDate().toString() : null)
                .opponent(opponent)
                .runs(s.getRuns()).balls(s.getBalls())
                .fours(s.getFours()).sixes(s.getSixes())
                .dismissal(s.getDismissal()).strikeRate(s.getStrikeRate())
                .oversBowled(s.getOversBowled())
                .wickets(s.getWickets()).runsConceded(s.getRunsConceded())
                .economy(s.getEconomy())
                .catches(s.getCatches()).runOuts(s.getRunOuts())
                .build();
    }

    // ── Utilities ─────────────────────────────────────────────────────────

    private int    toInt(Object v)    { return v == null ? 0 : ((Number) v).intValue(); }
    private long   toLong(Object v)   { return v == null ? 0 : ((Number) v).longValue(); }
    private double toDouble(Object v) { return v == null ? 0.0 : ((Number) v).doubleValue(); }
    private double round2(double v)   { return Math.round(v * 100.0) / 100.0; }
}