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
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-500">{user!.email}</p>
        <form action={updateDisplayName} className="space-y-2">
          <label htmlFor="display_name" className="block text-sm font-medium">
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
              className="h-10 flex-1 rounded-lg border border-zinc-300 px-3 text-sm focus:border-pitch focus:outline-none"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-pitch px-4 text-sm font-semibold text-white"
            >
              Mentés
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-2 font-semibold">Pontozás 📋</h2>
        <ul className="space-y-1 text-zinc-600">
          <li>🎯 Pontos eredmény: <strong>3 pont</strong></li>
          <li>📐 Jó kimenetel + gólkülönbség: <strong>2 pont</strong></li>
          <li>✅ Csak a kimenetel jó: <strong>1 pont</strong></li>
          <li>❌ Rossz kimenetel: <strong>0 pont</strong></li>
        </ul>
        <p className="mt-2 text-xs text-zinc-400">
          A rendes játékidő (90 perc) eredményét tippeljük, a kieséses szakaszban is.
          Tippelni a meccs kezdetéig lehet.
        </p>
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 shadow-sm"
        >
          Kijelentkezés
        </button>
      </form>
    </main>
  );
}
