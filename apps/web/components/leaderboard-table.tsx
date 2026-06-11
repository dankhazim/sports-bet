import type { LeaderboardRow } from '@/lib/types';

export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="py-2 font-medium">Játékos</th>
            <th className="py-2 text-center font-medium" title="Pontos találatok">
              🎯
            </th>
            <th className="px-3 py-2 text-right font-medium">Pont</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-zinc-50 last:border-0 ${
                row.id === currentUserId ? 'bg-green-50' : ''
              }`}
            >
              <td className="px-3 py-2.5 text-zinc-500">{medals[i] ?? i + 1}</td>
              <td className="py-2.5 font-medium">
                {row.display_name}
                {row.id === currentUserId && (
                  <span className="ml-1 text-xs font-normal text-pitch">(te)</span>
                )}
              </td>
              <td className="py-2.5 text-center text-zinc-500">{row.exact_hits}</td>
              <td className="px-3 py-2.5 text-right text-base font-bold tabular-nums">
                {row.total_points}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                Még nincs regisztrált játékos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
