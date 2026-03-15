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

    private Long   venueId;
    private String venueName;
    private String venueCity;

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

    private boolean noResult;
    private String winner;
    private String winMargin;
    private String winType;

    private Long    playerOfMatchId;
    private String  playerOfMatchName;

    private Long    topScorerId;
    private String  topScorerName;
    private Integer topScorerRuns;

    private Long    topWicketTakerId;
    private String  topWicketTakerName;
    private Integer topWicketTakerWickets;

    private Long   team1CaptainId;
    private String team1CaptainName;
    private Long   team2CaptainId;
    private String team2CaptainName;
}
