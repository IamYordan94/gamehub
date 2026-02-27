import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const DB_NAME = 'wordcraft_hub';
const DB_VERSION = 2;

let db: SQLiteDBConnection | null = null;
let sqlite: SQLiteConnection | null = null;
let isInitialized = false;

const isNative = Capacitor.isNativePlatform();

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) return;

  if (!isNative) {
    console.log('Running on web - database features disabled, using localStorage');
    isInitialized = true;
    return;
  }

  try {
    sqlite = new SQLiteConnection(CapacitorSQLite);
    
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
    }

    await db.open();
    await createTables();
    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  if (!db) return;

  const queries = `
    CREATE TABLE IF NOT EXISTS solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      word TEXT NOT NULL,
      found_at INTEGER NOT NULL,
      UNIQUE(game, puzzle_id, word)
    );

    CREATE INDEX IF NOT EXISTS idx_solutions_game_puzzle 
      ON solutions(game, puzzle_id);

    CREATE TABLE IF NOT EXISTS hint_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      hint_type TEXT NOT NULL,
      used_at INTEGER NOT NULL,
      ad_watched INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_hints_game_puzzle 
      ON hint_events(game, puzzle_id);

    CREATE INDEX IF NOT EXISTS idx_hints_used_at 
      ON hint_events(used_at);

    CREATE TABLE IF NOT EXISTS daily_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      UNIQUE(game, date)
    );

    CREATE INDEX IF NOT EXISTS idx_progress_game_date 
      ON daily_progress(game, date);

    CREATE TABLE IF NOT EXISTS wordpool_progress (
      category_id TEXT PRIMARY KEY,
      unlocked_level INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS wordpool_session (
      category_id TEXT NOT NULL,
      level_num INTEGER NOT NULL,
      words TEXT NOT NULL,
      PRIMARY KEY(category_id, level_num)
    );

    /* Hint target: which word we're currently hinting for, and hint level per game/puzzle */
    CREATE TABLE IF NOT EXISTS hint_target (
      game TEXT NOT NULL,
      puzzle_id TEXT NOT NULL,
      target_word TEXT NOT NULL,
      hint_level INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY(game, puzzle_id)
    );

    CREATE INDEX IF NOT EXISTS idx_hint_target_game_puzzle 
      ON hint_target(game, puzzle_id);
  `;

  await db.execute(queries);
}

export async function addSolution(game: string, puzzleId: string, word: string): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT OR IGNORE INTO solutions (game, puzzle_id, word, found_at)
      VALUES (?, ?, ?, ?)
    `;
    await db.run(query, [game, puzzleId, word, Date.now()]);
  } catch (error) {
    console.error('Failed to add solution:', error);
  }
}

export async function getSolutions(game: string, puzzleId: string): Promise<string[]> {
  if (!isNative || !db) return [];

  try {
    const query = `SELECT word FROM solutions WHERE game = ? AND puzzle_id = ? ORDER BY found_at`;
    const result = await db.query(query, [game, puzzleId]);
    return result.values?.map((row: any) => row.word) ?? [];
  } catch (error) {
    console.error('Failed to get solutions:', error);
    return [];
  }
}

export async function recordHintEvent(
  game: string,
  puzzleId: string,
  hintType: string,
  adWatched: boolean
): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT INTO hint_events (game, puzzle_id, hint_type, used_at, ad_watched)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.run(query, [game, puzzleId, hintType, Date.now(), adWatched ? 1 : 0]);
  } catch (error) {
    console.error('Failed to record hint event:', error);
  }
}

export async function getHintsUsedToday(game: string): Promise<number> {
  if (!isNative || !db) return 0;

  try {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const query = `
      SELECT COUNT(*) as count 
      FROM hint_events 
      WHERE game = ? AND used_at >= ?
    `;
    const result = await db.query(query, [game, startOfDay]);
    return result.values?.[0]?.count ?? 0;
  } catch (error) {
    console.error('Failed to get hints used today:', error);
    return 0;
  }
}

export async function saveDailyProgress(
  game: string,
  date: string,
  status: string,
  score: number = 0
): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT OR REPLACE INTO daily_progress (game, date, status, score)
      VALUES (?, ?, ?, ?)
    `;
    await db.run(query, [game, date, status, score]);
  } catch (error) {
    console.error('Failed to save daily progress:', error);
  }
}

export async function getDailyProgress(game: string, date: string): Promise<any> {
  if (!isNative || !db) return null;

  try {
    const query = `
      SELECT * FROM daily_progress 
      WHERE game = ? AND date = ?
    `;
    const result = await db.query(query, [game, date]);
    return result.values?.[0] ?? null;
  } catch (error) {
    console.error('Failed to get daily progress:', error);
    return null;
  }
}

export async function getWordPoolUnlockedLevel(categoryId: string): Promise<number> {
  if (!isNative || !db) return 1;

  try {
    const query = `SELECT unlocked_level FROM wordpool_progress WHERE category_id = ?`;
    const result = await db.query(query, [categoryId]);
    return result.values?.[0]?.unlocked_level ?? 1;
  } catch (error) {
    console.error('Failed to get WordPool unlocked level:', error);
    return 1;
  }
}

export async function setWordPoolUnlockedLevel(categoryId: string, level: number): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT OR REPLACE INTO wordpool_progress (category_id, unlocked_level)
      VALUES (?, ?)
    `;
    await db.run(query, [categoryId, level]);
  } catch (error) {
    console.error('Failed to set WordPool unlocked level:', error);
  }
}

export async function getWordPoolSessionWords(categoryId: string, levelNum: number): Promise<string[]> {
  if (!isNative || !db) return [];

  try {
    const query = `SELECT words FROM wordpool_session WHERE category_id = ? AND level_num = ?`;
    const result = await db.query(query, [categoryId, levelNum]);
    const wordsJson = result.values?.[0]?.words;
    return wordsJson ? JSON.parse(wordsJson) : [];
  } catch (error) {
    console.error('Failed to get WordPool session words:', error);
    return [];
  }
}

export async function saveWordPoolSessionWords(
  categoryId: string,
  levelNum: number,
  words: string[]
): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT OR REPLACE INTO wordpool_session (category_id, level_num, words)
      VALUES (?, ?, ?)
    `;
    await db.run(query, [categoryId, levelNum, JSON.stringify(words)]);
  } catch (error) {
    console.error('Failed to save WordPool session words:', error);
  }
}

export async function clearWordPoolSessionWords(categoryId: string, levelNum: number): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `DELETE FROM wordpool_session WHERE category_id = ? AND level_num = ?`;
    await db.run(query, [categoryId, levelNum]);
  } catch (error) {
    console.error('Failed to clear WordPool session words:', error);
  }
}

/** Hint target: which word we're hinting for and at what level (1=length, 2=1st letter, 3=2nd, 4=3rd) */
export type HintTarget = { targetWord: string; hintLevel: number };

export async function getHintTarget(game: string, puzzleId: string): Promise<HintTarget | null> {
  if (!isNative || !db) return null;

  try {
    const query = `SELECT target_word, hint_level FROM hint_target WHERE game = ? AND puzzle_id = ?`;
    const result = await db.query(query, [game, puzzleId]);
    const row = result.values?.[0];
    if (!row) return null;
    return { targetWord: row.target_word, hintLevel: row.hint_level };
  } catch (error) {
    console.error('Failed to get hint target:', error);
    return null;
  }
}

export async function setHintTarget(
  game: string,
  puzzleId: string,
  targetWord: string,
  hintLevel: number
): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `
      INSERT OR REPLACE INTO hint_target (game, puzzle_id, target_word, hint_level, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.run(query, [game, puzzleId, targetWord, hintLevel, Date.now()]);
  } catch (error) {
    console.error('Failed to set hint target:', error);
  }
}

export async function clearHintTarget(game: string, puzzleId: string): Promise<void> {
  if (!isNative || !db) return;

  try {
    const query = `DELETE FROM hint_target WHERE game = ? AND puzzle_id = ?`;
    await db.run(query, [game, puzzleId]);
  } catch (error) {
    console.error('Failed to clear hint target:', error);
  }
}

export async function closeDatabase(): Promise<void> {
  if (!isNative || !db || !sqlite) return;

  try {
    await sqlite.closeConnection(DB_NAME, false);
    db = null;
    isInitialized = false;
  } catch (error) {
    console.error('Failed to close database:', error);
  }
}
