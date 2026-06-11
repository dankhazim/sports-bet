export interface Score {
  home: number;
  away: number;
}

/**
 * Pontszámítás — a Supabase `score_tip` SQL függvény tükörképe.
 * A két implementációnak mindig szinkronban kell lennie!
 *
 *  3 pont – pontos eredmény
 *  2 pont – jó kimenetel és jó gólkülönbség
 *  1 pont – csak a kimenetel jó (1X2)
 *  0 pont – rossz kimenetel
 */
export function scoreTip(tip: Score, result: Score): 0 | 1 | 2 | 3 {
  if (tip.home === result.home && tip.away === result.away) return 3;
  const tipDiff = tip.home - tip.away;
  const resultDiff = result.home - result.away;
  if (tipDiff === resultDiff) return 2;
  if (Math.sign(tipDiff) === Math.sign(resultDiff)) return 1;
  return 0;
}
