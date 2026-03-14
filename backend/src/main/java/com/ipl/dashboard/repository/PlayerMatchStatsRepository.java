package com.ipl.dashboard.repository;

import com.ipl.dashboard.model.PlayerMatchStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchStatsRepository extends JpaRepository<PlayerMatchStats, Long> {

    @Query("SELECT s FROM PlayerMatchStats s WHERE s.player.id = :playerId ORDER BY s.match.date DESC")
    List<PlayerMatchStats> findByPlayerId(@Param("playerId") Long playerId);

    // All stats for one match (for scorecard view)
    List<PlayerMatchStats> findByMatchId(Long matchId);

    // Delete all stats for a match (scorecard wipe)
    void deleteByMatchId(Long matchId);

    // Exists check (to prevent duplicate entry per player per match)
    Optional<PlayerMatchStats> findByPlayerIdAndMatchId(Long playerId, Long matchId);

    // Top run-scorers across all matches
    @Query("""
        SELECT p.name, p.teamId, SUM(s.runs) as totalRuns,
               COUNT(s.id) as innings,
               MAX(s.runs) as highScore,
               SUM(s.fours) as totalFours,
               SUM(s.sixes) as totalSixes
        FROM PlayerMatchStats s
        JOIN s.player p
        WHERE s.runs IS NOT NULL
        GROUP BY p.id, p.name, p.teamId
        ORDER BY totalRuns DESC
        """)
    List<Object[]> findTopBatters();

    // Top wicket-takers across all matches
    @Query("""
        SELECT p.name, p.teamId, SUM(s.wickets) as totalWickets,
               COUNT(s.id) as innings,
               SUM(s.runsConceded) as totalRunsConceded,
               SUM(s.oversBowled) as totalOvers
        FROM PlayerMatchStats s
        JOIN s.player p
        WHERE s.wickets IS NOT NULL
        GROUP BY p.id, p.name, p.teamId
        ORDER BY totalWickets DESC
        """)
    List<Object[]> findTopBowlers();

    // Career aggregates for a single player
    @Query("""
        SELECT
            COUNT(s.id),
            COALESCE(SUM(s.runs), 0),
            COALESCE(MAX(s.runs), 0),
            COALESCE(SUM(s.balls), 0),
            COALESCE(SUM(s.fours), 0),
            COALESCE(SUM(s.sixes), 0),
            COALESCE(SUM(s.wickets), 0),
            COALESCE(SUM(s.runsConceded), 0),
            COALESCE(SUM(s.oversBowled), 0.0),
            COALESCE(SUM(s.catches), 0),
            COALESCE(SUM(s.runOuts), 0)
        FROM PlayerMatchStats s
        WHERE s.player.id = :playerId
        """)
    List<Object[]> findCareerAggregates(@Param("playerId") Long playerId);
}