import { describe, expect, it } from 'vitest';
import { scoreTip } from './scoring';

describe('scoreTip', () => {
  it('pontos eredmény → 3 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(3);
    expect(scoreTip({ home: 0, away: 0 }, { home: 0, away: 0 })).toBe(3);
  });

  it('jó kimenetel + gólkülönbség → 2 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 3, away: 2 })).toBe(2);
    expect(scoreTip({ home: 0, away: 2 }, { home: 1, away: 3 })).toBe(2);
  });

  it('nem pontos döntetlen tipp → 2 pont (a gólkülönbség döntetlennél mindig egyezik)', () => {
    expect(scoreTip({ home: 1, away: 1 }, { home: 2, away: 2 })).toBe(2);
    expect(scoreTip({ home: 0, away: 0 }, { home: 3, away: 3 })).toBe(2);
  });

  it('csak kimenetel jó → 1 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 3, away: 1 })).toBe(1);
    expect(scoreTip({ home: 0, away: 1 }, { home: 2, away: 4 })).toBe(1);
  });

  it('rossz kimenetel → 0 pont', () => {
    expect(scoreTip({ home: 2, away: 1 }, { home: 1, away: 1 })).toBe(0);
    expect(scoreTip({ home: 2, away: 1 }, { home: 0, away: 1 })).toBe(0);
    expect(scoreTip({ home: 1, away: 1 }, { home: 1, away: 0 })).toBe(0);
  });
});
