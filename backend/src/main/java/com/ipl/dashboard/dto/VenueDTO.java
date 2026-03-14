package com.ipl.dashboard.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDTO {
    private Long   id;
    private String name;
    private String city;
    private String imageUrl;
}
