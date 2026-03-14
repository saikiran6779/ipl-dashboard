package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.AuthDTO;
import com.ipl.dashboard.dto.ScrapedMatchDTO;
import com.ipl.dashboard.service.CricinfoScraperService;
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
    private final CricinfoScraperService scraperService;

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

    @PostMapping("/scrape-match")
    public ResponseEntity<ScrapedMatchDTO> scrapeMatch(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(scraperService.scrapeMatch(url));
    }
}
