import { createClient } from '@/lib/supabase/server';
import { signOut, updateDisplayName } from '@/lib/actions';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single();

  return (
    <main className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Profil</h1>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <p className="text-sm text-zinc-500">{user!.email}</p>
        <form action={updateDisplayName} className="space-y-2">
          <label htmlFor="display_name" className="block text-sm font-medium text-zinc-300">
            Megjelenített név
          </label>
          <div className="flex gap-2">
            <input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ''}
              minLength={2}
              maxLength={32}
              required
              className="h-10 flex-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 text-sm text-white focus:border-pitch focus:ring-1 focus:ring-pitch/40 focus:outline-none"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-pitch-strong px-4 text-sm font-bold text-zinc-950 transition-colors hover:bg-pitch"
            >
              Mentés
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm">
        <h2 className="mb-2 font-semibold text-white">Pontozás 📋</h2>
        <ul className="space-y-1 text-zinc-400">
          <li>🎯 Pontos eredmény: <strong className="text-zinc-100">3 pont</strong></li>
          <li>📐 Jó kimenetel + gólkülönbség: <strong className="text-zinc-100">2 pont</strong></li>
          <li>✅ Csak a kimenetel jó: <strong className="text-zinc-100">1 pont</strong></li>
          <li>❌ Rossz kimenetel: <strong className="text-zinc-100">0 pont</strong></li>
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          A rendes játékidő (90 perc) eredményét tippeljük, a kieséses szakaszban is.
          Tippelni a meccs kezdetéig lehet.
        </p>
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-2xl border border-red-500/30 bg-zinc-900/70 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
        >
          Kijelentkezés
        </button>
      </form>
    </main>
  );
}
