import Link from 'next/link';
import { isTippable, stageLabel } from '@sports-bet/shared';
import type { MatchWithTeams, Team, Tip } from '@/lib/types';
import { formatKickoff } from '@/lib/format';
import { TipForm } from './tip-form';
import { PointsBadge } from './points-badge';

function TeamLabel({ team, align }: { team: Team | null; align: 'left' | 'right' }) {
  return (
    <div
      className={`flex flex-1 items-center gap-1.5 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {team?.crest_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.crest_url} alt="" className="h-6 w-6 shrink-0 object-contain" />
      ) : (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-200 text-xs">
          ?
        </span>
      )}
      <span className="text-sm leading-tight font-medium">
        {team?.name ?? 'Később derül ki'}
      </span>
    </div>
  );
}

function StatusBadge({ match }: { match: MatchWithTeams }) {
  if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" /> ÉLŐ
      </span>
    );
  }
  if (match.status === 'FINISHED') {
    return <span className="text-xs font-medium text-zinc-500">Vége</span>;
  }
  if (match.status === 'POSTPONED') {
    return <span className="text-xs font-medium text-orange-600">Elhalasztva</span>;
  }
  if (match.status === 'CANCELLED') {
    return <span className="text-xs font-medium text-red-600">Törölve</span>;
  }
  return <span className="text-xs text-zinc-500">{formatKickoff(match.kickoff_at)}</span>;
}

export function MatchCard({
  match,
  tip,
  linkToDetail = true,
}: {
  match: MatchWithTeams;
  tip?: Tip | null;
  linkToDetail?: boolean;
}) {
  const tippable = isTippable(match.status, match.kickoff_at);
  const hasScore = match.home_score !== null && match.away_score !== null;

  const header = (
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <span>
        {match.group_name ?? stageLabel(match.stage)}
        {linkToDetail && ' ›'}
      </span>
      <StatusBadge match={match} />
    </div>
  );

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      {linkToDetail ? <Link href={`/matches/${match.id}`}>{header}</Link> : header}

      <div className="mt-2 flex items-center gap-2">
        <TeamLabel team={match.home_team} align="left" />
        <div className="min-w-14 text-center text-lg font-bold tabular-nums">
          {hasScore ? `${match.home_score} – ${match.away_score}` : '–'}
        </div>
        <TeamLabel team={match.away_team} align="right" />
      </div>

      <div className="mt-2 border-t border-zinc-100 pt-2">
        {tippable ? (
          <TipForm
            matchId={match.id}
            initialHome={tip?.home_score ?? null}
            initialAway={tip?.away_score ?? null}
          />
        ) : tip ? (
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
            <span>
              Tipped: <strong>{tip.home_score} – {tip.away_score}</strong>
            </span>
            <PointsBadge points={tip.points} />
          </div>
        ) : (
          <p className="text-center text-xs text-zinc-400">Nem adtál le tippet</p>
        )}
      </div>
    </div>
  );
}
