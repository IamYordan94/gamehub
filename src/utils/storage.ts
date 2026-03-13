// Web storage — all state lives in localStorage.

const LM_COMPLETED = 'wordcraft_lettermix_completed';
export const WP_PROGRESS = 'wordcraft_wordpool_progress';
const WP_SESSION = 'wordcraft_wordpool_session';
const HINT_TARGET = 'wordcraft_hint_target';

export type HintTarget = { targetWord: string; hintLevel: number };
export type LetterMixCompleted = Record<string, { words: string[] }>;
export type WordPoolProgress = Record<string, number>; // categoryId -> highest unlocked level

// ── Helpers ────────────────────────────────────────────────────────────────

function letterMixKey(date: string, level: string): string {
  return `lettermix_${date}_${level}`;
}

function hintTargetKey(game: string, puzzleId: string): string {
  return `hint_${game}_${puzzleId}`;
}

function wpSessionKey(categoryId: string, levelNum: number): string {
  return `${categoryId}_${levelNum}`;
}

// ── LetterMix ──────────────────────────────────────────────────────────────

export function getLetterMixCompleted(): LetterMixCompleted {
  try {
    const s = localStorage.getItem(LM_COMPLETED);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function getLetterMixCompletedFor(date: string, level: string): { words: string[] } | undefined {
  return getLetterMixCompleted()[letterMixKey(date, level)];
}

export function setLetterMixCompleted(date: string, level: string, words: string[]) {
  const data = getLetterMixCompleted();
  data[letterMixKey(date, level)] = { words };
  localStorage.setItem(LM_COMPLETED, JSON.stringify(data));
}

// ── WordPool progress ───────────────────────────────────────────────────────

export function getWordPoolProgress(): WordPoolProgress {
  try {
    const s = localStorage.getItem(WP_PROGRESS);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function getWordPoolUnlockedLevel(categoryId: string): number {
  return getWordPoolProgress()[categoryId] ?? 1;
}

export function unlockWordPoolLevel(categoryId: string, completedLevel: number) {
  const data = getWordPoolProgress();
  const current = data[categoryId] ?? 1;
  if (completedLevel >= current) {
    data[categoryId] = completedLevel + 1;
    localStorage.setItem(WP_PROGRESS, JSON.stringify(data));
  }
}

// ── WordPool session ────────────────────────────────────────────────────────

type WordPoolSession = Record<string, string[]>;

export function getWordPoolSessionWords(categoryId: string, levelNum: number): string[] {
  try {
    const s = localStorage.getItem(WP_SESSION);
    const data: WordPoolSession = s ? JSON.parse(s) : {};
    return data[wpSessionKey(categoryId, levelNum)] ?? [];
  } catch {
    return [];
  }
}

export function saveWordPoolSessionWords(categoryId: string, levelNum: number, words: string[]) {
  try {
    const s = localStorage.getItem(WP_SESSION);
    const data: WordPoolSession = s ? JSON.parse(s) : {};
    data[wpSessionKey(categoryId, levelNum)] = words;
    localStorage.setItem(WP_SESSION, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearWordPoolSessionWords(categoryId: string, levelNum: number) {
  try {
    const s = localStorage.getItem(WP_SESSION);
    const data: WordPoolSession = s ? JSON.parse(s) : {};
    delete data[wpSessionKey(categoryId, levelNum)];
    localStorage.setItem(WP_SESSION, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ── Hint target ─────────────────────────────────────────────────────────────

export async function getHintTargetAsync(game: string, puzzleId: string): Promise<HintTarget | null> {
  try {
    const s = localStorage.getItem(HINT_TARGET);
    const data: Record<string, HintTarget> = s ? JSON.parse(s) : {};
    return data[hintTargetKey(game, puzzleId)] ?? null;
  } catch {
    return null;
  }
}

export async function setHintTargetAsync(
  game: string,
  puzzleId: string,
  targetWord: string,
  hintLevel: number
): Promise<void> {
  try {
    const s = localStorage.getItem(HINT_TARGET);
    const data: Record<string, HintTarget> = s ? JSON.parse(s) : {};
    data[hintTargetKey(game, puzzleId)] = { targetWord, hintLevel };
    localStorage.setItem(HINT_TARGET, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function clearHintTargetAsync(game: string, puzzleId: string): Promise<void> {
  try {
    const s = localStorage.getItem(HINT_TARGET);
    const data: Record<string, HintTarget> = s ? JSON.parse(s) : {};
    delete data[hintTargetKey(game, puzzleId)];
    localStorage.setItem(HINT_TARGET, JSON.stringify(data));
  } catch {
    // ignore
  }
}
