package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.AuthDTO;
import com.ipl.dashboard.dto.ScrapedMatchDTO;
import com.ipl.dashboard.service.CricApiService;
import com.ipl.dashboard.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;
    private final CricApiService cricApiService;

    @GetMapping("/users")
    public ResponseEntity<List<AuthDTO.UserInfo>> getAllUsers() {
        return ResponseEntity.ok(superAdminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/promote")
    public ResponseEntity<AuthDTO.UserInfo> promoteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(superAdminService.promoteUser(userId));
    }

    @PutMapping("/users/{userId}/demote")
    public ResponseEntity<AuthDTO.UserInfo> demoteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(superAdminService.demoteUser(userId));
    }

    // ── CricAPI ────────────────────────────────────────────────────────────
    @GetMapping("/cricapi/search")
    public ResponseEntity<List<Map<String, Object>>> searchMatches(
            @RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(cricApiService.searchMatches(q));
    }

    @GetMapping("/cricapi/match/{matchId}")
    public ResponseEntity<ScrapedMatchDTO> fetchMatch(@PathVariable String matchId) {
        return ResponseEntity.ok(cricApiService.fetchMatchById(matchId));
    }
}
