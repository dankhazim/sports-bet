import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MatchCard } from '@/components/match-card';
import { dayKey, formatDay } from '@/lib/format';
import { buildRounds, defaultRoundKey, roundKeyOf } from '@/lib/rounds';
import {
  MATCH_SELECT_WITH_TEAMS,
  type MatchWithTeams,
  type Tip,
} from '@/lib/types';

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: matchData }, { data: tipData }, params] = await Promise.all([
    supabase
      .from('matches')
      .select(MATCH_SELECT_WITH_TEAMS)
      .order('kickoff_at', { ascending: true }),
    supabase.from('tips').select('*').eq('user_id', user!.id),
    searchParams,
  ]);

  const matches = (matchData ?? []) as unknown as MatchWithTeams[];
  const tipByMatch = new Map((tipData ?? []).map((t: Tip) => [t.match_id, t]));

  const rounds = buildRounds(matches);
  const requested = rounds.find((r) => r.key === params.round)?.key;
  const selectedKey = requested ?? defaultRoundKey(matches, rounds);
  const roundMatches = matches.filter((m) => roundKeyOf(m) === selectedKey);

  const days = new Map<string, MatchWithTeams[]>();
  for (const match of roundMatches) {
    const key = dayKey(match.kickoff_at);
    const list = days.get(key) ?? [];
    list.push(match);
    days.set(key, list);
  }
  const todayKey = dayKey(new Date().toISOString());

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meccsek</h1>

      {/* Forduló-választó */}
      <nav className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {rounds.map((round) => (
          <Link
            key={round.key}
            href={`/matches?round=${round.key}`}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              round.key === selectedKey
                ? 'border-pitch/40 bg-emerald-500/15 text-pitch'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
            }`}
          >
            {round.label}
          </Link>
        ))}
      </nav>

      {matches.length === 0 && (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center text-sm text-zinc-500">
          Még nincsenek betöltve a meccsek — futtasd le a meccs-szinkron cront.
        </p>
      )}

      {[...days.entries()].map(([key, dayMatches]) => (
        <section key={key} className="space-y-3">
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
