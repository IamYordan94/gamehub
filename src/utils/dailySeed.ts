/**
 * Daily puzzle seeding (research #3).
 * Deterministic random from date string - same puzzle for all users on same date.
 */
export function seedRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    const t = h;
    h = Math.imul(h ^ (t >>> 15), 4294967296 + 1);
    h = Math.imul(h ^ (h << 13), 1 | 0);
    return ((h ^ (t >>> 16)) >>> 0) / 4294967296;
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
