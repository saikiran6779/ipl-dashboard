package com.ipl.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String teamId;   // MI, CSK, RCB …

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profilePictureUrl;

    private LocalDate dateOfBirth;
    private String    nationality;
    private String    battingStyle;
    private String    bowlingStyle;

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerMatchStats> stats;

    public enum Role { BAT, BOWL, ALL, WK }
}