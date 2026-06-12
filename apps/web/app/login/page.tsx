'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Hibás e-mail-cím vagy jelszó.');
      setPending(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  const inputClass =
    'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-pitch focus:ring-1 focus:ring-pitch/40 focus:outline-none';

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">⚽ VB Tippelő</h1>
        <p className="mt-1 text-sm text-zinc-500">Jelentkezz be a tippeléshez</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
      >
        <input
          type="email"
          autoComplete="email"
          placeholder="E-mail-cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl bg-pitch-strong text-sm font-bold text-zinc-950 transition-colors hover:bg-pitch disabled:opacity-50"
        >
          {pending ? 'Belépés…' : 'Belépés'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Nincs még fiókod?{' '}
        <Link href="/register" className="font-semibold text-pitch">
          Regisztrálj!
        </Link>
      </p>
    </main>
  );
}
