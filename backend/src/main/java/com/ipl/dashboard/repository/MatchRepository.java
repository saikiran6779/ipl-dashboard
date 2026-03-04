package com.ipl.dashboard.repository;

import com.ipl.dashboard.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findAllByOrderByDateDescMatchNoDesc();

    @Query("SELECT DISTINCT m.team1 FROM Match m UNION SELECT DISTINCT m.team2 FROM Match m")
    List<String> findAllTeams();

    @Query("SELECT m FROM Match m WHERE m.topScorer IS NOT NULL AND m.topScorer != ''")
    List<Match> findMatchesWithBattingData();

    @Query("SELECT m FROM Match m WHERE m.topWicketTaker IS NOT NULL AND m.topWicketTaker != ''")
    List<Match> findMatchesWithBowlingData();

    @Query("SELECT m FROM Match m WHERE m.playerOfMatch IS NOT NULL AND m.playerOfMatch != ''")
    List<Match> findMatchesWithMom();
}
