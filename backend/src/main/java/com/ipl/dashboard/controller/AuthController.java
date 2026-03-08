package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.AuthDTO;
import com.ipl.dashboard.model.User;
import com.ipl.dashboard.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.TokenResponse> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.TokenResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDTO.TokenResponse> refresh(
            @Valid @RequestBody AuthDTO.RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthDTO.MessageResponse> logout(
            @AuthenticationPrincipal User user) {
        if (user != null) {
            authService.logout(user);
        }
        return ResponseEntity.ok(AuthDTO.MessageResponse.builder().message("Logged out successfully").build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthDTO.MessageResponse> forgotPassword(
            @Valid @RequestBody AuthDTO.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(AuthDTO.MessageResponse.builder()
                .message("If an account exists for this email, a reset link has been sent").build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthDTO.MessageResponse> resetPassword(
            @Valid @RequestBody AuthDTO.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(AuthDTO.MessageResponse.builder()
                .message("Password reset successfully").build());
    }
}
