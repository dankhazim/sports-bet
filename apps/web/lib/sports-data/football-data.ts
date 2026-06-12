import type { MatchStatus } from '@sports-bet/shared';
import type {
  ExternalCompetition,
  ExternalMatch,
  ExternalTeam,
  SportsDataProvider,
} from './provider';

const BASE_URL = 'https://api.football-data.org/v4';

interface FdTeam {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

interface FdScorePart {
  home: number | null;
  away: number | null;
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string | null;
  group: string | null;
  matchday: number | null;
  homeTeam: FdTeam | null;
  awayTeam: FdTeam | null;
  score: {
    duration: string;
    fullTime: FdScorePart;
    regularTime?: FdScorePart | null;
  };
}

interface FdResponse {
  competition: { id: number; name: string; code: string };
  resultSet?: { first?: string; last?: string };
  matches: FdMatch[];
}

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'TIMED',
  IN_PLAY: 'IN_PLAY',
  PAUSED: 'PAUSED',
  SUSPENDED: 'PAUSED',
  FINISHED: 'FINISHED',
  AWARDED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
};

function mapTeam(team: FdTeam | null): ExternalTeam | null {
  if (!team || team.id == null || !team.name) return null;
  return {
    externalId: String(team.id),
    name: team.name,
    shortName: team.shortName ?? team.tla,
    crestUrl: team.crest,
  };
}

/**
 * Rendes játékidő eredménye. Hosszabbítás/tizenegyesek esetén a
 * football-data a `regularTime` mezőben adja a 90 perces állást,
 * egyébként a `fullTime` maga a 90 perces végeredmény.
 */
function regularTimeScore(match: FdMatch): FdScorePart {
  if (match.score.duration !== 'REGULAR' && match.score.regularTime) {
    return match.score.regularTime;
  }
  return match.score.fullTime;
}

export class FootballDataProvider implements SportsDataProvider {
  constructor(private readonly apiToken: string) {}

  async fetchCompetition(code: string): Promise<{
    competition: ExternalCompetition;
    matches: ExternalMatch[];
  }> {
    const res = await fetch(`${BASE_URL}/competitions/${code}/matches`, {
      headers: { 'X-Auth-Token': this.apiToken },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`football-data.org hiba: ${res.status} ${await res.text()}`);
    }
    const data: FdResponse = await res.json();

    const matches: ExternalMatch[] = data.matches.map((m) => {
      const status = STATUS_MAP[m.status] ?? 'SCHEDULED';
      const hasScore = status === 'IN_PLAY' || status === 'PAUSED' || status === 'FINISHED';
      const score = regularTimeScore(m);
      return {
        externalId: String(m.id),
        stage: m.stage,
        group: m.group,
        matchday: m.matchday,
        kickoffAt: m.utcDate,
        status,
        homeTeam: mapTeam(m.homeTeam),
        awayTeam: mapTeam(m.awayTeam),
        homeScore: hasScore ? score.home : null,
        awayScore: hasScore ? score.away : null,
      };
    });

    return {
      competition: {
        externalId: data.competition.code,
        name: data.competition.name,
        startsAt: data.resultSet?.first ?? null,
        endsAt: data.resultSet?.last ?? null,
      },
      matches,
    };
  }
}

export function createProvider(): SportsDataProvider {
  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) throw new Error('Hiányzó FOOTBALL_DATA_API_TOKEN környezeti változó');
  return new FootballDataProvider(token);
}
