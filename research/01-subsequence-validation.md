# Subsequence Validation Algorithm for LetterMix

**Research Summary:** This checks if a word can be formed from a source string by selecting letters in left-to-right order, non-consecutive allowed (subsequence matching). Time complexity O(m*n) where m=source.length, n=word.length. Efficient for game word lengths (under 20 chars).

**Example:** `canFormWord('BLETAFORKNOSOP', 'TABLE')` → true (B→L→E→T→A positions 2,3,4,5,6? Wait, T at 4? Positions: B1 L2 E3 T4 A5 → yes).

**Implementation:** Copy-paste ready TypeScript function.

```typescript
function canFormWord(source: string, word: string): boolean {
  let i = 0; // pointer for word
  for (const char of source) {
    if (char === word[i]) {
      i++;
      if (i === word.length) {
        return true;
      }
    }
  }
  return false;
}
```

**Test Cases:**
- canFormWord('BLETAFORKNOSOP', 'TABLE') → true
- canFormWord('ABC', 'AC') → true
- canFormWord('ABC', 'CA') → false
- canFormWord('A', 'A') → true
- canFormWord('A', 'B') → false

**Sources:** Standard two-pointer subsequence algorithm from LeetCode 392 'Is Subsequence'.[web:21][web:22]