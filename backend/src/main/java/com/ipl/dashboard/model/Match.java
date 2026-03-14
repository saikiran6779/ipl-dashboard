package com.ipl.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer matchNo;

    @NotNull
    private LocalDate date;

    private String venue;

    @NotBlank
    private String team1;

    @NotBlank
    private String team2;

    // Team 1 innings
    private Integer team1Score;
    private Integer team1Wickets;
    private Double team1Overs;

    // Team 2 innings
    private Integer team2Score;
    private Integer team2Wickets;
    private Double team2Overs;

    // Toss
    private String tossWinner;
    private String tossDecision; // "bat" or "field"

    // Result
    private boolean noResult; // true when match was abandoned / no result
    private String winner;
    private String winMargin;
    private String winType; // "runs" or "wickets"

    // Player highlights
    private String playerOfMatch;
    private String topScorer;
    private Integer topScorerRuns;
    private String topWicketTaker;
    private Integer topWicketTakerWickets;
}
