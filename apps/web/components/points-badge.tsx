const STYLES: Record<number, string> = {
  5: 'bg-emerald-400 text-zinc-950',
  3: 'bg-lime-400 text-zinc-950',
  2: 'bg-amber-400 text-zinc-950',
  1: 'bg-orange-400 text-zinc-950',
  0: 'bg-zinc-800 text-zinc-500',
};

export function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-9 items-center justify-center rounded-full px-1.5 text-xs font-bold ${STYLES[points] ?? STYLES[0]}`}
    >
      +{points}
    </span>
  );
}
