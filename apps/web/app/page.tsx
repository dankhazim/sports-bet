import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { MatchCard } from '@/components/match-card';
import {
  MATCH_SELECT_WITH_TEAMS,
  type LeaderboardRow,
  type MatchWithTeams,
  type Tip,
} from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const liveWindowStart = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const [{ data: leaderboard }, { data: matches }] = await Promise.all([
    supabase.from('leaderboard').select('*'),
    supabase
      .from('matches')
      .select(MATCH_SELECT_WITH_TEAMS)
      .in('status', ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'])
      .gte('kickoff_at', liveWindowStart)
      .order('kickoff_at', { ascending: true })
      .limit(6),
  ]);

  const upcoming = (matches ?? []) as unknown as MatchWithTeams[];

  const { data: tips } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', user!.id)
    .in('match_id', upcoming.map((m) => m.id));
  const tipByMatch = new Map((tips ?? []).map((t: Tip) => [t.match_id, t]));

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold md:hidden">🏆 VB Tippelő</h1>

      <div className="space-y-6 md:grid md:grid-cols-5 md:items-start md:gap-8 md:space-y-0">
        <section className="space-y-2 md:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Ranglista
          </h2>
          <LeaderboardTable
            rows={(leaderboard ?? []) as LeaderboardRow[]}
            currentUserId={user!.id}
          />
        </section>

        <section className="space-y-2 md:col-span-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
              Következő meccsek
            </h2>
            <Link href="/matches" className="text-sm font-medium text-pitch">
              Összes meccs →
            </Link>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} tip={tipByMatch.get(match.id)} />
            ))}
            {upcoming.length === 0 && (
              <p className="rounded-xl bg-white p-4 text-center text-sm text-zinc-400 shadow-sm xl:col-span-2">
                Nincs közelgő meccs. (Ha most állítottad be az appot, futtasd le a
                meccs-szinkron cront!)
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
