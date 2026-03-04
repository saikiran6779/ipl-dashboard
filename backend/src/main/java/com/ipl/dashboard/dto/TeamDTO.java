package com.ipl.dashboard.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private String id;
    private String name;
    private String primaryColor;
    private String accentColor;
    private String homeGround;
    private String city;
    private String logoUrl;
}
