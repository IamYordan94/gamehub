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

function generatePairs(length, targetCount = 70, minSteps = 3, maxSteps = 8) {
  const dict = (wordsData[String(length)] || []).map(w => w.toLowerCase());
  console.log(`Length ${length}: ${dict.length} words - building adjacency...`);
  const adj = buildAdjacency(dict);
  console.log(`  Adjacency built. Generating pairs...`);
  
  // Sample a subset of words to try as starting points
  const shuffled = dict.slice().sort(() => Math.random() - 0.5);
  const startCandidates = shuffled.slice(0, Math.min(600, dict.length));
  
  const pairs = [];
  const usedStarts = new Set();
  
  for (const start of startCandidates) {
    if (pairs.length >= targetCount) break;
    if (usedStarts.has(start)) continue;
    
    // Try random end words
    const endCandidates = shuffled.slice().sort(() => Math.random() - 0.5).slice(0, 200);
    for (const end of endCandidates) {
      if (start === end) continue;
      const dist = bfsDistance(start, end, adj, maxSteps + 1);
      if (dist >= minSteps && dist <= maxSteps) {
        pairs.push({ start_word: start, end_word: end, optimal_steps: dist });
        usedStarts.add(start);
        break;
      }
    }
  }
  
  return pairs;
}

console.log('Generating 4-letter pairs...');
const pairs4 = generatePairs(4, 80, 3, 7);
console.log(`  Generated ${pairs4.length} pairs`);

console.log('Generating 5-letter pairs...');
const pairs5 = generatePairs(5, 80, 4, 8);
console.log(`  Generated ${pairs5.length} pairs`);

writeFileSync('./public/cbo-pairs-4.json', JSON.stringify(pairs4, null, 2));
writeFileSync('./public/cbo-pairs-5.json', JSON.stringify(pairs5, null, 2));
console.log('Done!');
