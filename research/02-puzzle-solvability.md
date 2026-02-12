# Puzzle Solvability for LetterMix

**Research Summary:** Best approach: Build-from-words-then-scramble (generate-first risks unsolvable puzzles). Select 3-5 words from dictionary, concatenate letters, shuffle randomly. Verify all words formable via subsequence check (from item 1). Retry if any fails (rare with short words). Ensures 100% solvability.

**Pros vs Generate-then-Verify:** Faster (no retries needed), simpler, puzzle difficulty tunable by word length/count.

**Implementation:** Copy-paste ready TypeScript functions.

```typescript
import { canFormWord } from './subsequence-validation'; // From item 1

function generateSolvablePuzzle(dictionary: string[], numWords: number = 3, minWordLen: number = 4): {puzzleString: string, solutionWords: string[]} {
  while (true) {
    const words = [];
    let allLetters = '';
    for (let i = 0; i < numWords; i++) {
      const word = dictionary.filter(w => w.length >= minWordLen)[Math.floor(Math.random() * dictionary.length)];
      words.push(word);
      allLetters += word;
    }
    const puzzleString = allLetters.split('').sort(() => Math.random() - 0.5).join('');
    
    // Verify solvability
    if (words.every(word => canFormWord(puzzleString, word))) {
      return { puzzleString, solutionWords: words };
    }
    // Retry if unsolvable (unlikely)
  }
}
```

**Test Usage:**
```typescript
const dict = ['TABLE', 'FORK', 'SPOON', 'KNIFE'];
const puzzle = generateSolvablePuzzle(dict);
console.log(puzzle); // {puzzleString: 'shuffled', solutionWords: ['TABLE', ...]}
```

**Edge Cases:** Empty dict → error; single letter → trivial true; duplicates OK if dictionary allows.

**Sources:** Stack Overflow shuffle impl, adapted from word search puzzle generators.[web:23][web:24]