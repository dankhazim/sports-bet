export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

/** A meccs tippelhető-e még (a kezdés előtti, nem halasztott állapotok). */
export function isTippable(status: MatchStatus, kickoffAt: string | Date): boolean {
  const kickoff = typeof kickoffAt === 'string' ? new Date(kickoffAt) : kickoffAt;
  return (status === 'SCHEDULED' || status === 'TIMED') && kickoff.getTime() > Date.now();
}

export const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Csoportkör',
  LAST_32: 'Nyolcaddöntőbe jutásért',
  ROUND_OF_32: 'Nyolcaddöntőbe jutásért',
  LAST_16: 'Nyolcaddöntő',
  ROUND_OF_16: 'Nyolcaddöntő',
  QUARTER_FINALS: 'Negyeddöntő',
  SEMI_FINALS: 'Elődöntő',
  THIRD_PLACE: 'Bronzmeccs',
  FINAL: 'Döntő',
};

export function stageLabel(stage: string | null): string {
  if (!stage) return '';
  return STAGE_LABELS[stage] ?? stage;
}
