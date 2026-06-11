'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isTippable, type MatchStatus } from '@sports-bet/shared';
import { createClient } from '@/lib/supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function submitTip(
  matchId: number,
  homeScore: number,
  awayScore: number,
): Promise<ActionResult> {
  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    homeScore > 99 ||
    awayScore < 0 ||
    awayScore > 99
  ) {
    return { ok: false, error: 'Érvénytelen eredmény.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Nem vagy bejelentkezve.' };

  const { data: match } = await supabase
    .from('matches')
    .select('id, kickoff_at, status')
    .eq('id', matchId)
    .single();
  if (!match) return { ok: false, error: 'A meccs nem található.' };

  if (!isTippable(match.status as MatchStatus, match.kickoff_at)) {
    return { ok: false, error: 'A tippelés erre a meccsre már lezárult.' };
  }

  const { error } = await supabase.from('tips').upsert(
    {
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    },
    { onConflict: 'user_id,match_id' },
  );
  if (error) {
    // Az RLS is elutasítja a kezdés utáni tippet — versenyhelyzetben ide futunk
    return { ok: false, error: 'A tipp mentése nem sikerült. Lehet, hogy a meccs már elkezdődött.' };
  }

  revalidatePath('/');
  revalidatePath('/matches');
  revalidatePath('/my-tips');
  return { ok: true };
}

export async function updateDisplayName(formData: FormData): Promise<void> {
  const displayName = String(formData.get('display_name') ?? '').trim();
  if (displayName.length < 2 || displayName.length > 32) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
  revalidatePath('/', 'layout');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
