// Web stub — all persistence uses localStorage via storage.ts.
// These functions are kept as no-ops so imports don't break.

export async function initializeDatabase(): Promise<void> {}
export async function addSolution(_game: string, _puzzleId: string, _word: string): Promise<void> {}
export async function getSolutions(_game: string, _puzzleId: string): Promise<string[]> { return []; }
export async function recordHintEvent(
  _game: string, _puzzleId: string, _hintType: string, _adWatched: boolean
): Promise<void> {}
export async function getHintsUsedToday(_game: string): Promise<number> { return 0; }
export async function saveDailyProgress(
  _game: string, _date: string, _status: string, _score?: number
): Promise<void> {}
export async function getDailyProgress(_game: string, _date: string): Promise<null> { return null; }
export async function closeDatabase(): Promise<void> {}
