package com.ipl.dashboard.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDTO {
    private Long         id;
    private String       name;
    private String       city;
    private List<String> imageUrls;
}
