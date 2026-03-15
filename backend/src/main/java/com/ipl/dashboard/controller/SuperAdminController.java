package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.AuthDTO;
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

    @PutMapping("/teams/{teamId}/logo")
    public ResponseEntity<Void> updateTeamLogo(
            @PathVariable String teamId,
            @RequestBody Map<String, String> body) {
        superAdminService.updateTeamLogo(teamId, body.get("logoUrl"));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/teams/{teamId}/captain")
    public ResponseEntity<Void> updateTeamCaptain(
            @PathVariable String teamId,
            @RequestBody Map<String, Object> body) {
        Long captainId = body.get("captainId") != null
            ? Long.valueOf(body.get("captainId").toString())
            : null;
        superAdminService.updateTeamCaptain(teamId, captainId);
        return ResponseEntity.noContent().build();
    }
}
