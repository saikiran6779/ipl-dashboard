package com.ipl.dashboard.dto;

import lombok.*;
import java.util.List;

public class StatsDTO {

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class TeamStanding {
        private String teamId;
        private String teamName;
        private int played;
        private int won;
        private int lost;
        private int points;
        private double nrr;
        private int runsFor;
        private int ballsFor;
        private int runsAgainst;
        private int ballsAgainst;
    }

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class BatterStat {
        private String name;
        private int totalRuns;
        private int innings;
    }

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class BowlerStat {
        private String name;
        private int totalWickets;
        private int innings;
    }

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class MomStat {
        private String name;
        private int awards;
    }

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class Summary {
        private int totalMatches;
        private int totalRuns;
        private int highestScore;
        private int teamsActive;
        private List<TeamStanding> standings;
        private List<BatterStat> topBatters;
        private List<BowlerStat> topBowlers;
        private List<MomStat> topMom;
    }
}
