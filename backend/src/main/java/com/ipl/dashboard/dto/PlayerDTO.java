package com.ipl.dashboard.dto;

import com.ipl.dashboard.model.Player;
import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PlayerDTO {

    // ── Create / Update player ─────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank private String name;
        @NotBlank private String teamId;
        @NotNull  private Player.Role role;
    }

    // ── Player list item ───────────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private Long        id;
        private String      name;
        private String      teamId;
        private Player.Role role;
        private String      profilePictureUrl;
    }

    // ── Full player profile (career stats + match history) ─────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Profile {
        private Long        id;
        private String      name;
        private String      teamId;
        private Player.Role role;
        private String      profilePictureUrl;

        // Career batting
        private int    matches;
        private int    totalRuns;
        private int    highScore;
        private int    totalBalls;
        private int    totalFours;
        private int    totalSixes;
        private Double battingAverage;   // runs / (innings - notOuts)
        private Double strikeRate;       // runs / balls * 100

        // Career bowling
        private int    totalWickets;
        private int    totalRunsConceded;
        private Double totalOversBowled;
        private Double bowlingAverage;   // runsConceded / wickets
        private Double economy;          // runsConceded / overs

        // Career fielding
        private int totalCatches;
        private int totalRunOuts;

        // Match-by-match log
        private List<MatchLog> matchLog;
    }

    // ── Single match entry in a player's history ───────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MatchLog {
        private Long    matchId;
        private Integer matchNo;
        private String  date;
        private String  opponent;

        // Batting
        private Integer runs;
        private Integer balls;
        private Integer fours;
        private Integer sixes;
        private String  dismissal;
        private Double  strikeRate;

        // Bowling
        private Double  oversBowled;
        private Integer wickets;
        private Integer runsConceded;
        private Double  economy;

        // Fielding
        private Integer catches;
        private Integer runOuts;
    }

    // ── Scorecard entry (submitted per match) ──────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatEntry {
        @NotNull private Long playerId;

        // Batting (all optional — may not have batted)
        private Integer runs;
        private Integer balls;
        private Integer fours;
        private Integer sixes;
        private String  dismissal;

        // Bowling (all optional — may not have bowled)
        private Double  oversBowled;
        private Integer wickets;
        private Integer runsConceded;

        // Fielding
        private Integer catches;
        private Integer runOuts;
    }

    // ── Scorecard response (per match) ────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ScorecardEntry {
        private Long        statsId;
        private Long        playerId;
        private String      playerName;
        private String      teamId;
        private Player.Role role;

        // Batting
        private Integer runs;
        private Integer balls;
        private Integer fours;
        private Integer sixes;
        private String  dismissal;
        private Double  strikeRate;

        // Bowling
        private Double  oversBowled;
        private Integer wickets;
        private Integer runsConceded;
        private Double  economy;

        // Fielding
        private Integer catches;
        private Integer runOuts;
    }
}