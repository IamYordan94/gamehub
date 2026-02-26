// Word dictionary for Change by One game

let wordDictionary: Map<number, Set<string>> = new Map();
let wordsLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function loadCboWords(): Promise<void> {
  if (wordsLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const res = await fetch('/words-cbo.json');
    if (!res.ok) throw new Error('Failed to load word dictionary');
    const data: Record<string, string[]> = await res.json();
    wordDictionary.clear();
    for (const [key, words] of Object.entries(data)) {
      const len = Number(key);
      if (len >= 3 && len <= 8 && Array.isArray(words)) {
        wordDictionary.set(len, new Set(words.map(w => w.toLowerCase())));
      }
    }
    wordsLoaded = true;
  })();

  return loadPromise;
}

export function isCboWordValid(word: string): boolean {
  if (!wordsLoaded) return false;
  const set = wordDictionary.get(word.length);
  return set ? set.has(word.toLowerCase()) : false;
}

export function getCboWordsByLength(length: number): string[] {
  if (!wordsLoaded) return [];
  const set = wordDictionary.get(length);
  return set ? Array.from(set) : [];
}

export function isCboWordsLoaded(): boolean {
  return wordsLoaded;
}
