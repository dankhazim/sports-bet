'use client';

import { useState, useTransition } from 'react';
import { submitTip } from '@/lib/actions';

interface Props {
  matchId: number;
  initialHome: number | null;
  initialAway: number | null;
}

export function TipForm({ matchId, initialHome, initialAway }: Props) {
  const [home, setHome] = useState(initialHome?.toString() ?? '');
  const [away, setAway] = useState(initialAway?.toString() ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSave = home !== '' && away !== '' && !pending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitTip(matchId, Number(home), Number(away));
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? 'Hiba történt.');
      }
    });
  }

  const inputClass =
    'h-10 w-12 rounded-lg border border-zinc-300 bg-white text-center text-base font-semibold focus:border-pitch focus:outline-none';

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          aria-label="Hazai gólok"
          className={inputClass}
        />
        <span className="text-zinc-400">–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          aria-label="Vendég gólok"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!canSave}
          className="h-10 rounded-lg bg-pitch px-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {pending ? '…' : saved ? '✓' : 'Tipp'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
