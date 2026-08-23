// 7 LETTERS game logic — pure functions, no React.
// A daily board is 7 letters with one required CENTER letter. Words must be
// 3+ letters, contain the center letter, and use only the 7 given letters.

export interface SevenLettersBoard {
  id: number;
  letters: string[];   // exactly 7 distinct lowercase letters
  center: string;      // one of letters
  words: string[];     // every valid word for this board
  maxScore: number;
  tiers: {
    good: number;      // score cutoffs (35% / 60% / 80% of maxScore)
    great: number;
    genius: number;
  };
}

export interface SevenLettersGameState {
  board: SevenLettersBoard | null;
  foundWords: string[];
  score: number;
}

// ── Solver ─────────────────────────────────────────────────────────────────

/**
 * Given the 7 board letters (with duplicates ignored — boards have distinct
 * letters) and the center letter, return every word from `dictionary`
 * that is 3+ letters, contains the center, and uses only board letters.
 */
export function solveSevenBoard(
  letters: string[],
  center: string,
  dictionary: string[]
): string[] {
  const set = new Set(letters.map((l) => l.toLowerCase()));
  const counts: Record<string, number> = {};
  for (const l of set) counts[l] = (counts[l] ?? 0) + 1;

  const out: string[] = [];
  for (const raw of dictionary) {
    const w = raw.toLowerCase();
    if (w.length < 3 || w.length > 7) continue;
    if (!w.includes(center)) continue;

    const need: Record<string, number> = {};
    let ok = true;
    for (const ch of w) {
      if (!set.has(ch)) { ok = false; break; }
      need[ch] = (need[ch] ?? 0) + 1;
      if (need[ch] > (counts[ch] ?? 0)) { ok = false; break; }
    }
    if (ok) out.push(w);
  }
  return [...new Set(out)].sort();
}

// ── Scoring ────────────────────────────────────────────────────────────────

export function isPangram(word: string, board: SevenLettersBoard): boolean {
  if (word.length !== board.letters.length) return false;
  const set = new Set(board.letters);
  for (const ch of word) if (!set.has(ch)) return false;
  // boards have distinct letters, so length match + subset == uses all 7
  return true;
}

/** 3-letter word = 1 pt; 4+ letters = 1 pt/letter; pangram = +7 bonus. */
export function scoreWord(word: string, board: SevenLettersBoard): number {
  const base = word.length === 3 ? 1 : word.length;
  return isPangram(word, board) ? base + 7 : base;
}

export function maxScoreFor(words: string[], board: SevenLettersBoard): number {
  return words.reduce((sum, w) => sum + scoreWord(w, board), 0);
}

export interface TierCutoffs {
  good: number;
  great: number;
  genius: number;
}

/** Daily tiers by % of max possible score: Good 35%, Great 60%, Genius 80%. */
export function tierCutoffs(maxScore: number): TierCutoffs {
  return {
    good: Math.ceil(maxScore * 0.35),
    great: Math.ceil(maxScore * 0.6),
    genius: Math.ceil(maxScore * 0.8),
  };
}

export type SevenTier = 'Beginner' | 'Good' | 'Great' | 'Genius';

export function tierFor(score: number, cutoffs: TierCutoffs): SevenTier {
  if (score >= cutoffs.genius) return 'Genius';
  if (score >= cutoffs.great) return 'Great';
  if (score >= cutoffs.good) return 'Good';
  return 'Beginner';
}

// ── Validation ─────────────────────────────────────────────────────────────

export function isValidWord(word: string, board: SevenLettersBoard): boolean {
  return board.words.includes(word.toLowerCase());
}

// ── Share text (same style as ORDERLE shareOrderleText) ────────────────────

const PANGRAM_EMOJI = '🟨';
const WORD_EMOJI = '🟩';

export function shareSevenText(
  foundWords: string[],
  boardNum: number,
  score: number,
  maxScore: number,
  board: SevenLettersBoard
): string {
  const pangrams = foundWords.filter((w) => isPangram(w, board));
  const grid = foundWords
    .slice()
    .sort()
    .map((w) => (isPangram(w, board) ? PANGRAM_EMOJI : WORD_EMOJI))
    .join('');
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const lines = [
    `7 LETTERS #${boardNum} ${score}/${maxScore} (${pct}%)`,
    `${board.center.toUpperCase()} + ${board.letters.filter((l) => l !== board.center).map((l) => l.toUpperCase()).join(' ')}`,
  ];
  lines.push(grid.slice(0, 60));
  if (pangrams.length > 0) lines.push(`🌟 ${pangrams.map((p) => p.toUpperCase()).join(', ')}`);
  lines.push('wordcrafthub — seven letters, one center');
  return lines.join('\n');
}
