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
        private String profilePictureUrl;
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
        private Double battingAverage;
        private Double strikeRate;

        // Career bowling
        private int    totalWickets;
        private int    totalRunsConceded;
        private Double totalOversBowled;
        private Double bowlingAverage;
        private Double economy;

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

        // Batting
        private Integer battingPosition;
        private Integer runs;
        private Integer balls;
        private Integer fours;
        private Integer sixes;
        private String  dismissal;
        private Long    dismissedById;   // bowler FK
        private Long    caughtById;      // fielder FK

        // Batting phase splits
        private Integer ppRuns;
        private Integer ppBalls;
        private Integer midRuns;
        private Integer midBalls;
        private Integer deathRuns;
        private Integer deathBalls;

        // Bowling
        private Double  oversBowled;
        private Integer wickets;
        private Integer runsConceded;
        private Integer wides;
        private Integer noBalls;
        private Integer maidens;
        private Integer dotBalls;

        // Bowling phase splits
        private Integer ppRunsConceded;
        private Integer ppBallsBowled;
        private Integer midRunsConceded;
        private Integer midBallsBowled;
        private Integer deathRunsConceded;
        private Integer deathBallsBowled;

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
        private Integer battingPosition;
        private Integer runs;
        private Integer balls;
        private Integer fours;
        private Integer sixes;
        private String  dismissal;
        private Long    dismissedById;
        private String  dismissedByName;
        private Long    caughtById;
        private String  caughtByName;
        private Double  strikeRate;

        // Batting phase splits
        private Integer ppRuns;
        private Integer ppBalls;
        private Double  ppStrikeRate;
        private Integer midRuns;
        private Integer midBalls;
        private Double  midStrikeRate;
        private Integer deathRuns;
        private Integer deathBalls;
        private Double  deathStrikeRate;

        // Bowling
        private Double  oversBowled;
        private Integer wickets;
        private Integer runsConceded;
        private Integer wides;
        private Integer noBalls;
        private Integer maidens;
        private Integer dotBalls;
        private Double  economy;

        // Bowling phase splits
        private Integer ppRunsConceded;
        private Integer ppBallsBowled;
        private Double  ppEconomy;
        private Integer midRunsConceded;
        private Integer midBallsBowled;
        private Double  midEconomy;
        private Integer deathRunsConceded;
        private Integer deathBallsBowled;
        private Double  deathEconomy;

        // Fielding
        private Integer catches;
        private Integer runOuts;
    }
}
