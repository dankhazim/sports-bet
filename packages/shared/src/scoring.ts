export interface Score {
  home: number;
  away: number;
}

/**
 * Pontszámítás — a Supabase `score_tip` SQL függvény tükörképe.
 * A két implementációnak mindig szinkronban kell lennie!
 *
 *  5 pont – pontos végeredmény
 *  3 pont – jó kimenetel és jó gólkülönbség
 *  2 pont – jó kimenetel és az egyik csapat gólszáma stimmel
 *  1 pont – csak a kimenetel jó (1X2)
 *  0 pont – rossz kimenetel
 *
 * Eltalált döntetlennél a gólkülönbség (0) mindig egyezik, ezért a nem
 * pontos döntetlen 3 pontot ér.
 */
export function scoreTip(tip: Score, result: Score): 0 | 1 | 2 | 3 | 5 {
  if (tip.home === result.home && tip.away === result.away) return 5;
  const tipDiff = tip.home - tip.away;
  const resultDiff = result.home - result.away;
  if (Math.sign(tipDiff) !== Math.sign(resultDiff)) return 0;
  if (tipDiff === resultDiff) return 3;
  if (tip.home === result.home || tip.away === result.away) return 2;
  return 1;
}
