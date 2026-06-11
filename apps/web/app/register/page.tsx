'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    if (data.session) {
      router.push('/');
      router.refresh();
    } else {
      // E-mail-megerősítés van bekapcsolva a Supabase-ben
      setInfo('Megerősítő e-mailt küldtünk — kattints a benne lévő linkre, utána léphetsz be.');
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🏆 VB Tippelő</h1>
        <p className="mt-1 text-sm text-zinc-500">Hozz létre egy fiókot</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Megjelenített név (ezt látják a többiek)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          minLength={2}
          maxLength={32}
          required
          className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm focus:border-pitch focus:outline-none"
        />
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
          autoComplete="new-password"
          placeholder="Jelszó (legalább 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm focus:border-pitch focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-pitch">{info}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-pitch text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Regisztráció…' : 'Regisztráció'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Van már fiókod?{' '}
        <Link href="/login" className="font-semibold text-pitch">
          Lépj be!
        </Link>
      </p>
    </main>
  );
}
