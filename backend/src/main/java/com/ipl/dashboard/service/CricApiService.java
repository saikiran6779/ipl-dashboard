package com.ipl.dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipl.dashboard.dto.ScrapedMatchDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class CricApiService {

    @Value("${cricapi.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final Map<String, String> TEAM_MAP = Map.ofEntries(
        Map.entry("Mumbai Indians", "MI"),
        Map.entry("Chennai Super Kings", "CSK"),
        Map.entry("Royal Challengers Bengaluru", "RCB"),
        Map.entry("Royal Challengers Bangalore", "RCB"),
        Map.entry("Kolkata Knight Riders", "KKR"),
        Map.entry("Delhi Capitals", "DC"),
        Map.entry("Punjab Kings", "PBKS"),
        Map.entry("Rajasthan Royals", "RR"),
        Map.entry("Sunrisers Hyderabad", "SRH"),
        Map.entry("Gujarat Titans", "GT"),
        Map.entry("Lucknow Super Giants", "LSG")
    );

    /**
     * Search for IPL matches and return a list of matches with id + name + date
     * Uses GET https://api.cricapi.com/v1/matches?apikey=KEY&offset=0
     */
    public List<Map<String, Object>> searchMatches(String query) {
        try {
            String url = "https://api.cricapi.com/v1/matches?apikey=" + apiKey + "&offset=0"
                + (query != null && !query.isBlank()
                    ? "&search=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8)
                    : "");
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);
            JsonNode data = root.get("data");
            List<Map<String, Object>> results = new ArrayList<>();
            if (data != null && data.isArray()) {
                for (JsonNode match : data) {
                    String name   = match.path("name").asText("");
                    String id     = match.path("id").asText("");
                    String date   = match.path("date").asText("");
                    String status = match.path("status").asText("");
                    if (!id.isBlank()) {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("id", id);
                        m.put("name", name);
                        m.put("date", date);
                        m.put("status", status);
                        results.add(m);
                    }
                }
            }
            return results;
        } catch (Exception e) {
            log.error("CricAPI search failed: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Fetch full match info by CricAPI match ID
     * Uses GET https://api.cricapi.com/v1/match_info?apikey=KEY&id=MATCH_ID
     */
    public ScrapedMatchDTO fetchMatchById(String matchId) {
        List<String> warnings = new ArrayList<>();
        ScrapedMatchDTO.ScrapedMatchDTOBuilder dto = ScrapedMatchDTO.builder().warnings(warnings);
        try {
            String url = "https://api.cricapi.com/v1/match_info?apikey=" + apiKey + "&id=" + matchId;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);
            JsonNode data = root.get("data");
            if (data == null) {
                warnings.add("No data returned from CricAPI for match ID: " + matchId);
                return dto.build();
            }

            // --- Teams ---
            JsonNode teamInfo = data.get("teamInfo");
            String team1Name = "", team2Name = "";
            if (teamInfo != null && teamInfo.isArray() && teamInfo.size() >= 2) {
                team1Name = teamInfo.get(0).path("name").asText("");
                team2Name = teamInfo.get(1).path("name").asText("");
            } else {
                // fallback: parse from name field "TeamA vs TeamB, Nth Match"
                String name = data.path("name").asText("");
                if (name.contains(" vs ")) {
                    String[] parts = name.split(" vs ");
                    team1Name = parts[0].trim();
                    team2Name = parts[1].split(",")[0].trim();
                }
            }
            String team1Id = mapTeam(team1Name, warnings);
            String team2Id = mapTeam(team2Name, warnings);
            dto.team1(team1Id).team2(team2Id);

            // --- Date ---
            String date = data.path("date").asText("");
            if (!date.isBlank()) {
                dto.date(normaliseDate(date, warnings));
            } else {
                warnings.add("Match date not available");
            }

            // --- Venue ---
            String venue = data.path("venue").asText("");
            if (!venue.isBlank()) dto.venue(venue);
            else warnings.add("Venue not available");

            // --- Scores from score array ---
            JsonNode scores = data.get("score");
            if (scores != null && scores.isArray()) {
                for (int i = 0; i < scores.size(); i++) {
                    JsonNode s = scores.get(i);
                    String inningsTeam = s.path("inning").asText("");
                    int r    = s.path("r").asInt(0);
                    int w    = s.path("w").asInt(0);
                    double o = s.path("o").asDouble(0);

                    boolean isTeam1 = inningsTeam.contains(team1Name) ||
                                      (team1Id != null && inningsTeam.contains(team1Id));
                    boolean isTeam2 = inningsTeam.contains(team2Name) ||
                                      (team2Id != null && inningsTeam.contains(team2Id));

                    if (isTeam1 || (i == 0 && !isTeam2)) {
                        dto.team1Score(r).team1Wickets(w).team1Overs(o);
                    } else {
                        dto.team2Score(r).team2Wickets(w).team2Overs(o);
                    }
                }
            } else {
                warnings.add("Score details not available");
            }

            // --- Result / winner ---
            String status = data.path("status").asText("");

            if (status.equalsIgnoreCase("No Result") || status.contains("abandoned")) {
                dto.noResult(true);
            } else if (status.contains("won")) {
                dto.noResult(false);
                parseResult(status, team1Id, team2Id, team1Name, team2Name, dto, warnings);
            } else {
                warnings.add("Match result could not be determined from: " + status);
            }

            // --- Toss ---
            String tossWinner = data.path("tossWinner").asText("");
            String tossChoice = data.path("tossChoice").asText("");
            if (!tossWinner.isBlank()) {
                String tossId = mapTeam(tossWinner, new ArrayList<>());
                dto.tossWinner(tossId != null ? tossId : tossWinner);
                dto.tossDecision(tossChoice.toLowerCase().contains("bat") ? "bat" :
                                 tossChoice.toLowerCase().contains("field") ? "field" : tossChoice);
            } else {
                warnings.add("Toss information not available");
            }

            // --- Player of the Match ---
            String momName = data.path("player_of_match").asText("");
            JsonNode mom = data.get("matchWinner");
            if (momName.isBlank() && mom != null) momName = mom.asText("");
            if (!momName.isBlank()) {
                dto.playerOfMatchName(momName);
            } else {
                JsonNode awards = data.get("matchAwards");
                if (awards != null && awards.isArray() && awards.size() > 0) {
                    dto.playerOfMatchName(awards.get(0).path("name").asText(""));
                } else {
                    warnings.add("Player of the Match not available — fill manually");
                }
            }

            // --- Top scorer / wicket taker from scorecard ---
            fetchScorecardDetails(matchId, dto, warnings);

        } catch (Exception e) {
            log.error("CricAPI fetchMatchById failed: {}", e.getMessage(), e);
            warnings.add("API error: " + e.getMessage());
        }
        return dto.warnings(warnings).build();
    }

    /**
     * Fetch scorecard details to extract top scorer and top wicket taker
     */
    private void fetchScorecardDetails(String matchId,
                                        ScrapedMatchDTO.ScrapedMatchDTOBuilder dto,
                                        List<String> warnings) {
        try {
            String url = "https://api.cricapi.com/v1/match_scorecard?apikey=" + apiKey + "&id=" + matchId;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);
            JsonNode data = root.get("data");
            if (data == null) {
                warnings.add("Scorecard not available — top scorer/wicket taker must be filled manually");
                return;
            }
            JsonNode scorecard = data.get("scorecard");
            if (scorecard == null || !scorecard.isArray()) {
                warnings.add("Detailed scorecard not available");
                return;
            }

            String topBatterName  = null;
            int    topBatterRuns  = -1;
            String topBowlerName  = null;
            int    topBowlerWickets = -1;

            for (JsonNode innings : scorecard) {
                // Batting
                JsonNode batting = innings.get("batting");
                if (batting != null && batting.isArray()) {
                    for (JsonNode batter : batting) {
                        int r    = batter.path("r").asInt(0);
                        String name = batter.path("batsman").path("name").asText(
                                      batter.path("name").asText(""));
                        if (r > topBatterRuns && !name.isBlank()) {
                            topBatterRuns = r;
                            topBatterName = name;
                        }
                    }
                }
                // Bowling
                JsonNode bowling = innings.get("bowling");
                if (bowling != null && bowling.isArray()) {
                    for (JsonNode bowler : bowling) {
                        int w    = bowler.path("w").asInt(0);
                        String name = bowler.path("bowler").path("name").asText(
                                      bowler.path("name").asText(""));
                        if (w > topBowlerWickets && !name.isBlank()) {
                            topBowlerWickets = w;
                            topBowlerName = name;
                        }
                    }
                }
            }

            if (topBatterName != null) { dto.topScorerName(topBatterName).topScorerRuns(topBatterRuns); }
            else warnings.add("Top scorer not available from scorecard");

            if (topBowlerName != null) { dto.topWicketTakerName(topBowlerName).topWicketTakerWickets(topBowlerWickets); }
            else warnings.add("Top wicket taker not available from scorecard");

        } catch (Exception e) {
            log.warn("Scorecard fetch failed: {}", e.getMessage());
            warnings.add("Could not fetch scorecard details: " + e.getMessage());
        }
    }

    private String mapTeam(String name, List<String> warnings) {
        if (name == null || name.isBlank()) return null;
        for (Map.Entry<String, String> e : TEAM_MAP.entrySet()) {
            if (name.toLowerCase().contains(e.getKey().toLowerCase()) ||
                e.getKey().toLowerCase().contains(name.toLowerCase())) {
                return e.getValue();
            }
        }
        warnings.add("Unknown team name: '" + name + "' — please select manually");
        return null;
    }

    private String normaliseDate(String raw, List<String> warnings) {
        try {
            if (raw.matches("\\d{4}-\\d{2}-\\d{2}")) return raw;
            if (raw.matches("\\d{2}/\\d{2}/\\d{4}")) {
                String[] p = raw.split("/");
                return p[2] + "-" + p[1] + "-" + p[0];
            }
            return raw.substring(0, 10);
        } catch (Exception e) {
            warnings.add("Could not parse date: " + raw);
            return null;
        }
    }

    private void parseResult(String status, String t1Id, String t2Id,
                              String t1Name, String t2Name,
                              ScrapedMatchDTO.ScrapedMatchDTOBuilder dto,
                              List<String> warnings) {
        try {
            String lower = status.toLowerCase();

            // Determine winner
            String winnerId = null;
            if (t1Id != null && (status.contains(t1Name) || status.contains(t1Id))) {
                winnerId = t1Id;
            } else if (t2Id != null && (status.contains(t2Name) || status.contains(t2Id))) {
                winnerId = t2Id;
            }
            if (winnerId != null) dto.winner(winnerId);
            else warnings.add("Could not determine winner from: " + status);

            // Win type and margin
            if (lower.contains("wicket")) {
                dto.winType("wickets");
                String[] parts = status.split("by ");
                if (parts.length > 1) {
                    dto.winMargin(parts[1].replaceAll("[^0-9]", "").trim());
                }
            } else if (lower.contains("run")) {
                dto.winType("runs");
                String[] parts = status.split("by ");
                if (parts.length > 1) {
                    dto.winMargin(parts[1].replaceAll("[^0-9]", "").trim());
                }
            } else {
                warnings.add("Could not parse win type/margin from: " + status);
            }
        } catch (Exception e) {
            warnings.add("Result parsing error: " + e.getMessage());
        }
    }
}
