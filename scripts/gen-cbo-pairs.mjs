// Generates word pairs for Change by One game using BFS with adjacency precomputation
import { readFileSync, writeFileSync } from 'fs';

const wordsData = JSON.parse(readFileSync('./public/words-cbo.json', 'utf8'));

// Build adjacency map using letter-substitution buckets (O(n*26*len) instead of O(n^2*len))
function buildAdjacency(dict) {
  const wordSet = new Set(dict);
  const adj = new Map();
  for (const word of dict) {
    const neighbors = [];
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const ch = String.fromCharCode(c);
        if (ch === word[i]) continue;
        const candidate = word.slice(0, i) + ch + word.slice(i + 1);
        if (wordSet.has(candidate)) neighbors.push(candidate);
      }
    }
    adj.set(word, neighbors);
  }
  return adj;
}

function bfsDistance(start, end, adj, maxDist = 10) {
  if (start === end) return 0;
  const visited = new Set([start]);
  const queue = [[start, 0]];
  while (queue.length > 0) {
    const [word, dist] = queue.shift();
    if (dist >= maxDist) continue;
    for (const next of (adj.get(word) || [])) {
      if (next === end) return dist + 1;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, dist + 1]);
      }
    }
  }
  return -1;
}

/**
 * Generates verified word pairs for one word length using BFS.
 * Every pair is guaranteed solvable; optimal_steps reflects the true BFS distance.
 */
function generatePairs(length, targetCount = 400, minSteps = 3, maxSteps = 10) {
  const dict = (wordsData[String(length)] || []).map(w => w.toLowerCase());
  if (dict.length === 0) {
    console.log(`  No words of length ${length}, skipping.`);
    return [];
  }
  console.log(`Length ${length}: ${dict.length} words — building adjacency...`);
  const adj = buildAdjacency(dict);
  const edgeCount = [...adj.values()].reduce((s, n) => s + n.length, 0) / 2 | 0;
  console.log(`  Adjacency built (${edgeCount} edges). Generating pairs...`);

  const shuffled = dict.slice().sort(() => Math.random() - 0.5);
  const usedPairs = new Set();
  const pairs = [];

  for (const start of shuffled) {
    if (pairs.length >= targetCount) break;
    // Re-shuffle end candidates each time for variety
    const endCandidates = shuffled.slice().sort(() => Math.random() - 0.5);
    for (const end of endCandidates) {
      if (start === end) continue;
      const key = start < end ? `${start}|${end}` : `${end}|${start}`;
      if (usedPairs.has(key)) continue;
      const dist = bfsDistance(start, end, adj, maxSteps + 1);
      if (dist >= minSteps && dist <= maxSteps) {
        pairs.push({ start_word: start, end_word: end, optimal_steps: dist });
        usedPairs.add(key);
        break;
      }
    }
  }

  return pairs;
}

// ── Per-length settings (target 400 pairs each, matching existing files) ──
const configs = [
  { length: 4, target: 400, min: 3, max:  7 },
  { length: 5, target: 400, min: 4, max:  8 },
  { length: 6, target: 400, min: 5, max: 10 },
  { length: 7, target: 400, min: 5, max: 12 },
];

for (const { length, target, min, max } of configs) {
  console.log(`\nGenerating ${length}-letter pairs (target: ${target})...`);
  const pairs = generatePairs(length, target, min, max);
  console.log(`  Generated ${pairs.length} pairs`);
  writeFileSync(`./public/cbo-pairs-${length}.json`, JSON.stringify(pairs, null, 2));
  console.log(`  Saved → public/cbo-pairs-${length}.json`);
}

console.log('\nDone! Run: npx vite build   to rebuild the app.');
