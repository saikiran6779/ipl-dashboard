package com.ipl.dashboard.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    private String id;  // MI, CSK, RCB …

    private String name;
    private String city;
    private String primaryColor;
    private String accentColor;
    private String logoUrl;

    /** Normalised home ground — FK to venues table */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_ground_id")
    private Venue homeGround;
}
