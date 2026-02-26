/**
 * Clear the String puzzle generator
 * Pick N random words, shuffle letters, player finds words by clicking letters in any order.
 * Win = find all N solution words. Stuck = can't form more words but letters remain.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LEVELS = ['easy', 'medium', 'hard'];

const CONFIG = {
  easy: { targetWords: 5, minLen: 3, maxLen: 5 },
  medium: { targetWords: 7, minLen: 5, maxLen: 7 },
  hard: { targetWords: 9, minLen: 7, maxLen: 8 }, // Changed maxLen from 9 to 8 (no 9-letter words available)
};

// Global word pool tracker - tracks used words across all puzzle generation
// When exhausted, clears and starts over
const usedWordsGlobal = new Set();

// No longer needed - we just shuffle, don't verify formability

function seedRandom(seed) {
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

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWords(wordsByLen, config, rand) {
  const words = [];
  const { targetWords, minLen, maxLen } = config;

  while (words.length < targetWords) {
    const len = minLen + Math.floor(rand() * (maxLen - minLen + 1));
    const bucket = wordsByLen[String(len)];
    if (!bucket || bucket.length === 0) return null;
    
    // Try to find an unused word
    let attempts = 0;
    let w = null;
    while (attempts < 100) {
      const candidate = bucket[Math.floor(rand() * bucket.length)];
      if (!usedWordsGlobal.has(candidate)) {
        w = candidate;
        usedWordsGlobal.add(candidate);
        break;
      }
      attempts++;
    }
    
    // If pool exhausted for this length, clear global pool and retry
    if (!w) {
      console.log(`Word pool exhausted at ${usedWordsGlobal.size} words, resetting...`);
      usedWordsGlobal.clear();
      w = bucket[Math.floor(rand() * bucket.length)];
      usedWordsGlobal.add(w);
    }
    
    words.push(w);
  }

  return words;
}

function generateOne(dateStr, level, wordsByLen) {
  const config = CONFIG[level];
  const rand = seedRandom(dateStr + '-' + level);
  
  const words = pickWords(wordsByLen, config, rand);
  if (!words || words.length === 0) return null;
  
  // Concatenate and shuffle - no need to verify formability
  const concatenated = words.join('');
  const shuffled = shuffle(concatenated.split(''), rand).join('');
  
  return { 
    date: dateStr, 
    level, 
    scrambledLetters: shuffled, 
    solutionWords: words // Renamed from 'words' for clarity
  };
}

function main() {
  const wordsPath = join(__dirname, '..', 'public', 'data', 'words.json');
  const data = JSON.parse(readFileSync(wordsPath, 'utf-8'));

  const wordsByLen = {};
  for (const key of Object.keys(data)) {
    const n = parseInt(key, 10);
    if (n < 3 || n > 9) continue;
    const entries = data[key];
    if (!Array.isArray(entries)) continue;
    wordsByLen[key] = entries
      .map((e) => e.word?.toLowerCase())
      .filter((w) => w && w.length === n);
  }
  console.log('Loaded words by length:', Object.keys(wordsByLen).map((k) => `${k}:${wordsByLen[k].length}`).join(', '));

  const puzzles = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-12-31');
  const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);

    for (const level of LEVELS) {
      const puzzle = generateOne(dateStr, level, wordsByLen);
      if (puzzle) {
        puzzles.push(puzzle);
      } else {
        console.warn(`No puzzle for ${dateStr} ${level}`);
      }
    }
  }

  const outPath = join(__dirname, '..', 'public', 'data', 'lettermix-puzzles.json');
  writeFileSync(outPath, JSON.stringify(puzzles, null, 2));
  console.log(`Generated ${puzzles.length} puzzles → ${outPath}`);
}

main();
