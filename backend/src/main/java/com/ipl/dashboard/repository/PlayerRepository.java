package com.ipl.dashboard.repository;

import com.ipl.dashboard.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTeamIdOrderByNameAsc(String teamId);

    List<Player> findAllByOrderByTeamIdAscNameAsc();

    boolean existsByNameAndTeamId(String name, String teamId);
}