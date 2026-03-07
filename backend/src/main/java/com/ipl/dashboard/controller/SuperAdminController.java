package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.AuthDTO;
import com.ipl.dashboard.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
