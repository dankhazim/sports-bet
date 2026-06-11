import { createClient } from '@/lib/supabase/server';
import { MatchCard } from '@/components/match-card';
import type { MatchWithTeams, Tip } from '@/lib/types';

interface TipWithMatch extends Tip {
  match: MatchWithTeams;
}

export default async function MyTipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('tips')
    .select(
      '*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))',
    )
    .eq('user_id', user!.id);

  const tips = ((data ?? []) as unknown as TipWithMatch[]).sort(
    (a, b) => new Date(b.match.kickoff_at).getTime() - new Date(a.match.kickoff_at).getTime(),
  );

  const scored = tips.filter((t) => t.points !== null);
  const totalPoints = scored.reduce((sum, t) => sum + (t.points ?? 0), 0);
  const exactHits = scored.filter((t) => t.points === 3).length;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Tippjeim</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Összpont" value={totalPoints} />
        <Stat label="Telitalálat" value={exactHits} />
        <Stat label="Leadott tipp" value={tips.length} />
      </div>

      <div className="space-y-3">
        {tips.map((tip) => (
          <MatchCard key={tip.id} match={tip.match} tip={tip} />
        ))}
        {tips.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-zinc-400 shadow-sm">
            Még nem adtál le tippet — irány a meccsek oldal! ⚽
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
