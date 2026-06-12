import { createClient } from '@/lib/supabase/server';
import { MatchCard } from '@/components/match-card';
import { dayKey, formatDay } from '@/lib/format';
import {
  MATCH_SELECT_WITH_TEAMS,
  type MatchWithTeams,
  type Tip,
} from '@/lib/types';

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: matchData }, { data: tipData }] = await Promise.all([
    supabase
      .from('matches')
      .select(MATCH_SELECT_WITH_TEAMS)
      .order('kickoff_at', { ascending: true }),
    supabase.from('tips').select('*').eq('user_id', user!.id),
  ]);

  const matches = (matchData ?? []) as unknown as MatchWithTeams[];
  const tipByMatch = new Map((tipData ?? []).map((t: Tip) => [t.match_id, t]));

  const days = new Map<string, MatchWithTeams[]>();
  for (const match of matches) {
    const key = dayKey(match.kickoff_at);
    const list = days.get(key) ?? [];
    list.push(match);
    days.set(key, list);
  }
  const todayKey = dayKey(new Date().toISOString());

  return (
    <main className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-white">Meccsek</h1>
        {days.has(todayKey) && (
          <a href={`#day-${todayKey}`} className="text-sm font-medium text-pitch">
            Ugrás a mai naphoz ↓
          </a>
        )}
      </div>

      {matches.length === 0 && (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center text-sm text-zinc-500">
          Még nincsenek betöltve a meccsek — futtasd le a meccs-szinkron cront.
        </p>
      )}

      {[...days.entries()].map(([key, dayMatches]) => (
        <section key={key} id={`day-${key}`} className="scroll-mt-4 space-y-3 md:scroll-mt-20">
          <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            {formatDay(dayMatches[0].kickoff_at)}
            {key === todayKey && ' · ma'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} tip={tipByMatch.get(match.id)} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
