package com.ipl.dashboard.service;

import com.ipl.dashboard.dto.TeamDTO;
import com.ipl.dashboard.model.Team;
import com.ipl.dashboard.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TeamDTO getTeamById(String id) {
        return teamRepository.findById(id.toUpperCase())
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Team not found: " + id));
    }

    public TeamDTO updateTeam(String id, TeamDTO dto) {
        Team existing = teamRepository.findById(id.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Team not found: " + id));
        existing.setName(dto.getName());
        existing.setPrimaryColor(dto.getPrimaryColor());
        existing.setAccentColor(dto.getAccentColor());
        existing.setHomeGround(dto.getHomeGround());
        existing.setCity(dto.getCity());
        existing.setLogoUrl(dto.getLogoUrl());
        return toDTO(teamRepository.save(existing));
    }

    private TeamDTO toDTO(Team t) {
        return TeamDTO.builder()
                .id(t.getId())
                .name(t.getName())
                .primaryColor(t.getPrimaryColor())
                .accentColor(t.getAccentColor())
                .homeGround(t.getHomeGround())
                .city(t.getCity())
                .logoUrl(t.getLogoUrl())
                .build();
    }
}
