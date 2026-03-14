package com.ipl.dashboard.config;

import com.ipl.dashboard.model.Team;
import com.ipl.dashboard.model.Venue;
import com.ipl.dashboard.repository.TeamRepository;
import com.ipl.dashboard.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Populates the venues table and links each team's homeGround on first startup.
 * Skips silently if venues already exist (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VenueSeeder implements ApplicationRunner {

    private final VenueRepository venueRepository;
    private final TeamRepository  teamRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (venueRepository.count() > 0) {
            log.debug("Venues already seeded — skipping.");
            return;
        }

        log.info("Seeding IPL venues...");

        // ── Insert venues ─────────────────────────────────────────────────────
        List<Venue> venues = venueRepository.saveAll(List.of(
            Venue.builder().name("Wankhede Stadium")                .city("Mumbai")     .build(),
            Venue.builder().name("M. A. Chidambaram Stadium")       .city("Chennai")    .build(),
            Venue.builder().name("M. Chinnaswamy Stadium")          .city("Bengaluru")  .build(),
            Venue.builder().name("Eden Gardens")                     .city("Kolkata")    .build(),
            Venue.builder().name("Arun Jaitley Stadium")             .city("Delhi")      .build(),
            Venue.builder().name("HPCA Stadium")                    .city("Dharamsala") .build(),
            Venue.builder().name("Sawai Mansingh Stadium")           .city("Jaipur")     .build(),
            Venue.builder().name("Rajiv Gandhi Intl Stadium")        .city("Hyderabad")  .build(),
            Venue.builder().name("Narendra Modi Stadium")            .city("Ahmedabad")  .build(),
            Venue.builder().name("BRSABV Ekana Stadium")             .city("Lucknow")    .build()
        ));

        log.info("Inserted {} venues.", venues.size());

        // ── Link team home grounds by matching team.city → venue.city ─────────
        for (Team team : teamRepository.findAll()) {
            venueRepository.findByCityIgnoreCase(team.getCity()).ifPresent(venue -> {
                team.setHomeGround(venue);
                teamRepository.save(team);
                log.debug("Linked {} → {}", team.getId(), venue.getName());
            });
        }

        log.info("Venue seeding complete.");
    }
}
