package com.ipl.dashboard.controller;

import com.ipl.dashboard.dto.TeamDTO;
import com.ipl.dashboard.model.Team;
import com.ipl.dashboard.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;

    @GetMapping
    public List<TeamDTO> getAll() {
        return teamRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TeamDTO getOne(@PathVariable String id) {
        return teamRepository.findById(id.toUpperCase())
                .map(this::toDTO)
                .orElseThrow(() -> new java.util.NoSuchElementException("Team not found: " + id));
    }

    private TeamDTO toDTO(Team t) {
        return TeamDTO.builder()
                .id(t.getId())
                .name(t.getName())
                .city(t.getCity())
                .primaryColor(t.getPrimaryColor())
                .accentColor(t.getAccentColor())
                .logoUrl(t.getLogoUrl())
                .homeGroundId(t.getHomeGround() != null ? t.getHomeGround().getId() : null)
                .homeGroundName(t.getHomeGround() != null ? t.getHomeGround().getName() : null)
                .build();
    }
}
