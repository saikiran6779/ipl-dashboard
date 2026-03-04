package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.PlayerDTO;
import com.ipl.dashboard.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    // ── Players ───────────────────────────────────────────────────────────

    /** GET /api/players  — all players, sorted by team then name */
    @GetMapping("/players")
    public List<PlayerDTO.Summary> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    /** GET /api/teams/{teamId}/squad  — squad for one team */
    @GetMapping("/teams/{teamId}/squad")
    public List<PlayerDTO.Summary> getSquad(@PathVariable String teamId) {
        return playerService.getSquad(teamId.toUpperCase());
    }

    /** POST /api/players  — create player */
    @PostMapping("/players")
    public ResponseEntity<PlayerDTO.Summary> createPlayer(
            @Valid @RequestBody PlayerDTO.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playerService.createPlayer(req));
    }

    /** PUT /api/players/{id}  — update player */
    @PutMapping("/players/{id}")
    public PlayerDTO.Summary updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody PlayerDTO.Request req) {
        return playerService.updatePlayer(id, req);
    }

    /** DELETE /api/players/{id}  — delete player (cascades stats) */
    @DeleteMapping("/players/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
    }

    /** POST /api/players/{id}/picture  — upload profile picture */
    @PostMapping("/players/{id}/picture")
    public ResponseEntity<PlayerDTO.Summary> uploadPicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(playerService.uploadProfilePicture(id, file));
    }

    /** GET /api/players/{id}/profile  — career stats + match log */
    @GetMapping("/players/{id}/profile")
    public PlayerDTO.Profile getProfile(@PathVariable Long id) {
        return playerService.getProfile(id);
    }

    // ── Scorecards ────────────────────────────────────────────────────────

    /** POST /api/matches/{matchId}/scorecard  — submit / update scorecard */
    @PostMapping("/matches/{matchId}/scorecard")
    public ResponseEntity<List<PlayerDTO.ScorecardEntry>> saveScorecard(
            @PathVariable Long matchId,
            @RequestBody List<PlayerDTO.@Valid StatEntry> entries) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playerService.saveScorecard(matchId, entries));
    }

    /** GET /api/matches/{matchId}/scorecard  — fetch scorecard for a match */
    @GetMapping("/matches/{matchId}/scorecard")
    public List<PlayerDTO.ScorecardEntry> getScorecard(@PathVariable Long matchId) {
        return playerService.getScorecard(matchId);
    }

    // ── Leaderboards ──────────────────────────────────────────────────────

    /** GET /api/leaderboard/batting  — top run-scorers (full stats) */
    @GetMapping("/leaderboard/batting")
    public List<?> topBatters() {
        return playerService.getTopBattersDetailed();
    }

    /** GET /api/leaderboard/bowling  — top wicket-takers (full stats) */
    @GetMapping("/leaderboard/bowling")
    public List<?> topBowlers() {
        return playerService.getTopBowlersDetailed();
    }
}