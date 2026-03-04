package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.MatchDTO;
import com.ipl.dashboard.dto.StatsDTO;
import com.ipl.dashboard.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    // ── Matches CRUD ──────────────────────────────────────────────────────────

    @GetMapping("/matches")
    public ResponseEntity<List<MatchDTO>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @GetMapping("/matches/{id}")
    public ResponseEntity<MatchDTO> getMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchById(id));
    }

    @PostMapping("/matches")
    public ResponseEntity<MatchDTO> createMatch(@Valid @RequestBody MatchDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.createMatch(dto));
    }

    @PutMapping("/matches/{id}")
    public ResponseEntity<MatchDTO> updateMatch(@PathVariable Long id,
                                                 @Valid @RequestBody MatchDTO dto) {
        return ResponseEntity.ok(matchService.updateMatch(id, dto));
    }

    @DeleteMapping("/matches/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<StatsDTO.Summary> getStats() {
        return ResponseEntity.ok(matchService.getStats());
    }
}
