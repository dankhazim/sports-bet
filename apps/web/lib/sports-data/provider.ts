import type { MatchStatus } from '@sports-bet/shared';

export interface ExternalTeam {
  externalId: string;
  name: string;
  shortName: string | null;
  crestUrl: string | null;
}

export interface ExternalMatch {
  externalId: string;
  stage: string | null;
  group: string | null;
  matchday: number | null;
  kickoffAt: string;
  status: MatchStatus;
  homeTeam: ExternalTeam | null;
  awayTeam: ExternalTeam | null;
  /** Rendes játékidő (90 perc) eredménye — erre tippelünk. */
  homeScore: number | null;
  awayScore: number | null;
}

export interface ExternalCompetition {
  externalId: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
}

/**
 * Adapter interfész a sport-adat szolgáltatók fölé, hogy később
 * más sport / más API is beköthető legyen.
 */
export interface SportsDataProvider {
  fetchCompetition(code: string): Promise<{
    competition: ExternalCompetition;
    matches: ExternalMatch[];
  }>;
}
