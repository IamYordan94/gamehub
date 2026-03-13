import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordDatabase } from '../hooks/useWordDatabase';
import { getTodayDateStr } from '../utils/dailySeed';
import {
  setLetterMixCompleted,
  getLetterMixCompletedFor,
  getHintTargetAsync,
  setHintTargetAsync,
  clearHintTargetAsync,
} from '../utils/storage';
import { shouldShowAdForHint, showRewardedAd } from '../utils/ads';
import { recordHintEvent } from '../utils/database';

function canFormFromLetters(availableLetters: string, word: string): boolean {
  const letterCounts: Record<string, number> = {};
  for (const char of availableLetters) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }
  for (const char of word) {
    if (!letterCounts[char] || letterCounts[char] === 0) return false;
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
    levelParam && LEVELS.includes(levelParam as (typeof LEVELS)[number])
      ? (levelParam as (typeof LEVELS)[number])
      : 'easy';

  const { isLoading: dbLoading, isValidWord } = useWordDatabase();

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

  const handleSubmit = () => {
    if (!selectedWord || selectedWord.length < 2) {
      setMessage({ text: 'Select at least 2 letters', type: 'error' });
      return;
    }
    if (!isValidWord(selectedWord)) {
      setMessage({ text: 'Not a valid English word', type: 'error' });
      return;
    }
    if (foundWords.includes(selectedWord)) {
      setMessage({ text: 'Already found', type: 'error' });
      return;
    }
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
      clearHintTargetAsync('lettermix', `${puzzle.date}_${puzzle.level}`);
    }
  }, [puzzle]);

  const foundSolutionWords = puzzle ? foundWords.filter(w => puzzle.solutionWords.includes(w)) : [];
  const isWon = !!(puzzle && foundSolutionWords.length === puzzle.solutionWords.length);

  useEffect(() => {
    if (isWon && puzzle) {
      setLetterMixCompleted(puzzle.date, puzzle.level, foundWords);
    }
  }, [isWon, puzzle, foundWords]);

  useEffect(() => {
    if (!puzzle || foundWords.length === 0) return;
    (async () => {
      const puzzleId = `${puzzle.date}_${puzzle.level}`;
      const target = await getHintTargetAsync('lettermix', puzzleId);
      if (target && foundWords.includes(target.targetWord)) {
        await clearHintTargetAsync('lettermix', puzzleId);
      }
    })();
  }, [puzzle, foundWords]);

  const isStuck = useMemo(() => {
    if (isWon || letters.length < 2) return false;
    const remainingStr = letters.join('');
    const common2Letter = ['an', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we'];
    for (const word of common2Letter) {
      if (canFormFromLetters(remainingStr, word) && isValidWord(word)) return false;
    }
    if (puzzle) {
      for (const word of puzzle.solutionWords) {
        if (!foundWords.includes(word) && canFormFromLetters(remainingStr, word)) return false;
      }
    }
    return true;
  }, [letters, puzzle, foundWords, isWon, isValidWord]);

  useEffect(() => {
    setResetHandler(() => handleReset);
    return () => setResetHandler(null);
  }, [setResetHandler, handleReset]);

  const getHint = async () => {
    if (!puzzle || puzzle.solutionWords.length === 0) return;

    const puzzleId = `${puzzle.date}_${puzzle.level}`;
    const remainingLetters = letters.join('');
    const unseenSolution = puzzle.solutionWords.filter(w => !foundWords.includes(w));

    if (unseenSolution.length === 0) {
      setHint('You found all solution words!');
      return;
    }

    let targetWord: string;
    const stored = await getHintTargetAsync('lettermix', puzzleId);
    if (stored && unseenSolution.includes(stored.targetWord)) {
      targetWord = stored.targetWord;
    } else {
      let hintWord: string | null = null;
      for (const word of unseenSolution) {
        if (canFormFromLetters(remainingLetters, word)) {
          hintWord = word;
          break;
        }
      }
      targetWord = hintWord ?? unseenSolution.slice().sort((a, b) => a.length - b.length)[0];
    }

    let hintLevel = stored?.targetWord === targetWord ? stored.hintLevel : 1;
    const maxLevel = 4;

    let hintText: string;
    if (hintLevel === 1) {
      hintText = `Look for a ${targetWord.length}-letter word.`;
    } else if (hintLevel === 2) {
      hintText = `Look for a ${targetWord.length}-letter word starting with "${targetWord[0].toUpperCase()}".`;
    } else if (hintLevel === 3) {
      hintText = `Look for a ${targetWord.length}-letter word starting with "${targetWord.slice(0, 2).toUpperCase()}".`;
    } else {
      hintText = `Look for a ${targetWord.length}-letter word starting with "${targetWord.slice(0, 3).toUpperCase()}".`;
    }

    const showAd = await shouldShowAdForHint('lettermix');
    if (showAd) {
      setHint('Loading ad...');
      const result = await showRewardedAd();
      if (!result.rewarded) {
        setHint('Watch the full ad to get a hint!');
        return;
      }
    }

    setHint(hintText);
    const nextLevel = Math.min(hintLevel + 1, maxLevel);
    await setHintTargetAsync('lettermix', puzzleId, targetWord, nextLevel);
    await recordHintEvent('lettermix', puzzleId, `hint-level-${hintLevel}`, showAd);
  };

  const switchLevel = (newLevel: (typeof LEVELS)[number]) => {
    if (dateParam) {
      navigate(`/lettermix/play/${puzzleDate}/${newLevel}`);
    } else {
      navigate(`/lettermix/play/${newLevel}`);
    }
  };

  // ── Loading states ──
  if (dbLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-sm font-semibold" style={{ color: 'var(--lm-text-muted)' }}>Loading puzzle...</div>
      </div>
    );
  }
  if (!puzzleLoaded) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-sm font-semibold" style={{ color: 'var(--lm-text-muted)' }}>Loading puzzle...</p>
      </div>
    );
  }
  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-sm text-center" style={{ color: 'var(--lm-text-muted)' }}>
          Could not load puzzles. Check that{' '}
          <code style={{ color: 'var(--lm-accent)' }}>/data/lettermix-puzzles.json</code> is available.
        </p>
        <Link
          to="/lettermix"
          className="px-4 py-2 font-bold text-sm text-white rounded"
          style={{ background: 'var(--lm-accent)', textDecoration: 'none' }}
        >
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Rules modal */}
      <AnimatePresence>
        {rulesOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setRulesOpen(false)}
            />
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed z-50 bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
            >
              <div
                className="w-full sm:max-w-md p-6 max-h-[85dvh] overflow-y-auto"
                style={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                  borderBottom: '3px solid var(--lm-border-dark)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-base font-black uppercase tracking-widest"
                    style={{ color: 'var(--lm-accent)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    How to play
                  </h2>
                  <button
                    onClick={() => setRulesOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded text-lg leading-none transition-colors"
                    style={{
                      border: '1px solid var(--lm-border)',
                      color: 'var(--lm-text-muted)',
                      background: 'var(--lm-key-face)',
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <ol className="space-y-4 list-none m-0 p-0">
                  {[
                    'A string of scrambled letters hides several solution words. Your goal is to find all of them to clear the string.',
                    'Tap letters to select them in any order, then press Submit. Any valid English word using those letters is accepted — not just solution words.',
                    'Matched letters disappear. The order you remove words matters — some letters are shared between solution words.',
                    'Stuck? Press Hint to get a clue about a remaining solution word.',
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="font-black w-5 flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--lm-accent)', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: 'var(--lm-text-muted)', lineHeight: '1.6' }}>{text}</span>
                    </li>
                  ))}
                </ol>
                <button
                  onClick={() => setRulesOpen(false)}
                  className="mt-6 w-full py-3 text-sm font-black uppercase tracking-widest text-white rounded transition-colors"
                  style={{
                    background: 'var(--lm-accent)',
                    border: '1px solid var(--lm-accent-dark)',
                    borderBottom: '3px solid var(--lm-accent-side)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#C83232'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lm-accent)'; }}
                >
                  Got it — let&apos;s play
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Game header row */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--lm-text-faint)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {puzzle.date} · {puzzle.level}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--lm-text-muted)' }}>Hidden Words:</span>
              <div className="flex gap-1">
                {Array.from({ length: puzzle.solutionWords.length }).map((_, i) => (
                  <span
                    key={i}
                    className="text-base"
                    style={{ color: i < foundSolutionWords.length ? 'var(--lm-accent)' : 'var(--lm-border-dark)' }}
                  >
                    {i < foundSolutionWords.length ? '●' : '○'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRulesOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded transition-colors"
              style={{
                background: 'var(--lm-key-face)',
                border: '1px solid var(--lm-border)',
                borderBottom: '2px solid var(--lm-border-dark)',
                color: 'var(--lm-text-muted)',
                boxShadow: '0 2px 0 var(--lm-key-side)',
              }}
              aria-label="How to play"
            >
              ?
            </button>
            <button
              onClick={getHint}
              className="px-2.5 py-1 text-xs font-bold rounded transition-colors"
              style={{
                background: 'var(--lm-key-face)',
                border: '1px solid var(--lm-border)',
                borderBottom: '2px solid var(--lm-accent-dark)',
                color: 'var(--lm-accent)',
                boxShadow: '0 2px 0 var(--lm-key-side)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Hint
            </button>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex gap-2 mb-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => switchLevel(l)}
              className="px-3 py-1.5 text-sm font-bold capitalize rounded transition-colors"
              style={
                l === puzzle.level
                  ? {
                      background: 'var(--lm-accent)',
                      color: '#fff',
                      border: '1px solid var(--lm-accent-dark)',
                      borderBottom: '2px solid var(--lm-accent-side)',
                      boxShadow: '0 2px 0 var(--lm-accent-side)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }
                  : {
                      background: 'var(--lm-key-face)',
                      color: 'var(--lm-text-muted)',
                      border: '1px solid var(--lm-border)',
                      borderBottom: '2px solid var(--lm-border-dark)',
                      boxShadow: '0 2px 0 var(--lm-key-side)',
                    }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {hint && (
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--lm-accent)' }}>
            💡 {hint}
          </p>
        )}

        <AnimatePresence mode="wait">
          {isWon ? (
            <motion.div
              key="win"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded p-6 text-center space-y-4"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                borderBottom: '3px solid rgba(16, 185, 129, 0.6)',
              }}
            >
              <p className="text-xl font-black" style={{ color: '#059669' }}>You solved it! 🎉</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--lm-text-muted)' }}>
                Solution words: {foundSolutionWords.join(', ')}
              </p>
              <p className="text-xs" style={{ color: 'var(--lm-text-faint)' }}>
                Total words found: {foundWords.length}
              </p>
              <button
                onClick={() => {
                  const text = `Clear the String ${puzzle.date} (${puzzle.level}): Solved! Found ${foundSolutionWords.length} solution words.`;
                  navigator.clipboard.writeText(text).catch(() => {});
                  setShared(true);
                }}
                className="px-5 py-2 rounded text-sm font-black text-white transition-colors"
                style={{
                  background: '#059669',
                  border: '1px solid #047857',
                  borderBottom: '2px solid #065f46',
                }}
              >
                {shared ? '✓ Copied!' : 'Share result'}
              </button>
            </motion.div>
          ) : isStuck ? (
            <motion.div
              key="stuck"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded p-6 text-center space-y-4"
              style={{
                background: 'rgba(214, 59, 59, 0.06)',
                border: '1px solid rgba(214, 59, 59, 0.4)',
                borderBottom: '3px solid rgba(214, 59, 59, 0.5)',
              }}
            >
              <p className="text-xl font-black" style={{ color: 'var(--lm-accent)' }}>Stuck!</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--lm-text-muted)' }}>
                Can&apos;t form any more words. You found {foundSolutionWords.length} of {puzzle.solutionWords.length} solution words.
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--lm-text-faint)' }}>
                Remaining: {letters.join('').toUpperCase()}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded text-sm font-black text-white"
                style={{
                  background: 'var(--lm-accent)',
                  border: '1px solid var(--lm-accent-dark)',
                  borderBottom: '2px solid var(--lm-accent-side)',
                }}
              >
                Reset Puzzle
              </button>
            </motion.div>
          ) : (
            <motion.div key="game" className="space-y-4">
              {/* Letter tiles — keycap style */}
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
                      className={`lettermix-key ${selectedIndices.includes(i) ? 'lettermix-key-selected' : ''}`}
                    >
                      {letter.toUpperCase()}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Word input area */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 px-4 py-2.5 text-lg font-mono font-semibold rounded"
                  style={{
                    background: 'var(--lm-surface)',
                    border: '1px solid var(--lm-border)',
                    borderBottom: '2px solid var(--lm-border-dark)',
                    color: selectedWord ? 'var(--lm-text)' : 'var(--lm-text-faint)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.08em',
                  }}
                >
                  {selectedWord.toUpperCase() || '_ _ _'}
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded text-sm font-black text-white transition-colors"
                  style={{
                    background: 'var(--lm-accent)',
                    border: '1px solid var(--lm-accent-dark)',
                    borderBottom: '3px solid var(--lm-accent-side)',
                    boxShadow: '0 3px 0 var(--lm-accent-side)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.04em',
                  }}
                  onMouseDown={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 var(--lm-accent-side)';
                  }}
                  onMouseUp={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--lm-accent-side)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--lm-accent-side)';
                  }}
                >
                  Submit
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded text-sm font-semibold transition-colors"
                  style={{
                    background: 'var(--lm-key-face)',
                    border: '1px solid var(--lm-border)',
                    borderBottom: '3px solid var(--lm-border-dark)',
                    boxShadow: '0 3px 0 var(--lm-key-side)',
                    color: 'var(--lm-text-muted)',
                  }}
                  onMouseDown={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 var(--lm-key-side)';
                  }}
                  onMouseUp={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--lm-key-side)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--lm-key-side)';
                  }}
                >
                  Clear
                </button>
              </div>

              {/* Feedback message */}
              {message && (
                <p
                  className="text-sm font-bold"
                  style={{ color: message.type === 'success' ? '#059669' : 'var(--lm-accent)' }}
                >
                  {message.text}
                </p>
              )}

              {/* Found words */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--lm-text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                  Found words
                </p>
                <div className="flex flex-wrap gap-2">
                  {foundWords.map((w, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded text-sm font-bold uppercase"
                      style={{
                        background: 'rgba(214, 59, 59, 0.08)',
                        border: '1px solid rgba(214, 59, 59, 0.3)',
                        color: 'var(--lm-accent)',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.06em',
                      }}
                    >
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
