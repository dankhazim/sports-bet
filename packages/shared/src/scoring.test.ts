import { describe, expect, it } from 'vitest';
import { scoreTip } from './scoring';

describe('scoreTip', () => {
  it('pontos végeredmény → 5 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(5);
    expect(scoreTip({ home: 0, away: 0 }, { home: 0, away: 0 })).toBe(5);
  });

  it('jó kimenetel + gólkülönbség → 3 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 3, away: 2 })).toBe(3);
    expect(scoreTip({ home: 0, away: 2 }, { home: 1, away: 3 })).toBe(3);
  });

  it('nem pontos döntetlen → 3 pont (a gólkülönbség döntetlennél mindig egyezik)', () => {
    expect(scoreTip({ home: 1, away: 1 }, { home: 2, away: 2 })).toBe(3);
    expect(scoreTip({ home: 0, away: 0 }, { home: 3, away: 3 })).toBe(3);
  });

  it('jó kimenetel + az egyik csapat gólszáma stimmel → 2 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 3, away: 1 })).toBe(2); // vendég gólszám egyezik
    expect(scoreTip({ home: 2, away: 1 }, { home: 2, away: 0 })).toBe(2); // hazai gólszám egyezik
    expect(scoreTip({ home: 0, away: 2 }, { home: 1, away: 2 })).toBe(2);
  });

  it('csak a kimenetel jó → 1 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 3, away: 0 })).toBe(1);
    expect(scoreTip({ home: 0, away: 1 }, { home: 2, away: 4 })).toBe(1);
  });

  it('rossz kimenetel → 0 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 1, away: 1 })).toBe(0);
    expect(scoreTip({ home: 2, away: 1 }, { home: 0, away: 1 })).toBe(0);
    expect(scoreTip({ home: 1, away: 1 }, { home: 1, away: 0 })).toBe(0);
    // egyező gólszám sem ér pontot, ha a kimenetel rossz
    expect(scoreTip({ home: 2, away: 1 }, { home: 2, away: 3 })).toBe(0);
  });
});
