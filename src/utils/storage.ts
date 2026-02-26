const LM_COMPLETED = 'wordcraft_lettermix_completed';
export const WP_PROGRESS = 'wordcraft_wordpool_progress';
const WP_SESSION = 'wordcraft_wordpool_session';

/** Key: `lettermix_${date}_${level}` → { words } */
export type LetterMixCompleted = Record<string, { words: string[] }>;
export type WordPoolProgress = Record<string, number>; // categoryId -> highest unlocked level (1-6)

function letterMixKey(date: string, level: string): string {
  return `lettermix_${date}_${level}`;
}

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

export function getWordPoolProgress(): WordPoolProgress {
  try {
    const s = localStorage.getItem(WP_PROGRESS);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function unlockWordPoolLevel(categoryId: string, completedLevel: number) {
  const data = getWordPoolProgress();
  const current = data[categoryId] ?? 1;
  if (completedLevel >= current) {
    // Store completedLevel + 1 (no cap) so Previous Games can detect all-complete state
    data[categoryId] = completedLevel + 1;
    localStorage.setItem(WP_PROGRESS, JSON.stringify(data));
  }
}

export function getWordPoolUnlockedLevel(categoryId: string): number {
  const data = getWordPoolProgress();
  return data[categoryId] ?? 1;
}

// Session storage: remembers found words for the current play session per category+level
type WordPoolSession = Record<string, string[]>;

function wpSessionKey(categoryId: string, levelNum: number): string {
  return `${categoryId}_${levelNum}`;
}

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
