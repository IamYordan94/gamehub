import { useState, useEffect, useCallback } from 'react';

type WordEntry = {
  word: string;
  pos?: string;
  definition?: string;
};

type WordsData = Record<string, WordEntry[]>;

let wordSet: Set<string> | null = null;
let wordsByLength: Record<string, string[]> | null = null;

export function useWordDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wordSet) {
      setIsLoading(false);
      return;
    }

    fetch('/data/words.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load word database');
        return res.json();
      })
      .then((data: WordsData) => {
        const set = new Set<string>();
        const byLength: Record<string, string[]> = {};

        for (const lengthKey of Object.keys(data)) {
          const entries = data[lengthKey];
          if (!Array.isArray(entries)) continue;

          const words: string[] = [];
          for (const entry of entries) {
            const w = entry.word?.toLowerCase();
            if (w) {
              set.add(w);
              words.push(w);
            }
          }
          byLength[lengthKey] = words;
        }

        wordSet = set;
        wordsByLength = byLength;
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const isValidWord = useCallback((word: string): boolean => {
    if (!wordSet) return false;
    return wordSet.has(word.toLowerCase());
  }, []);

  const getWordsByLength = useCallback((length: number): string[] => {
    if (!wordsByLength) return [];
    return wordsByLength[String(length)] ?? [];
  }, []);

  const getAllWords = useCallback((): string[] => {
    if (!wordSet) return [];
    return Array.from(wordSet);
  }, []);

  return { isValidWord, getWordsByLength, getAllWords, isLoading, error };
}
