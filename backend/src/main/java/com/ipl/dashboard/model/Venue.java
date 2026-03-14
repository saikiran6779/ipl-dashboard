package com.ipl.dashboard.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String city;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "venue_images", joinColumns = @JoinColumn(name = "venue_id"))
    @Column(name = "image_url", length = 1024)
    @OrderColumn(name = "position")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
}
