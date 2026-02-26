// Daily challenge generation for Change by One (no database — uses static JSON + date seed)

export interface CboPair {
  start_word: string;
  end_word: string;
  optimal_steps: number;
}

export interface CboPuzzle {
  length: number;
  start_word: string;
  end_word: string;
  optimal_steps: number;
  max_moves: number;
}

export interface CboDailyChallenge {
  date: string;
  puzzles: CboPuzzle[];
}

// Seeded PRNG (mulberry32)
function seededRng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  // Deterministic seed from YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (Math.imul(31, hash) + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getTodayCboDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function loadCboDailyChallenge(dateStr?: string): Promise<CboDailyChallenge> {
  const date = dateStr ?? getTodayCboDateStr();
  const seed = dateToSeed(date);
  const rng = seededRng(seed);

  const lengths = [4, 5, 6, 7];
  const pairFiles: Record<number, string> = {
    4: '/cbo-pairs-4.json',
    5: '/cbo-pairs-5.json',
    6: '/cbo-pairs-6.json',
    7: '/cbo-pairs-7.json',
  };
  const maxMoves: Record<number, number> = { 4: 10, 5: 12, 6: 12, 7: 14 };

  // Fetch all pair files in parallel
  const fetches = lengths.map(len => fetch(pairFiles[len]).then(r => r.json() as Promise<CboPair[]>));
  const allPairs = await Promise.all(fetches);

  const puzzles: CboPuzzle[] = lengths.map((len, i) => {
    const pairs = allPairs[i];
    const idx = Math.floor(rng() * pairs.length);
    const pair = pairs[idx];
    return {
      length: len,
      start_word: pair.start_word,
      end_word: pair.end_word,
      optimal_steps: pair.optimal_steps,
      max_moves: maxMoves[len],
    };
  });

  return { date, puzzles };
}
