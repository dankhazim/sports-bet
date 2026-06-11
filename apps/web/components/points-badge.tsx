const STYLES: Record<number, string> = {
  3: 'bg-green-600 text-white',
  2: 'bg-lime-500 text-white',
  1: 'bg-amber-400 text-zinc-900',
  0: 'bg-zinc-200 text-zinc-500',
};

export function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-9 items-center justify-center rounded-full px-1.5 text-xs font-bold ${STYLES[points]}`}
    >
      +{points}
    </span>
  );
}
