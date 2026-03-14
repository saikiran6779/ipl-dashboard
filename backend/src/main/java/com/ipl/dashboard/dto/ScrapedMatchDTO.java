package com.ipl.dashboard.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScrapedMatchDTO {
    private String date;
    private Integer matchNo;
    private String venue;
    private String team1;
    private String team2;
    private Integer team1Score;
    private Integer team1Wickets;
    private Double  team1Overs;
    private Integer team2Score;
    private Integer team2Wickets;
    private Double  team2Overs;
    private String tossWinner;
    private String tossDecision;
    private String winner;
    private String winMargin;
    private String winType;
    private boolean noResult;
    private String playerOfMatchName;
    private String topScorerName;
    private Integer topScorerRuns;
    private String topWicketTakerName;
    private Integer topWicketTakerWickets;
    private List<String> warnings;
}
