package com.ipl.dashboard.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_match_stats",
       uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "match_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerMatchStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Relationships ──────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    // The team this player represented in this match
    private String teamId;

    // ── Batting ────────────────────────────────────────────────────────────
    private Integer battingPosition;  // order in batting lineup (1-11)
    private Integer runs;
    private Integer balls;
    private Integer fours;
    private Integer sixes;
    private String  dismissal;        // "bowled", "caught", "not out", "run out" …

    // Dismissal detail — nullable FKs to Player
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dismissed_by_id")
    private Player dismissedBy;       // bowler responsible for the wicket

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caught_by_id")
    private Player caughtBy;          // fielder (catcher / run-out executor)

    // Batting phase splits (runs + balls faced per phase)
    private Integer ppRuns;           // powerplay (overs 1-6)
    private Integer ppBalls;
    private Integer midRuns;          // middle (overs 7-15)
    private Integer midBalls;
    private Integer deathRuns;        // death (overs 16-20)
    private Integer deathBalls;

    // ── Bowling ────────────────────────────────────────────────────────────
    private Double  oversBowled;
    private Integer wickets;
    private Integer runsConceded;
    private Integer wides;
    private Integer noBalls;
    private Integer maidens;
    private Integer dotBalls;

    // Bowling phase splits (runs conceded + legal balls bowled per phase)
    private Integer ppRunsConceded;
    private Integer ppBallsBowled;
    private Integer midRunsConceded;
    private Integer midBallsBowled;
    private Integer deathRunsConceded;
    private Integer deathBallsBowled;

    // ── Fielding ───────────────────────────────────────────────────────────
    private Integer catches;
    private Integer runOuts;

    // ── Computed helpers ───────────────────────────────────────────────────
    @Transient
    public Double getStrikeRate() {
        if (balls == null || balls == 0) return null;
        return Math.round((runs * 100.0 / balls) * 100.0) / 100.0;
    }

    @Transient
    public Double getEconomy() {
        if (oversBowled == null || oversBowled == 0) return null;
        return Math.round(((runsConceded == null ? 0 : runsConceded) / oversBowled) * 100.0) / 100.0;
    }

    @Transient
    public Double getPpStrikeRate() {
        if (ppBalls == null || ppBalls == 0) return null;
        return Math.round(((ppRuns == null ? 0 : ppRuns) * 100.0 / ppBalls) * 100.0) / 100.0;
    }

    @Transient
    public Double getMidStrikeRate() {
        if (midBalls == null || midBalls == 0) return null;
        return Math.round(((midRuns == null ? 0 : midRuns) * 100.0 / midBalls) * 100.0) / 100.0;
    }

    @Transient
    public Double getDeathStrikeRate() {
        if (deathBalls == null || deathBalls == 0) return null;
        return Math.round(((deathRuns == null ? 0 : deathRuns) * 100.0 / deathBalls) * 100.0) / 100.0;
    }

    @Transient
    public Double getPpEconomy() {
        if (ppBallsBowled == null || ppBallsBowled == 0) return null;
        double overs = ppBallsBowled / 6.0;
        return Math.round(((ppRunsConceded == null ? 0 : ppRunsConceded) / overs) * 100.0) / 100.0;
    }

    @Transient
    public Double getMidEconomy() {
        if (midBallsBowled == null || midBallsBowled == 0) return null;
        double overs = midBallsBowled / 6.0;
        return Math.round(((midRunsConceded == null ? 0 : midRunsConceded) / overs) * 100.0) / 100.0;
    }

    @Transient
    public Double getDeathEconomy() {
        if (deathBallsBowled == null || deathBallsBowled == 0) return null;
        double overs = deathBallsBowled / 6.0;
        return Math.round(((deathRunsConceded == null ? 0 : deathRunsConceded) / overs) * 100.0) / 100.0;
    }
}
