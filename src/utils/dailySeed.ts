/**
 * Daily puzzle seeding (research #3).
 * Deterministic random from date string - same puzzle for all users on same date.
 */
export function seedRandom(seed: string): () => number {
  // mulberry32 — clean PRNG, well-distributed
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailyPuzzleIndex(dateStr: string, totalCount: number): number {
  const rand = seedRandom(dateStr);
  return Math.floor(rand() * totalCount);
}

/** Get today's date as YYYY-MM-DD using local time (not UTC) */
export function getTodayDateStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
