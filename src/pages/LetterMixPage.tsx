import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordDatabase } from '../hooks/useWordDatabase';
import { getTodayDateStr } from '../utils/dailySeed';
import { setLetterMixCompleted, getLetterMixCompletedFor } from '../utils/storage';
// Helper to check if a word can be formed from available letters (any order)
function canFormFromLetters(availableLetters: string, word: string): boolean {
  const letterCounts: Record<string, number> = {};
  for (const char of availableLetters) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }
  for (const char of word) {
    if (!letterCounts[char] || letterCounts[char] === 0) {
      return false;
    }
    letterCounts[char]--;
  }
  return true;
}

type Puzzle = {
  date: string;
  level: string;
  scrambledLetters: string;
  solutionWords: string[];
};

const LEVELS = ['easy', 'medium', 'hard'] as const;

type LayoutContextType = {
  setResetHandler: (handler: (() => void) | null) => void;
};

export default function LetterMixPage() {
  const { date: dateParam, level: levelParam } = useParams();
  const navigate = useNavigate();
  const { setResetHandler } = useOutletContext<LayoutContextType>();
  const puzzleDate = dateParam ?? getTodayDateStr();
  const level: (typeof LEVELS)[number] =
    levelParam && LEVELS.includes(levelParam as (typeof LEVELS)[number]) ? (levelParam as (typeof LEVELS)[number]) : 'easy';
  const { isLoading: dbLoading } = useWordDatabase();

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [puzzleLoaded, setPuzzleLoaded] = useState(false);
  const [letters, setLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    setPuzzleLoaded(false);
    // Reset game state when puzzle changes
    setFoundWords([]);
    setSelectedIndices([]);
    setMessage(null);
    setHint(null);
    setShared(false);
    
    fetch('/data/lettermix-puzzles.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load puzzles');
        return r.json();
      })
      .then((data: Puzzle[]) => {
        let p = data.find((q) => q.date === puzzleDate && q.level === level) ?? null;
        if (!p && data.length > 0) {
          p = data.find((q) => q.level === level) ?? data[0];
        }
        setPuzzle(p);
        const completed = p ? getLetterMixCompletedFor(p.date, p.level) : undefined;
        if (completed && p) {
          setFoundWords(completed.words);
          setLetters([]);
        } else {
          setLetters(p?.scrambledLetters.split('') ?? []);
        }
        setPuzzleLoaded(true);
      })
      .catch(() => setPuzzleLoaded(true));
  }, [puzzleDate, level]);

  const selectedWord = selectedIndices
    .map((i) => letters[i])
    .join('')
    .toLowerCase();

  const handleLetterClick = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setMessage(null);
  };

  const { isValidWord } = useWordDatabase();

  const handleSubmit = () => {
    if (!selectedWord || selectedWord.length < 2) {
      setMessage({ text: 'Select at least 2 letters', type: 'error' });
      return;
    }
    // NEW: Accept ANY valid English word (not just solution words)
    if (!isValidWord(selectedWord)) {
      setMessage({ text: 'Not a valid English word', type: 'error' });
      return;
    }
    if (foundWords.includes(selectedWord)) {
      setMessage({ text: 'Already found', type: 'error' });
      return;
    }
    // Accept the word and remove letters (don't reveal if it's a solution word)
    setFoundWords((prev) => [...prev, selectedWord]);
    setLetters((prev) => prev.filter((_, i) => !selectedIndices.includes(i)));
    setSelectedIndices([]);
    setMessage({ text: `Found: ${selectedWord}`, type: 'success' });
  };

  const handleClear = () => {
    setSelectedIndices([]);
    setMessage(null);
  };

  const handleReset = useCallback(() => {
    if (puzzle) {
      setLetters(puzzle.scrambledLetters.split(''));
      setFoundWords([]);
      setSelectedIndices([]);
      setMessage(null);
      setHint(null);
      setShared(false);
    }
  }, [puzzle]);

  // NEW: Win = found all solution words (not just cleared all letters)
  const foundSolutionWords = puzzle ? foundWords.filter(w => puzzle.solutionWords.includes(w)) : [];
  const isWon = puzzle && foundSolutionWords.length === puzzle.solutionWords.length;

  // Check if stuck: can't form any more 2+ letter words from remaining letters
  const checkIfStuck = (): boolean => {
    if (letters.length < 2) return true;
    const remainingStr = letters.join('');
    // Simple heuristic: check if we can form common 2-letter words
    const common2Letter = ['an', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we'];
    for (const word of common2Letter) {
      if (canFormFromLetters(remainingStr, word) && isValidWord(word)) {
        return false; // Can still form at least one word
      }
    }
    // Check if any solution word is still formable
    if (puzzle) {
      for (const word of puzzle.solutionWords) {
        if (!foundWords.includes(word) && canFormFromLetters(remainingStr, word)) {
          return false;
        }
      }
    }
    return true; // Stuck
  };

  const isStuck = !isWon && letters.length > 0 && checkIfStuck();

  useEffect(() => {
    if (isWon && puzzle) {
      setLetterMixCompleted(puzzle.date, puzzle.level, foundWords);
    }
  }, [isWon, puzzle, foundWords]);

  // Register reset handler with layout
  useEffect(() => {
    setResetHandler(() => handleReset);
    return () => setResetHandler(null);
  }, [setResetHandler, handleReset]);

  const getHint = () => {
    if (!puzzle || puzzle.solutionWords.length === 0) return;
    const remainingLetters = letters.join('');
    // Only hint solution words (not any valid word)
    const unseenSolution = puzzle.solutionWords.filter(w => !foundWords.includes(w));
    if (unseenSolution.length === 0) {
      setHint('You found all solution words!');
      return;
    }
    for (const word of unseenSolution) {
      if (canFormFromLetters(remainingLetters, word)) {
        // Non-direct hint: length + first letter
        setHint(`Try a ${word.length}-letter word starting with "${word[0].toUpperCase()}"...`);
        return;
      }
    }
    setHint('No solution words formable from remaining letters.');
  };

  const switchLevel = (newLevel: (typeof LEVELS)[number]) => {
    if (dateParam) {
      navigate(`/lettermix/play/${puzzleDate}/${newLevel}`);
    } else {
      navigate(`/lettermix/play/${newLevel}`);
    }
  };

  if (dbLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-[#94a3b8]">Loading puzzle...</div>
      </div>
    );
  }
  if (!puzzleLoaded) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-[#94a3b8]">Loading puzzle...</p>
      </div>
    );
  }
  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-[#94a3b8] text-center">
          Could not load puzzles. Check that <code className="text-[#22d3ee]">/data/lettermix-puzzles.json</code> is available.
        </p>
        <Link
          to="/lettermix"
          className="px-4 py-2 rounded-lg bg-[#22d3ee] text-[#0a1628] font-medium hover:bg-[#2dd4bf]"
        >
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rules modal */}
      <AnimatePresence>
        {rulesOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setRulesOpen(false)}
            />
            {/* Sheet — slides up from bottom on mobile, centered on larger screens */}
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed z-50 bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
            >
              <div className="w-full sm:max-w-md bg-[#0a1628] border border-[#1e3a5f] rounded-t-2xl sm:rounded-2xl p-6 max-h-[85dvh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#22d3ee]">How to play</h2>
                  <button
                    onClick={() => setRulesOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1e3a5f] text-[#64748b] hover:text-[#e2e8f0] hover:border-[#334155] transition-colors text-lg leading-none"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <ol className="space-y-4 list-none m-0 p-0">
                  <li className="flex gap-3 text-sm">
                    <span className="text-[#22d3ee] font-bold w-5 flex-shrink-0 mt-0.5">1</span>
                    <span className="text-[#94a3b8] leading-relaxed">A string of scrambled letters hides several solution words. Your goal is to <strong className="text-[#e2e8f0]">find all of them</strong> to clear the string.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-[#22d3ee] font-bold w-5 flex-shrink-0 mt-0.5">2</span>
                    <span className="text-[#94a3b8] leading-relaxed">Tap letters to select them in any order, then press <strong className="text-[#e2e8f0]">Submit</strong>. Any valid English word using those letters is accepted — not just solution words.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-[#22d3ee] font-bold w-5 flex-shrink-0 mt-0.5">3</span>
                    <span className="text-[#94a3b8] leading-relaxed">Matched letters disappear. The order you remove words matters — some letters are shared between solution words.</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-[#22d3ee] font-bold w-5 flex-shrink-0 mt-0.5">4</span>
                    <span className="text-[#94a3b8] leading-relaxed">Stuck? Press <strong className="text-[#e2e8f0]">Hint</strong> to get a clue about a remaining solution word.</span>
                  </li>
                </ol>
                <button
                  onClick={() => setRulesOpen(false)}
                  className="mt-6 w-full py-3 rounded-xl bg-[#22d3ee] text-[#0a1628] font-semibold text-sm hover:bg-[#2dd4bf] transition-colors"
                >
                  Got it — let's play
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily game */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#64748b]">{puzzle.date} · {puzzle.level}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748b]">Hidden Words:</span>
              <div className="flex gap-1">
                {Array.from({ length: puzzle.solutionWords.length }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < foundSolutionWords.length ? 'text-[#22d3ee]' : 'text-[#64748b]'}`}
                  >
                    {i < foundSolutionWords.length ? '●' : '○'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {(puzzle.date !== puzzleDate || puzzle.level !== level) && (
            <span className="text-xs text-[#64748b]">(requested: {puzzleDate} · {level})</span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRulesOpen(true)}
              className="px-2 py-1 rounded text-xs bg-[#1e3a5f] text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]"
              aria-label="How to play"
            >
              ?
            </button>
            <button
              onClick={getHint}
              className="px-2 py-1 rounded text-xs bg-[#1e3a5f] text-[#22d3ee] hover:bg-[#334155]"
            >
              Hint
            </button>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => switchLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                l === puzzle.level
                  ? 'bg-[#22d3ee] text-[#0a1628]'
                  : 'border border-[#334155] text-[#94a3b8] hover:border-[#22d3ee]/50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {hint && <p className="text-sm text-[#22d3ee] mb-2">{hint}</p>}

        <AnimatePresence mode="wait">
          {isWon ? (
            <motion.div
              key="win"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-[#10b981]/20 border border-[#10b981] p-6 text-center space-y-4"
            >
              <p className="text-xl font-semibold text-[#10b981]">You solved it!</p>
              <p className="text-[#94a3b8]">Solution words: {foundSolutionWords.join(', ')}</p>
              <p className="text-sm text-[#64748b]">Total words found: {foundWords.length}</p>
              <button
                onClick={() => {
                  const text = `Clear the String ${puzzle.date} (${puzzle.level}): Solved! ${foundSolutionWords.length} solution words in ${foundWords.length} total words.`;
                  navigator.clipboard.writeText(text);
                  setShared(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#22d3ee] text-[#0a1628] font-medium hover:bg-[#2dd4bf]"
              >
                {shared ? 'Copied!' : 'Share'}
              </button>
            </motion.div>
          ) : isStuck ? (
            <motion.div
              key="stuck"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-[#ef4444]/20 border border-[#ef4444] p-6 text-center space-y-4"
            >
              <p className="text-xl font-semibold text-[#ef4444]">Stuck!</p>
              <p className="text-[#94a3b8]">Can&apos;t form any more words. You found {foundSolutionWords.length} of {puzzle.solutionWords.length} solution words.</p>
              <p className="text-sm text-[#64748b]">Remaining letters: {letters.join('').toUpperCase()}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-[#ef4444] text-white font-medium hover:bg-[#dc2626]"
              >
                Reset Puzzle
              </button>
            </motion.div>
          ) : (
            <motion.div key="game" className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[3rem]">
                <AnimatePresence>
                  {letters.map((letter, i) => (
                    <motion.button
                      key={`${i}-${letter}`}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() => handleLetterClick(i)}
                      className={`w-12 h-12 rounded-lg border font-mono text-lg font-medium transition-all ${
                        selectedIndices.includes(i)
                          ? 'bg-[#22d3ee] border-[#22d3ee] text-[#0a1628]'
                          : 'bg-[#1e3a5f] border-[#334155] text-[#e2e8f0] hover:border-[#22d3ee]/50'
                      }`}
                    >
                      {letter.toUpperCase()}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-[#1e3a5f] bg-[#0f172a] px-4 py-2 font-mono text-lg text-[#e2e8f0]">
                  {selectedWord || 'Select letters...'}
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-[#22d3ee] text-[#0a1628] font-medium hover:bg-[#2dd4bf]"
                >
                  Submit
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-lg border border-[#334155] text-[#94a3b8] hover:bg-[#1e3a5f]"
                >
                  Clear
                </button>
              </div>

              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {message.text}
                </p>
              )}

              <div>
                <p className="text-sm text-[#64748b] mb-2">Found words</p>
                <div className="flex flex-wrap gap-2">
                  {foundWords.map((w, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[#10b981]/20 text-[#10b981] text-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
