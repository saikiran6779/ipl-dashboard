package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.AuthDTO;
import com.ipl.dashboard.model.Role;
import com.ipl.dashboard.model.User;
import com.ipl.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;

    // ── List all users ────────────────────────────────────────────────────────

    public List<AuthDTO.UserInfo> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AuthService::toUserInfo)
                .toList();
    }

    // ── Promote USER → ADMIN ──────────────────────────────────────────────────

    @Transactional
    public AuthDTO.UserInfo promoteUser(Long userId) {
        User user = findUser(userId);
        guardSuperAdmin(user);

        if (user.getRole() != Role.USER) {
            throw new IllegalArgumentException("User is not a USER — cannot promote");
        }
        user.setRole(Role.ADMIN);
        return AuthService.toUserInfo(userRepository.save(user));
    }

    // ── Demote ADMIN → USER ───────────────────────────────────────────────────

    @Transactional
    public AuthDTO.UserInfo demoteUser(Long userId) {
        User user = findUser(userId);
        guardSuperAdmin(user);

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not an ADMIN — cannot demote");
        }
        user.setRole(Role.USER);
        return AuthService.toUserInfo(userRepository.save(user));
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));
    }

    private void guardSuperAdmin(User user) {
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new SecurityException("Cannot modify SUPER_ADMIN role");
        }
    }
}
