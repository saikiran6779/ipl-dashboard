package com.ipl.dashboard.config;

import com.ipl.dashboard.model.Team;
import com.ipl.dashboard.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TeamDataInitializer implements ApplicationRunner {

    private final TeamRepository teamRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (teamRepository.count() > 0) return;   // already seeded

        List<Team> teams = List.of(
            Team.builder().id("MI")  .name("Mumbai Indians")              .primaryColor("#004BA0").accentColor("#D1AB3E").homeGround("Wankhede Stadium").city("Mumbai").build(),
            Team.builder().id("CSK") .name("Chennai Super Kings")         .primaryColor("#F9CD1C").accentColor("#0081C8").homeGround("M. A. Chidambaram Stadium").city("Chennai").build(),
            Team.builder().id("RCB") .name("Royal Challengers Bengaluru") .primaryColor("#C8102E").accentColor("#231F20").homeGround("M. Chinnaswamy Stadium").city("Bengaluru").build(),
            Team.builder().id("KKR") .name("Kolkata Knight Riders")       .primaryColor("#3A225D").accentColor("#F2A900").homeGround("Eden Gardens").city("Kolkata").build(),
            Team.builder().id("DC")  .name("Delhi Capitals")              .primaryColor("#0078BC").accentColor("#EF1B23").homeGround("Arun Jaitley Stadium").city("Delhi").build(),
            Team.builder().id("PBKS").name("Punjab Kings")                .primaryColor("#ED1B24").accentColor("#A7A9AC").homeGround("HPCA Stadium").city("Dharamsala").build(),
            Team.builder().id("RR")  .name("Rajasthan Royals")            .primaryColor("#EA1A85").accentColor("#254AA5").homeGround("Sawai Mansingh Stadium").city("Jaipur").build(),
            Team.builder().id("SRH") .name("Sunrisers Hyderabad")         .primaryColor("#FF822A").accentColor("#1B1B1B").homeGround("Rajiv Gandhi Intl Stadium").city("Hyderabad").build(),
            Team.builder().id("GT")  .name("Gujarat Titans")              .primaryColor("#1C1C59").accentColor("#B8D1D9").homeGround("Narendra Modi Stadium").city("Ahmedabad").build(),
            Team.builder().id("LSG") .name("Lucknow Super Giants")        .primaryColor("#A72B6D").accentColor("#00AEEF").homeGround("BRSABV Ekana Stadium").city("Lucknow").build()
        );

        teamRepository.saveAll(teams);
    }
}
