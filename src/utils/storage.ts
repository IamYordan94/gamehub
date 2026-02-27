import { Capacitor } from '@capacitor/core';
import * as db from './database';

const LM_COMPLETED = 'wordcraft_lettermix_completed';
export const WP_PROGRESS = 'wordcraft_wordpool_progress';
const WP_SESSION = 'wordcraft_wordpool_session';
const HINT_TARGET = 'wordcraft_hint_target';

const isNative = Capacitor.isNativePlatform();

export type HintTarget = { targetWord: string; hintLevel: number };

function hintTargetKey(game: string, puzzleId: string): string {
  return `hint_${game}_${puzzleId}`;
}

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

export async function getLetterMixCompletedForAsync(date: string, level: string): Promise<string[]> {
  if (isNative) {
    const puzzleId = letterMixKey(date, level);
    return await db.getSolutions('lettermix', puzzleId);
  }
  return getLetterMixCompletedFor(date, level)?.words ?? [];
}

export function getLetterMixCompletedFor(date: string, level: string): { words: string[] } | undefined {
  return getLetterMixCompleted()[letterMixKey(date, level)];
}

export async function setLetterMixCompletedAsync(date: string, level: string, words: string[]) {
  if (isNative) {
    const puzzleId = letterMixKey(date, level);
    for (const word of words) {
      await db.addSolution('lettermix', puzzleId, word);
    }
    await db.saveDailyProgress('lettermix', date, 'completed', words.length);
  } else {
    setLetterMixCompleted(date, level, words);
  }
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

export async function unlockWordPoolLevelAsync(categoryId: string, completedLevel: number) {
  if (isNative) {
    const current = await db.getWordPoolUnlockedLevel(categoryId);
    if (completedLevel >= current) {
      await db.setWordPoolUnlockedLevel(categoryId, completedLevel + 1);
    }
  } else {
    unlockWordPoolLevel(categoryId, completedLevel);
  }
}

export function unlockWordPoolLevel(categoryId: string, completedLevel: number) {
  const data = getWordPoolProgress();
  const current = data[categoryId] ?? 1;
  if (completedLevel >= current) {
    data[categoryId] = completedLevel + 1;
    localStorage.setItem(WP_PROGRESS, JSON.stringify(data));
  }
}

export async function getWordPoolUnlockedLevelAsync(categoryId: string): Promise<number> {
  if (isNative) {
    return await db.getWordPoolUnlockedLevel(categoryId);
  }
  return getWordPoolUnlockedLevel(categoryId);
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

export async function getWordPoolSessionWordsAsync(categoryId: string, levelNum: number): Promise<string[]> {
  if (isNative) {
    return await db.getWordPoolSessionWords(categoryId, levelNum);
  }
  return getWordPoolSessionWords(categoryId, levelNum);
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

export async function saveWordPoolSessionWordsAsync(categoryId: string, levelNum: number, words: string[]) {
  if (isNative) {
    await db.saveWordPoolSessionWords(categoryId, levelNum, words);
  } else {
    saveWordPoolSessionWords(categoryId, levelNum, words);
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

export async function clearWordPoolSessionWordsAsync(categoryId: string, levelNum: number) {
  if (isNative) {
    await db.clearWordPoolSessionWords(categoryId, levelNum);
  } else {
    clearWordPoolSessionWords(categoryId, levelNum);
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

// Hint target: which word we're hinting for and at what level (1=length, 2=1st letter, 3=2nd, 4=3rd)
export async function getHintTargetAsync(game: string, puzzleId: string): Promise<HintTarget | null> {
  if (isNative) {
    const t = await db.getHintTarget(game, puzzleId);
    return t;
  }
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
  if (isNative) {
    await db.setHintTarget(game, puzzleId, targetWord, hintLevel);
    return;
  }
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
  if (isNative) {
    await db.clearHintTarget(game, puzzleId);
    return;
  }
  try {
    const s = localStorage.getItem(HINT_TARGET);
    const data: Record<string, HintTarget> = s ? JSON.parse(s) : {};
    delete data[hintTargetKey(game, puzzleId)];
    localStorage.setItem(HINT_TARGET, JSON.stringify(data));
  } catch {
    // ignore
  }
}
