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

    // The team this player represented in this match (player may transfer, unlikely but safe)
    private String teamId;

    // ── Batting ────────────────────────────────────────────────────────────
    private Integer runs;
    private Integer balls;
    private Integer fours;
    private Integer sixes;
    private String  dismissal;   // "bowled", "caught", "not out", "run out" …

    // ── Bowling ────────────────────────────────────────────────────────────
    private Double  oversBowled;
    private Integer wickets;
    private Integer runsConceded;
    // economy is derived: runsConceded / oversBowled

    // ── Fielding ───────────────────────────────────────────────────────────
    private Integer catches;
    private Integer runOuts;

    // ── Computed helpers (not stored, kept for clarity) ────────────────────
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
}