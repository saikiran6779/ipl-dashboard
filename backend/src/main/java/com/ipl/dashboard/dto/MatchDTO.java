package com.ipl.dashboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDTO {

    private Long id;
    private Integer matchNo;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String venue;

    @NotBlank(message = "Team 1 is required")
    private String team1;

    @NotBlank(message = "Team 2 is required")
    private String team2;

    private Integer team1Score;
    private Integer team1Wickets;
    private Double team1Overs;

    private Integer team2Score;
    private Integer team2Wickets;
    private Double team2Overs;

    private String tossWinner;
    private String tossDecision;

    @NotBlank(message = "Winner is required")
    private String winner;

    private String winMargin;
    private String winType;

    private String playerOfMatch;
    private String topScorer;
    private Integer topScorerRuns;
    private String topWicketTaker;
    private Integer topWicketTakerWickets;
}
