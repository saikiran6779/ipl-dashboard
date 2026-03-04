package com.ipl.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    private String id;          // MI, CSK, RCB …

    @NotBlank
    private String name;

    private String primaryColor;
    private String accentColor;
    private String homeGround;
    private String city;
    private String logoUrl;
}
