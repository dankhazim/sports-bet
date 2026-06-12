import { stageLabel } from '@sports-bet/shared';
import type { Match } from './types';

/** A kieséses szakasz fordulóinak sorrendje (football-data stage értékek). */
const KNOCKOUT_ORDER = [
  'LAST_32',
  'ROUND_OF_32',
  'LAST_16',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

export interface Round {
  key: string;
  label: string;
}

type RoundSource = Pick<Match, 'stage' | 'matchday'>;

/** Egy meccs melyik fordulóhoz tartozik: csoportkörben a matchday, utána a stage. */
export function roundKeyOf(match: RoundSource): string {
  if (match.stage === 'GROUP_STAGE') return `md-${match.matchday ?? 0}`;
  return match.stage ?? 'OTHER';
}

export function roundLabel(key: string): string {
  if (key.startsWith('md-')) {
    const n = Number(key.slice(3));
    return n > 0 ? `${n}. forduló` : 'Csoportkör';
  }
  return stageLabel(key) || 'Egyéb';
}

/** A meccsekben ténylegesen előforduló fordulók, helyes sorrendben. */
export function buildRounds(matches: RoundSource[]): Round[] {
  const keys = new Set(matches.map(roundKeyOf));
  const group = [...keys].filter((k) => k.startsWith('md-')).sort();
  const knockout = KNOCKOUT_ORDER.filter((k) => keys.has(k));
  const other = [...keys].filter(
    (k) => !k.startsWith('md-') && !KNOCKOUT_ORDER.includes(k),
  );
  return [...group, ...knockout, ...other].map((key) => ({
    key,
    label: roundLabel(key),
  }));
}

/**
 * Az alapértelmezetten megnyitott forduló: amelyikben a következő
 * tippelhető vagy éppen futó meccs van; ha a torna véget ért, az utolsó.
 */
export function defaultRoundKey(
  matches: (RoundSource & Pick<Match, 'status' | 'kickoff_at'>)[],
  rounds: Round[],
): string | null {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  const current = matches.find(
    (m) =>
      (m.status === 'SCHEDULED' || m.status === 'TIMED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') &&
      new Date(m.kickoff_at).getTime() >= cutoff,
  );
  if (current) return roundKeyOf(current);
  return rounds.length > 0 ? rounds[rounds.length - 1].key : null;
}
