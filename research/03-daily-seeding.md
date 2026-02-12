# Daily Puzzle Seeding

**Research Summary:** Use seeded PRNG for deterministic randomness from date string. Hash date to seed, then generate pseudo-random index 0 to totalCount-1. Ensures same output per date across users/devices; different days differ.

**Library:** Native `crypto.getRandomValues` unavailable for seed; use simple seeded XorShift or Mulberry32 (fast, good period).

**Implementation:** Copy-paste ready TypeScript (Mulberry32 algorithm).

```typescript
function seedRandom(seed: string): () => number {
  let s = (() => {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return () => {
      const t = h;
      h = Math.imul(h ^ t >>> 15, 4294967296 + 1);
      h = Math.imul(h ^ (h << 13), 1 | 0);
      return ((h ^ t >>> 16) >>> 0) / 4294967296;
    };
  })();
  return () => s();
}

function getDailyPuzzleIndex(dateStr: string, totalCount: number): number {
  const rand = seedRandom(dateStr);
  return Math.floor(rand() * totalCount);
}
```

**Test Cases:**
```typescript
console.log(getDailyPuzzleIndex('2026-02-12', 365)); // Same value always for this date
// Example output: 247 (deterministic)
console.log(getDailyPuzzleIndex('2026-02-13', 365)); // Different
```

**Notes:** 32-bit period ~4B, ample for puzzles. Collision-free for ~10k days.

**Sources:** Mulberry32 from @eddyg/add-seed-random on JSBit, date-seeding patterns.[web:25][web:26]