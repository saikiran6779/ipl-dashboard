package com.ipl.dashboard.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScrapedMatchDTO {
    // Match info
    private String date;        // "2025-03-22"
    private Integer matchNo;
    private String venue;
    private String team1;
    private String team2;
    // Scores
    private Integer team1Score;
    private Integer team1Wickets;
    private Double  team1Overs;
    private Integer team2Score;
    private Integer team2Wickets;
    private Double  team2Overs;
    // Toss
    private String tossWinner;
    private String tossDecision;
    // Result
    private String winner;
    private String winMargin;
    private String winType;     // "runs" or "wickets"
    private boolean noResult;
    // Player highlights — raw scraped names (not IDs)
    private String playerOfMatchName;
    private String topScorerName;
    private Integer topScorerRuns;
    private String topWicketTakerName;
    private Integer topWicketTakerWickets;
    // Warnings about missing/uncertain fields
    private List<String> warnings;
}
