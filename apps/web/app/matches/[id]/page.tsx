import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MatchCard } from '@/components/match-card';
import { PointsBadge } from '@/components/points-badge';
import {
  MATCH_SELECT_WITH_TEAMS,
  type MatchWithTeams,
  type Tip,
} from '@/lib/types';

interface TipWithProfile extends Tip {
  profile: { display_name: string } | null;
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matchData } = await supabase
    .from('matches')
    .select(MATCH_SELECT_WITH_TEAMS)
    .eq('id', matchId)
    .single();
  if (!matchData) notFound();
  const match = matchData as unknown as MatchWithTeams;

  // Kezdés előtt az RLS miatt csak a saját tipp jön vissza
  const { data: tipData } = await supabase
    .from('tips')
    .select('*, profile:profiles(display_name)')
    .eq('match_id', matchId);
  const tips = (tipData ?? []) as unknown as TipWithProfile[];

  const ownTip = tips.find((t) => t.user_id === user!.id) ?? null;
  const kickoffPassed = new Date(match.kickoff_at).getTime() <= Date.now();
  const otherTips = [...tips].sort(
    (a, b) =>
      (b.points ?? -1) - (a.points ?? -1) ||
      (a.profile?.display_name ?? '').localeCompare(b.profile?.display_name ?? '', 'hu'),
  );

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Meccs</h1>

      <MatchCard match={match} tip={ownTip} linkToDetail={false} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Tippek
        </h2>
        {kickoffPassed ? (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {otherTips.map((tip) => (
              <div
                key={tip.id}
                className={`flex items-center justify-between border-b border-zinc-50 px-3 py-2.5 last:border-0 ${
                  tip.user_id === user!.id ? 'bg-green-50' : ''
                }`}
              >
                <span className="text-sm font-medium">
                  {tip.profile?.display_name ?? 'Ismeretlen'}
                  {tip.user_id === user!.id && (
                    <span className="ml-1 text-xs font-normal text-pitch">(te)</span>
                  )}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <strong className="tabular-nums">
                    {tip.home_score} – {tip.away_score}
                  </strong>
                  <PointsBadge points={tip.points} />
                </span>
              </div>
            ))}
            {otherTips.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-zinc-400">
                Erre a meccsre senki nem tippelt.
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-zinc-400 shadow-sm">
            A többiek tippje a meccs kezdetekor válik láthatóvá. 🤫
          </p>
        )}
      </section>
    </main>
  );
}
