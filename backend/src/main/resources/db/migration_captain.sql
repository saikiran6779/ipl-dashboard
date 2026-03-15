-- Add default captain to teams
ALTER TABLE teams
  ADD COLUMN captain_id BIGINT NULL,
  ADD CONSTRAINT fk_teams_captain
    FOREIGN KEY (captain_id) REFERENCES players (id)
    ON DELETE SET NULL;

-- Add per-match captains to matches
ALTER TABLE matches
  ADD COLUMN team1_captain_id BIGINT NULL,
  ADD COLUMN team2_captain_id BIGINT NULL,
  ADD CONSTRAINT fk_matches_team1_captain
    FOREIGN KEY (team1_captain_id) REFERENCES players (id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_matches_team2_captain
    FOREIGN KEY (team2_captain_id) REFERENCES players (id)
    ON DELETE SET NULL;
