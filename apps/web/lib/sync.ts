import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExternalMatch } from './sports-data/provider';
import { createProvider } from './sports-data/football-data';

/** football-data.org versenykód — egyelőre fixen a labdarúgó-vb. */
export const COMPETITION_CODE = 'WC';

/**
 * Teljes meccsnaptár-szinkron: verseny, csapatok és meccsek upsertje.
 * Új meccsek (pl. kieséses ág párosításai), időpont-változások, halasztások.
 */
export async function syncMatches(admin: SupabaseClient) {
  const provider = createProvider();
  const { competition, matches } = await provider.fetchCompetition(COMPETITION_CODE);

  const { data: comp, error: compError } = await admin
    .from('competitions')
    .upsert(
      {
        external_id: competition.externalId,
        name: competition.name,
        sport: 'football',
        starts_at: competition.startsAt,
        ends_at: competition.endsAt,
      },
      { onConflict: 'external_id' },
    )
    .select('id')
    .single();
  if (compError) throw compError;

  // Csapatok kigyűjtése és upsertje
  const teamsByExternalId = new Map(
    matches
      .flatMap((m) => [m.homeTeam, m.awayTeam])
      .filter((t) => t !== null)
      .map((t) => [t.externalId, t]),
  );

  if (teamsByExternalId.size > 0) {
    const { error: teamsError } = await admin.from('teams').upsert(
      [...teamsByExternalId.values()].map((t) => ({
        external_id: t.externalId,
        name: t.name,
        short_name: t.shortName,
        crest_url: t.crestUrl,
      })),
      { onConflict: 'external_id' },
    );
    if (teamsError) throw teamsError;
  }

  const { data: teamRows, error: teamSelectError } = await admin
    .from('teams')
    .select('id, external_id');
  if (teamSelectError) throw teamSelectError;
  const teamIds = new Map(teamRows.map((t) => [t.external_id as string, t.id as number]));

  // Meccsek upsertje — a scored_at mezőhöz szándékosan nem nyúlunk
  const { error: matchError } = await admin.from('matches').upsert(
    matches.map((m) => ({
      competition_id: comp.id,
      external_id: m.externalId,
      home_team_id: m.homeTeam ? (teamIds.get(m.homeTeam.externalId) ?? null) : null,
      away_team_id: m.awayTeam ? (teamIds.get(m.awayTeam.externalId) ?? null) : null,
      stage: m.stage,
      group_name: m.group,
      kickoff_at: m.kickoffAt,
      status: m.status,
      home_score: m.homeScore,
      away_score: m.awayScore,
    })),
    { onConflict: 'external_id' },
  );
  if (matchError) throw matchError;

  return { teams: teamsByExternalId.size, matches: matches.length };
}

/**
 * Eredményfrissítés + pontszámítás. Gyakran fut (5 percenként), ezért
 * először megnézi, van-e egyáltalán dolga — ha nincs meccsablak, az
 * external API-t meg sem hívja.
 */
export async function updateResults(admin: SupabaseClient) {
  const windowEnd = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Minden már elkezdődött (vagy 15 percen belül kezdődő), de még le nem zárt
  // meccs frissítést igényel — szándékosan nincs alsó időkorlát, hogy egy
  // cron-kimaradás után is bepótolja a lemaradt eredményeket.
  const { count: liveCount, error: liveError } = await admin
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('status', ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'])
    .lte('kickoff_at', windowEnd);
  if (liveError) throw liveError;

  const { count: unscoredCount, error: unscoredError } = await admin
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'FINISHED')
    .is('scored_at', null);
  if (unscoredError) throw unscoredError;

  if (!liveCount && !unscoredCount) {
    return { skipped: true, updated: 0, scored: 0 };
  }

  const provider = createProvider();
  const { matches: external } = await provider.fetchCompetition(COMPETITION_CODE);
  const externalById = new Map<string, ExternalMatch>(external.map((m) => [m.externalId, m]));

  const { data: dbMatches, error: dbError } = await admin
    .from('matches')
    .select('id, external_id, status, home_score, away_score, kickoff_at, scored_at');
  if (dbError) throw dbError;

  let updated = 0;
  let scored = 0;

  for (const row of dbMatches) {
    const ext = externalById.get(row.external_id as string);
    if (!ext) continue;

    const changed =
      ext.status !== row.status ||
      ext.homeScore !== row.home_score ||
      ext.awayScore !== row.away_score ||
      new Date(ext.kickoffAt).getTime() !== new Date(row.kickoff_at as string).getTime();

    if (changed) {
      const { error } = await admin
        .from('matches')
        .update({
          status: ext.status,
          home_score: ext.homeScore,
          away_score: ext.awayScore,
          kickoff_at: ext.kickoffAt,
        })
        .eq('id', row.id);
      if (error) throw error;
      updated++;
    }

    const finishedWithResult =
      ext.status === 'FINISHED' && ext.homeScore !== null && ext.awayScore !== null;
    if (finishedWithResult && row.scored_at === null) {
      const { error } = await admin.rpc('score_match', { p_match_id: row.id });
      if (error) throw error;
      scored++;
    }
  }

  return { skipped: false, updated, scored };
}
