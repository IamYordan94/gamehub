// Game state management for Change by One
import type { CboPuzzle } from './cbo-dailyChallenge';
import { validateCboWord } from './cbo-gameLogic';
import { isCboWordValid } from './cbo-words';

export interface CboPuzzleState {
  length: number;
  start_word: string;
  end_word: string;
  currentWord: string;
  wordChain: string[];
  moves: number;
  maxMoves: number;
  status: 'not_started' | 'playing' | 'won';
  errors: string[];
}

export interface CboDailyState {
  date: string;
  puzzles: CboPuzzleState[];
}

const STORAGE_KEY_PREFIX = 'cbo_daily_';

export function initPuzzleState(puzzle: CboPuzzle): CboPuzzleState {
  return {
    length: puzzle.length,
    start_word: puzzle.start_word.toLowerCase(),
    end_word: puzzle.end_word.toLowerCase(),
    currentWord: puzzle.start_word.toLowerCase(),
    wordChain: [puzzle.start_word.toLowerCase()],
    moves: 0,
    maxMoves: puzzle.max_moves,
    status: 'not_started',
    errors: [],
  };
}

export function initDailyState(date: string, puzzles: CboPuzzle[]): CboDailyState {
  return { date, puzzles: puzzles.map(initPuzzleState) };
}

export function submitWordToState(
  state: CboDailyState,
  puzzleLength: number,
  word: string
): CboDailyState {
  const idx = state.puzzles.findIndex(p => p.length === puzzleLength);
  if (idx === -1) return state;
  const ps = state.puzzles[idx];
  if (ps.status === 'won') return state;

  const w = word.toLowerCase().trim();
  const validation = validateCboWord(w, ps.currentWord, isCboWordValid, ps.wordChain);

  const updated = [...state.puzzles];

  if (!validation.isValid) {
    updated[idx] = {
      ...ps,
      status: ps.status === 'not_started' ? 'playing' : ps.status,
      errors: [validation.error ?? 'Invalid word'],
    };
  } else {
    const newChain = [...ps.wordChain, w];
    const newMoves = ps.moves + 1;
    const won = w === ps.end_word;
    const shouldReset = !won && newMoves >= ps.maxMoves;

    if (shouldReset) {
      updated[idx] = {
        ...ps,
        currentWord: ps.start_word,
        wordChain: [ps.start_word],
        moves: 0,
        status: 'playing',
        errors: [`Reset after ${ps.maxMoves} moves — try a different path!`],
      };
    } else {
      updated[idx] = {
        ...ps,
        currentWord: w,
        wordChain: newChain,
        moves: newMoves,
        status: won ? 'won' : 'playing',
        errors: [],
      };
    }
  }

  return { ...state, puzzles: updated };
}

export function resetPuzzleState(state: CboDailyState, puzzleLength: number): CboDailyState {
  const idx = state.puzzles.findIndex(p => p.length === puzzleLength);
  if (idx === -1) return state;
  const ps = state.puzzles[idx];
  const updated = [...state.puzzles];
  updated[idx] = {
    ...ps,
    currentWord: ps.start_word,
    wordChain: [ps.start_word],
    moves: 0,
    status: 'not_started',
    errors: [],
  };
  return { ...state, puzzles: updated };
}

export function saveCboState(state: CboDailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + state.date, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadCboState(date: string): CboDailyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + date);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.date === date ? parsed : null;
  } catch {
    return null;
  }
}
