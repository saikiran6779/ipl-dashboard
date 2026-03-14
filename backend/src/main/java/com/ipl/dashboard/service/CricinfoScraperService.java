package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.ScrapedMatchDTO;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class CricinfoScraperService {

    private static final Map<String, String> TEAM_MAP = new LinkedHashMap<>();

    static {
        TEAM_MAP.put("Mumbai Indians",                  "MI");
        TEAM_MAP.put("Chennai Super Kings",             "CSK");
        TEAM_MAP.put("Royal Challengers Bengaluru",     "RCB");
        TEAM_MAP.put("Royal Challengers Bangalore",     "RCB");
        TEAM_MAP.put("Kolkata Knight Riders",           "KKR");
        TEAM_MAP.put("Delhi Capitals",                  "DC");
        TEAM_MAP.put("Punjab Kings",                    "PBKS");
        TEAM_MAP.put("Rajasthan Royals",                "RR");
        TEAM_MAP.put("Sunrisers Hyderabad",             "SRH");
        TEAM_MAP.put("Gujarat Titans",                  "GT");
        TEAM_MAP.put("Lucknow Super Giants",            "LSG");
    }

    private static final String USER_AGENT =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36";

    public ScrapedMatchDTO scrapeMatch(String url) {
        List<String> warnings = new ArrayList<>();
        ScrapedMatchDTO.ScrapedMatchDTOBuilder builder = ScrapedMatchDTO.builder().warnings(warnings);

        try {
            Document doc = Jsoup.connect(url)
                .userAgent(USER_AGENT)
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .timeout(15_000)
                .get();

            parseTeams(doc, builder, warnings);
            parseScores(doc, builder, warnings);
            parseResult(doc, builder, warnings);
            parseToss(doc, builder, warnings);
            parseMatchInfo(doc, builder, warnings);
            parsePlayerOfMatch(doc, builder, warnings);
            parseTopScorer(doc, builder, warnings);
            parseTopWicketTaker(doc, builder, warnings);

        } catch (Exception e) {
            log.error("Error scraping Cricinfo URL: {}", url, e);
            warnings.add("Failed to fetch/parse page: " + e.getMessage());
        }

        return builder.build();
    }

    // ── Team parsing ──────────────────────────────────────────────────────────

    private void parseTeams(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            // Try innings headers first
            Elements inningsHeaders = doc.select(
                ".ds-text-tight-l.ds-font-bold, " +
                "[class*='innings-header'], " +
                ".cb-col.cb-col-100.cb-ltst-wgt-hdr"
            );

            List<String> foundTeams = new ArrayList<>();
            for (Element el : inningsHeaders) {
                String text = el.text().trim();
                String teamId = matchTeamName(text);
                if (teamId != null && !foundTeams.contains(teamId)) {
                    foundTeams.add(teamId);
                    if (foundTeams.size() == 2) break;
                }
            }

            // Fallback: title tag
            if (foundTeams.size() < 2) {
                String title = doc.title();
                for (Map.Entry<String, String> entry : TEAM_MAP.entrySet()) {
                    if (title.contains(entry.getKey())) {
                        String id = entry.getValue();
                        if (!foundTeams.contains(id)) {
                            foundTeams.add(id);
                        }
                        if (foundTeams.size() == 2) break;
                    }
                }
            }

            // Fallback: meta description
            if (foundTeams.size() < 2) {
                String meta = doc.select("meta[name=description]").attr("content");
                for (Map.Entry<String, String> entry : TEAM_MAP.entrySet()) {
                    if (meta.contains(entry.getKey())) {
                        String id = entry.getValue();
                        if (!foundTeams.contains(id)) {
                            foundTeams.add(id);
                        }
                        if (foundTeams.size() == 2) break;
                    }
                }
            }

            if (foundTeams.size() >= 1) builder.team1(foundTeams.get(0));
            else warnings.add("Could not determine Team 1");

            if (foundTeams.size() >= 2) builder.team2(foundTeams.get(1));
            else warnings.add("Could not determine Team 2");

        } catch (Exception e) {
            warnings.add("Error parsing teams: " + e.getMessage());
        }
    }

    // ── Score parsing ─────────────────────────────────────────────────────────

    private void parseScores(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            // Selectors for scorecard summary rows (ESPN Cricinfo)
            Elements scoreBlocks = doc.select(
                ".ds-flex.ds-items-center.ds-text-compact-s, " +
                "[class*='score'], " +
                ".cb-col.cb-col-67.cb-scrd-itms"
            );

            List<int[]> innings = new ArrayList<>(); // [runs, wickets, oversX10]

            for (Element block : scoreBlocks) {
                String text = block.text().trim();
                // Pattern: "185/6 (19.4 Ov)" or "210/4 (20 Ov)"
                Pattern p = Pattern.compile("(\\d+)/(\\d+)\\s*\\(([\\d.]+)");
                Matcher m = p.matcher(text);
                if (m.find()) {
                    int runs    = Integer.parseInt(m.group(1));
                    int wickets = Integer.parseInt(m.group(2));
                    double overs = Double.parseDouble(m.group(3));
                    innings.add(new int[]{runs, wickets, (int)(overs * 10)});
                    if (innings.size() == 2) break;
                }
            }

            // Fallback: look in the full page text using regex
            if (innings.size() < 2) {
                String bodyText = doc.body().text();
                Pattern p = Pattern.compile("(\\d{2,3})/(\\d)\\s*\\(([\\d.]+)\\s*[Oo]v");
                Matcher m = p.matcher(bodyText);
                while (m.find() && innings.size() < 2) {
                    int runs    = Integer.parseInt(m.group(1));
                    int wickets = Integer.parseInt(m.group(2));
                    double overs = Double.parseDouble(m.group(3));
                    innings.add(new int[]{runs, wickets, (int)(overs * 10)});
                }
            }

            if (innings.size() >= 1) {
                builder.team1Score(innings.get(0)[0]);
                builder.team1Wickets(innings.get(0)[1]);
                builder.team1Overs(innings.get(0)[2] / 10.0);
            } else {
                warnings.add("Could not parse Team 1 score");
            }

            if (innings.size() >= 2) {
                builder.team2Score(innings.get(1)[0]);
                builder.team2Wickets(innings.get(1)[1]);
                builder.team2Overs(innings.get(1)[2] / 10.0);
            } else {
                warnings.add("Could not parse Team 2 score");
            }

        } catch (Exception e) {
            warnings.add("Error parsing scores: " + e.getMessage());
        }
    }

    // ── Result parsing ────────────────────────────────────────────────────────

    private void parseResult(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            String resultText = "";

            // Try multiple selectors for result text
            String[] resultSelectors = {
                "p.ds-text-tight-s.ds-font-bold",
                "[class*='result']",
                ".cb-col.cb-col-100.cb-series-result"
            };

            for (String sel : resultSelectors) {
                Element el = doc.selectFirst(sel);
                if (el != null && !el.text().isBlank()) {
                    resultText = el.text().trim();
                    break;
                }
            }

            // Fallback: look for result pattern in body
            if (resultText.isBlank()) {
                String body = doc.body().text();
                Pattern p = Pattern.compile("([A-Za-z ]+(?:Indians|Kings|Royals|Capitals|Challengers|Titans|Giants|Riders|Sunrisers)) won by (\\d+) (wickets|runs)", Pattern.CASE_INSENSITIVE);
                Matcher m = p.matcher(body);
                if (m.find()) {
                    resultText = m.group(0);
                }
            }

            if (resultText.isBlank()) {
                // Check for no result
                if (doc.body().text().toLowerCase().contains("no result") ||
                    doc.body().text().toLowerCase().contains("abandoned")) {
                    builder.noResult(true);
                    return;
                }
                warnings.add("Could not determine match result");
                return;
            }

            if (resultText.toLowerCase().contains("no result") || resultText.toLowerCase().contains("abandoned")) {
                builder.noResult(true);
                return;
            }

            builder.noResult(false);

            // Parse "Team won by X wickets/runs"
            Pattern wonBy = Pattern.compile("(.+?)\\s+won by\\s+(\\d+)\\s+(wickets?|runs?)", Pattern.CASE_INSENSITIVE);
            Matcher m = wonBy.matcher(resultText);
            if (m.find()) {
                String winnerName = m.group(1).trim();
                String margin     = m.group(2).trim();
                String type       = m.group(3).toLowerCase().startsWith("w") ? "wickets" : "runs";

                String winnerId = matchTeamName(winnerName);
                if (winnerId != null) {
                    builder.winner(winnerId);
                } else {
                    // Try partial match
                    for (Map.Entry<String, String> entry : TEAM_MAP.entrySet()) {
                        if (winnerName.contains(entry.getKey()) || entry.getKey().contains(winnerName)) {
                            builder.winner(entry.getValue());
                            break;
                        }
                    }
                    if (winnerId == null) warnings.add("Could not map winner team name: " + winnerName);
                }
                builder.winMargin(margin);
                builder.winType(type);
            } else {
                warnings.add("Could not parse win margin from: " + resultText);
            }

        } catch (Exception e) {
            warnings.add("Error parsing result: " + e.getMessage());
        }
    }

    // ── Toss parsing ──────────────────────────────────────────────────────────

    private void parseToss(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            String tossText = "";

            // Look for toss info in match details section
            Elements details = doc.select("td, li, p, div");
            for (Element el : details) {
                String text = el.text().trim();
                if (text.toLowerCase().startsWith("toss") && text.length() < 200) {
                    tossText = text;
                    break;
                }
            }

            if (tossText.isBlank()) {
                // Scan body text for toss pattern
                String body = doc.body().text();
                Pattern p = Pattern.compile("Toss[:\\s]+(.{5,100}?),\\s*(elected to|chose to)\\s*(bat|field)", Pattern.CASE_INSENSITIVE);
                Matcher m = p.matcher(body);
                if (m.find()) {
                    tossText = m.group(0);
                }
            }

            if (!tossText.isBlank()) {
                // Extract team
                for (Map.Entry<String, String> entry : TEAM_MAP.entrySet()) {
                    if (tossText.contains(entry.getKey())) {
                        builder.tossWinner(entry.getValue());
                        break;
                    }
                }

                // Extract decision
                String lower = tossText.toLowerCase();
                if (lower.contains("bat")) {
                    builder.tossDecision("bat");
                } else if (lower.contains("field") || lower.contains("bowl")) {
                    builder.tossDecision("field");
                } else {
                    warnings.add("Could not determine toss decision from: " + tossText);
                }
            } else {
                warnings.add("Could not find toss information");
            }

        } catch (Exception e) {
            warnings.add("Error parsing toss: " + e.getMessage());
        }
    }

    // ── Match info (date, venue, match no) ────────────────────────────────────

    private void parseMatchInfo(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            // Date: look for datetime in meta or structured data
            Element dateEl = doc.selectFirst("meta[itemprop=startDate], meta[property='og:updated_time'], time[datetime]");
            if (dateEl != null) {
                String dateStr = dateEl.hasAttr("datetime") ? dateEl.attr("datetime") : dateEl.attr("content");
                if (dateStr != null && dateStr.length() >= 10) {
                    builder.date(dateStr.substring(0, 10)); // "YYYY-MM-DD"
                }
            }

            // Venue: look for ground info in details
            Elements allText = doc.select("td, li, p, span, div");
            for (Element el : allText) {
                String text = el.text().trim();
                if (text.toLowerCase().contains("venue") && text.length() < 300) {
                    // Extract venue name after "Venue:"
                    Pattern p = Pattern.compile("Venue[:\\s]+(.+?)(?:,|$)", Pattern.CASE_INSENSITIVE);
                    Matcher m = p.matcher(text);
                    if (m.find()) {
                        builder.venue(m.group(1).trim());
                        break;
                    }
                }
            }

            // Match number: look for "Match X" pattern in page
            String bodyText = doc.body().text();
            Pattern matchNoPattern = Pattern.compile("(?:match|Match)\\s+(\\d+)", Pattern.CASE_INSENSITIVE);
            Matcher mn = matchNoPattern.matcher(doc.title() + " " + bodyText.substring(0, Math.min(500, bodyText.length())));
            if (mn.find()) {
                try {
                    builder.matchNo(Integer.parseInt(mn.group(1)));
                } catch (NumberFormatException ignored) {}
            }

        } catch (Exception e) {
            warnings.add("Error parsing match info: " + e.getMessage());
        }
    }

    // ── Player of the Match ───────────────────────────────────────────────────

    private void parsePlayerOfMatch(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            // Try dedicated selectors
            String[] pomSelectors = {
                "[class*='player-of-match']",
                "[class*='pom']",
                "td:contains(Player of the Match)",
                "li:contains(Player of the Match)",
                "p:contains(Player of the Match)",
                "div:contains(Player of the Match)"
            };

            for (String sel : pomSelectors) {
                Elements els = doc.select(sel);
                for (Element el : els) {
                    String text = el.text().trim();
                    if (text.toLowerCase().contains("player of the match")) {
                        // Try to get the name from next sibling or child
                        Element sibling = el.nextElementSibling();
                        if (sibling != null && !sibling.text().isBlank()) {
                            builder.playerOfMatchName(sibling.text().trim());
                            return;
                        }
                        // Extract from same element after the label
                        String name = text.replaceAll("(?i)player of the match[:\\s]*", "").trim();
                        if (!name.isBlank() && name.length() < 60) {
                            builder.playerOfMatchName(name);
                            return;
                        }
                    }
                }
            }

            // Scan body for pattern
            String bodyText = doc.body().text();
            Pattern p = Pattern.compile("Player of the [Mm]atch[:\\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(bodyText);
            if (m.find()) {
                builder.playerOfMatchName(m.group(1).trim());
                return;
            }

            warnings.add("Could not determine Player of the Match");

        } catch (Exception e) {
            warnings.add("Error parsing Player of the Match: " + e.getMessage());
        }
    }

    // ── Top Scorer ────────────────────────────────────────────────────────────

    private void parseTopScorer(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            // Look for batting scorecard tables
            Elements tables = doc.select("table");
            int maxRuns = -1;
            String topScorerName = null;

            for (Element table : tables) {
                Elements rows = table.select("tr");
                for (Element row : rows) {
                    Elements cells = row.select("td");
                    if (cells.size() < 3) continue;

                    String playerName = cells.get(0).text().trim();
                    // Skip empty rows, "Extras", "Total", "Fall of wickets", "DNB"
                    if (playerName.isBlank() || playerName.equalsIgnoreCase("Extras") ||
                        playerName.equalsIgnoreCase("Total") || playerName.contains("Did not bat") ||
                        playerName.contains("Fall of") || playerName.length() > 50) continue;

                    // Try to parse runs from column index 2 or 3 (format: R, B, 4s, 6s, SR)
                    for (int colIdx : new int[]{2, 3}) {
                        if (colIdx >= cells.size()) continue;
                        String runsStr = cells.get(colIdx).text().trim().replaceAll("[^\\d]", "");
                        if (!runsStr.isBlank()) {
                            try {
                                int runs = Integer.parseInt(runsStr);
                                if (runs > maxRuns && runs < 300) { // sanity check
                                    maxRuns = runs;
                                    topScorerName = playerName;
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                }
            }

            // Alternatively scan structured class-based rows
            if (maxRuns < 0) {
                Elements rows = doc.select("[class*='ds-flex'][class*='ds-items-center']");
                for (Element row : rows) {
                    Elements spans = row.select("span, a");
                    if (spans.size() < 2) continue;
                    String playerName = spans.get(0).text().trim();
                    for (int i = 1; i < spans.size(); i++) {
                        String runsStr = spans.get(i).text().trim().replaceAll("[^\\d]", "");
                        if (!runsStr.isBlank() && runsStr.length() <= 3) {
                            try {
                                int runs = Integer.parseInt(runsStr);
                                if (runs > maxRuns && runs < 300) {
                                    maxRuns = runs;
                                    topScorerName = playerName;
                                }
                            } catch (NumberFormatException ignored) {}
                            break;
                        }
                    }
                }
            }

            if (topScorerName != null && maxRuns >= 0) {
                builder.topScorerName(topScorerName);
                builder.topScorerRuns(maxRuns);
            } else {
                warnings.add("Could not determine top scorer");
            }

        } catch (Exception e) {
            warnings.add("Error parsing top scorer: " + e.getMessage());
        }
    }

    // ── Top Wicket Taker ──────────────────────────────────────────────────────

    private void parseTopWicketTaker(Document doc, ScrapedMatchDTO.ScrapedMatchDTOBuilder builder, List<String> warnings) {
        try {
            Elements tables = doc.select("table");
            int maxWickets = -1;
            String topBowlerName = null;

            for (Element table : tables) {
                Elements rows = table.select("tr");
                for (Element row : rows) {
                    Elements cells = row.select("td");
                    if (cells.size() < 5) continue;

                    String playerName = cells.get(0).text().trim();
                    if (playerName.isBlank() || playerName.length() > 50) continue;

                    // Bowling columns: O, M, R, W — wickets usually at index 4 or 5
                    for (int colIdx : new int[]{4, 5, 3}) {
                        if (colIdx >= cells.size()) continue;
                        String wicketsStr = cells.get(colIdx).text().trim().replaceAll("[^\\d]", "");
                        if (!wicketsStr.isBlank()) {
                            try {
                                int wickets = Integer.parseInt(wicketsStr);
                                if (wickets > maxWickets && wickets <= 10) {
                                    maxWickets = wickets;
                                    topBowlerName = playerName;
                                }
                            } catch (NumberFormatException ignored) {}
                            break;
                        }
                    }
                }
            }

            if (topBowlerName != null && maxWickets >= 0) {
                builder.topWicketTakerName(topBowlerName);
                builder.topWicketTakerWickets(maxWickets);
            } else {
                warnings.add("Could not determine top wicket taker");
            }

        } catch (Exception e) {
            warnings.add("Error parsing top wicket taker: " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String matchTeamName(String text) {
        if (text == null || text.isBlank()) return null;
        for (Map.Entry<String, String> entry : TEAM_MAP.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }
}
