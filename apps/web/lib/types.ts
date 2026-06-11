import type { MatchStatus } from '@sports-bet/shared';

export interface Team {
  id: number;
  external_id: string | null;
  name: string;
  short_name: string | null;
  crest_url: string | null;
}

export interface Match {
  id: number;
  competition_id: number;
  external_id: string;
  home_team_id: number | null;
  away_team_id: number | null;
  stage: string | null;
  group_name: string | null;
  kickoff_at: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  scored_at: string | null;
}

export interface MatchWithTeams extends Match {
  home_team: Team | null;
  away_team: Team | null;
}

export interface Tip {
  id: number;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  exact_hits: number;
  correct_outcomes: number;
  scored_tips: number;
}

export const MATCH_SELECT_WITH_TEAMS =
  '*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)';
