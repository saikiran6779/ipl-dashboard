package com.ipl.dashboard.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDTO {
    private String id;
    private String name;
    private String city;
    private String primaryColor;
    private String accentColor;
    private String logoUrl;
    private Long   homeGroundId;
    private String homeGroundName;
    private Long   captainId;
    private String captainName;
}
