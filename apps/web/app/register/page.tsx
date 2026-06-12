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

  const inputClass =
    'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-pitch focus:ring-1 focus:ring-pitch/40 focus:outline-none';

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">⚽ VB Tippelő</h1>
        <p className="mt-1 text-sm text-zinc-500">Hozz létre egy fiókot</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
      >
        <input
          type="text"
          placeholder="Megjelenített név (ezt látják a többiek)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          minLength={2}
          maxLength={32}
          required
          className={inputClass}
        />
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
          autoComplete="new-password"
          placeholder="Jelszó (legalább 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className={inputClass}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-pitch">{info}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl bg-pitch-strong text-sm font-bold text-zinc-950 transition-colors hover:bg-pitch disabled:opacity-50"
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
