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

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🏆 VB Tippelő</h1>
        <p className="mt-1 text-sm text-zinc-500">Jelentkezz be a tippeléshez</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="email"
          autoComplete="email"
          placeholder="E-mail-cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm focus:border-pitch focus:outline-none"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm focus:border-pitch focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-pitch text-sm font-semibold text-white disabled:opacity-50"
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
