// Game logic for Change by One

export function hasOneLetterDifference(word1: string, word2: string): boolean {
  if (word1.length !== word2.length) return false;
  let diffs = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      diffs++;
      if (diffs > 1) return false;
    }
  }
  return diffs === 1;
}

export function validateCboWord(
  word: string,
  previousWord: string,
  isValidWord: (w: string) => boolean,
  usedWords: string[] = []
): { isValid: boolean; error?: string } {
  const w = word.toLowerCase();

  if (!isValidWord(w)) {
    return { isValid: false, error: 'Not a valid word. Try again.' };
  }
  if (w.length !== previousWord.length) {
    return { isValid: false, error: 'Word must be the same length.' };
  }
  if (!hasOneLetterDifference(previousWord, w)) {
    return { isValid: false, error: 'Must change exactly one letter.' };
  }
  if (usedWords.includes(w)) {
    return { isValid: false, error: 'Word already used in this chain.' };
  }
  return { isValid: true };
}

export function suggestNextStep(
  currentWord: string,
  targetWord: string,
  allWords: string[]
): string | null {
  // Find a neighbor that shares more letters with the target
  const currentSim = letterSimilarity(currentWord, targetWord);
  let best: string | null = null;
  let bestSim = currentSim;

  for (const w of allWords) {
    if (w === currentWord) continue;
    if (hasOneLetterDifference(currentWord, w)) {
      const sim = letterSimilarity(w, targetWord);
      if (sim > bestSim) {
        bestSim = sim;
        best = w;
      }
    }
  }
  return best;
}

/** Returns any valid one-letter-change neighbor, excluding used words. Fallback when suggestNextStep finds nothing. */
export function getAnyValidNeighbor(
  currentWord: string,
  allWords: string[],
  usedWords: string[] = []
): string | null {
  const usedSet = new Set(usedWords.map((w) => w.toLowerCase()));
  for (const w of allWords) {
    if (w === currentWord) continue;
    if (usedSet.has(w)) continue;
    if (hasOneLetterDifference(currentWord, w)) return w;
  }
  return null;
}

/** Returns the index of a letter that differs from the target, for a "try changing letter N" hint. */
export function getDifferingLetterIndex(currentWord: string, targetWord: string): number | null {
  if (currentWord.length !== targetWord.length) return null;
  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] !== targetWord[i]) return i;
  }
  return null;
}

function letterSimilarity(a: string, b: string): number {
  if (a.length !== b.length) return 0;
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / a.length;
}
