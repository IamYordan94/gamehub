import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCboWords, getCboWordsByLength, isCboWordsLoaded } from '../utils/cbo-words';
import { loadCboDailyChallenge, getTodayCboDateStr } from '../utils/cbo-dailyChallenge';
import {
  initDailyState,
  submitWordToState,
  resetPuzzleState,
  saveCboState,
  loadCboState,
} from '../utils/cbo-gameState';
import type { CboDailyState, CboPuzzleState } from '../utils/cbo-gameState';
import { suggestNextStep, getAnyValidNeighbor, getDifferingLetterIndex, hasOneLetterDifference } from '../utils/cbo-gameLogic';
import { shouldShowAdForHint, showRewardedAd } from '../utils/ads';
import { recordHintEvent } from '../utils/database';
import { getHintTargetAsync, setHintTargetAsync, clearHintTargetAsync } from '../utils/storage';

// ─── Helpers ────────────────────────────────────────────────────────────────

function highlightDiff(prev: string, current: string): React.ReactElement[] {
  return current.split('').map((ch, i) => (
    <span
      key={i}
      className={prev[i] !== ch ? 'text-[#fbbf24] font-bold' : ''}
    >
      {ch.toUpperCase()}
    </span>
  ));
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function WordChain({ chain }: { chain: string[] }) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Your path</p>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {chain.map((word, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#21262d] rounded-lg border border-[#30363d] font-mono text-sm font-semibold text-white">
              {i > 0 ? highlightDiff(chain[i - 1], word) : word.toUpperCase()}
            </div>
            {i < chain.length - 1 && (
              <span className="text-[#fbbf24] text-sm font-bold">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PuzzleTab({
  ps,
  active,
  onClick,
}: {
  ps: CboPuzzleState;
  active: boolean;
  onClick: () => void;
}) {
  const isDone = ps.status === 'won';
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        active
          ? 'bg-[#fbbf24] text-[#0f0f1a]'
          : isDone
          ? 'border border-[#34d399]/40 text-[#34d399] hover:border-[#34d399]/70'
          : 'border border-[#3a3a48] text-[#9ca3af] hover:border-[#fbbf24]/50 hover:text-[#e8e9ed]'
      }`}
    >
      {ps.length}L
    </button>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#fbbf24]">How to Play</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#8b949e] text-lg"
          >
            ✕
          </button>
        </div>
        <ol className="space-y-3 text-sm text-[#c9d1d9]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold flex items-center justify-center">1</span>
            <span>You're given a <strong className="text-[#e8e9ed]">start word</strong> and a <strong className="text-[#e8e9ed]">target word</strong> of the same length.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold flex items-center justify-center">2</span>
            <span>Each step, type a new word that differs from the previous word by <strong className="text-[#e8e9ed]">exactly one letter</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold flex items-center justify-center">3</span>
            <span>Every word you type must be a <strong className="text-[#e8e9ed]">real English word</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold flex items-center justify-center">4</span>
            <span>Reach the target word in as few steps as possible. The puzzle resets if you exceed the move limit.</span>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-[#21262d] rounded-lg">
          <p className="text-xs text-[#8b949e] mb-2">Example: CAT → DOG</p>
          <div className="flex items-center gap-2 flex-wrap text-sm font-mono font-bold">
            <span className="text-[#fbbf24]">CAT</span>
            <span className="text-[#9ca3af]">→</span>
            <span className="text-white">COT</span>
            <span className="text-[#8b949e]">→</span>
            <span className="text-white">DOT</span>
            <span className="text-[#8b949e]">→</span>
            <span className="text-[#10b981]">DOG</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ChangeByOnePage() {
  const [, setWordsReady] = useState(isCboWordsLoaded());
  const [gameState, setGameState] = useState<CboDailyState | null>(null);
  const [activeLength, setActiveLength] = useState<number>(4);
  const [input, setInput] = useState('');
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState<Record<number, number>>({});
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load words and daily challenge on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        await loadCboWords();
        if (cancelled) return;
        setWordsReady(true);

        const date = getTodayCboDateStr();
        const challenge = await loadCboDailyChallenge(date);
        if (cancelled) return;

        const saved = loadCboState(date);
        if (saved && saved.puzzles.length === challenge.puzzles.length) {
          setGameState(saved);
          const firstIncomplete = saved.puzzles.find(p => p.status !== 'won');
          setActiveLength(firstIncomplete?.length ?? challenge.puzzles[0].length);
        } else {
          const fresh = initDailyState(date, challenge.puzzles);
          setGameState(fresh);
          setActiveLength(challenge.puzzles[0].length);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load game');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const activePuzzle = gameState?.puzzles.find(p => p.length === activeLength);

  // Clear hint when switching puzzles
  useEffect(() => {
    setHintText(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [activeLength]);

  const handleSubmit = useCallback(() => {
    if (!gameState || !activePuzzle) return;
    const word = input.trim().toLowerCase();
    if (word.length !== activeLength) return;

    const newState = submitWordToState(gameState, activeLength, word);
    setGameState(newState);
    saveCboState(newState);
    setInput('');
    setHintText(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [gameState, activePuzzle, input, activeLength]);

  const handleReset = useCallback(() => {
    if (!gameState) return;
    const newState = resetPuzzleState(gameState, activeLength);
    setGameState(newState);
    saveCboState(newState);
    setInput('');
    setHintText(null);
    clearHintTargetAsync('changebyone', `${getTodayCboDateStr()}_${activeLength}`);
  }, [gameState, activeLength]);

  const handleHint = useCallback(async () => {
    if (!activePuzzle || activePuzzle.status === 'won') return;
    const used = hintsUsed[activeLength] ?? 0;
    if (used >= 2) {
      setHintText('No more hints for this puzzle.');
      return;
    }

    const puzzleId = `${getTodayCboDateStr()}_${activeLength}`;
    const words = getCboWordsByLength(activeLength);
    const usedWords = activePuzzle.wordChain.slice(1);

    // Pick target: use stored hint target if still valid (not yet in chain), else compute next word
    let targetWord: string | null = null;
    const stored = await getHintTargetAsync('changebyone', puzzleId);
    if (stored && !usedWords.includes(stored.targetWord) && hasOneLetterDifference(activePuzzle.currentWord, stored.targetWord)) {
      targetWord = stored.targetWord;
    }
    if (!targetWord) {
      targetWord = suggestNextStep(activePuzzle.currentWord, activePuzzle.end_word, words)
        ?? getAnyValidNeighbor(activePuzzle.currentWord, words, usedWords);
    }

    let hintLevel = stored?.targetWord === targetWord ? stored.hintLevel : 1;
    const maxLevel = 2; // 2 hints per puzzle: 1st letter, then 2nd letter (or position)

    let hintTextToShow: string;
    if (targetWord) {
      if (hintLevel === 1) {
        hintTextToShow = `Try a word starting with "${targetWord[0].toUpperCase()}".`;
      } else {
        hintTextToShow = `Try a word starting with "${targetWord.slice(0, 2).toUpperCase()}".`;
      }
    } else {
      const diffIdx = getDifferingLetterIndex(activePuzzle.currentWord, activePuzzle.end_word);
      if (diffIdx !== null) {
        const pos = diffIdx + 1;
        hintTextToShow = `Try changing the ${pos}${pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} letter — it differs from the target.`;
      } else {
        hintTextToShow = 'Try going back a step and choosing a different word.';
      }
    }

    const showAd = await shouldShowAdForHint('changebyone');

    if (showAd) {
      setHintText('Loading ad...');
      const result = await showRewardedAd();

      if (!result.rewarded) {
        setHintText('Watch the full ad to get a hint!');
        return;
      }
    }

    setHintText(hintTextToShow);
    if (targetWord) {
      const nextLevel = Math.min(hintLevel + 1, maxLevel);
      await setHintTargetAsync('changebyone', puzzleId, targetWord, nextLevel);
    }
    setHintsUsed(prev => ({ ...prev, [activeLength]: used + 1 }));
    await recordHintEvent('changebyone', puzzleId, `hint-level-${hintLevel}`, showAd);
  }, [activePuzzle, activeLength, hintsUsed]);

  // ── Loading / error states ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#3a3a48] border-t-[#fbbf24] animate-spin" />
        <p className="text-[#9ca3af] text-sm">Loading today's challenge…</p>
      </div>
    );
  }

  if (error || !gameState || !activePuzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="text-[#f85149] font-semibold">{error ?? 'Could not load game'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = gameState.puzzles.filter(p => p.status === 'won').length;
  const totalPuzzles = gameState.puzzles.length;
  const allDone = completedCount === totalPuzzles;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-[#e8e9ed]">
          Change<span className="text-base mx-1 text-[#fbbf24]">by</span>One
        </h2>
        <p className="text-sm text-[#8b949e]">
          Transform the start word into the target — one letter at a time.
        </p>
        <p className="text-xs text-[#6e7681]">{gameState.date}</p>
      </div>

      {/* Puzzle selector + progress */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
        <div className="flex items-center justify-between mb-3 gap-4">
          <div className="flex gap-2 flex-wrap">
            {gameState.puzzles.map(ps => (
              <PuzzleTab
                key={ps.length}
                ps={ps}
                active={ps.length === activeLength}
                onClick={() => setActiveLength(ps.length)}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {gameState.puzzles.map(ps => (
              <div
                key={ps.length}
                className={`w-2 h-2 rounded-full ${
                  ps.status === 'won' ? 'bg-[#10b981]' : 'bg-[#30363d]'
                }`}
                title={`${ps.length}-letter: ${ps.status}`}
              />
            ))}
            <span className="text-xs text-[#8b949e] ml-1">{completedCount}/{totalPuzzles}</span>
          </div>
        </div>
      </div>

      {/* Main game card */}
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 space-y-5">
        {/* Start → Target */}
        <div className="text-center">
          <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
            {activePuzzle.length}-Letter Puzzle
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 font-mono font-bold text-[#fbbf24] text-lg tracking-widest">
              {activePuzzle.start_word.toUpperCase()}
            </div>
            <span className="text-[#8b949e] text-xl">→</span>
            <div className="px-4 py-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 font-mono font-bold text-[#10b981] text-lg tracking-widest">
              {activePuzzle.end_word.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Next challenge button when won */}
        {activePuzzle.status === 'won' && (() => {
          const next = gameState.puzzles.find(p => p.length > activeLength && p.status !== 'won');
          return next ? (
            <div className="flex justify-center">
              <button
                onClick={() => setActiveLength(next.length)}
                className="px-6 py-2.5 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0f0f1a] font-bold rounded-xl text-sm transition-all flex items-center gap-2"
              >
                Next Puzzle ({next.length}L)
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          ) : null;
        })()}

        {/* All done banner */}
        {allDone && (
          <div className="rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 p-4 text-center">
            <p className="text-[#10b981] font-bold">🎉 All {totalPuzzles} puzzles solved!</p>
            <p className="text-xs text-[#8b949e] mt-1">Come back tomorrow for a new set.</p>
          </div>
        )}

        {/* Word chain */}
        {activePuzzle.wordChain.length > 1 && (
          <WordChain chain={activePuzzle.wordChain} />
        )}

        {/* Input */}
        {activePuzzle.status !== 'won' && (
          <div className="flex items-center gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => {
                const v = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
                if (v.length <= activeLength) setInput(v);
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={`${activeLength}-letter word`}
              maxLength={activeLength}
              autoFocus
              className="flex-1 px-4 py-3 text-center text-lg font-bold font-mono bg-[#1a1a24] border border-[#3a3a48] rounded-xl text-[#e8e9ed] placeholder-[#6b7280] focus:outline-none focus:border-[#fbbf24] transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={input.length !== activeLength}
              className="px-5 py-3 bg-[#fbbf24] disabled:bg-[#2a2a38] disabled:text-[#6b7280] text-[#0f0f1a] font-bold rounded-xl transition-all hover:bg-[#f59e0b] disabled:cursor-not-allowed"
            >
              Go
            </button>
          </div>
        )}

        {/* Feedback messages */}
        <AnimatePresence>
          {activePuzzle.errors.length > 0 && (
            <motion.div
              key={activePuzzle.errors[activePuzzle.errors.length - 1]}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-[#f8514920] border border-[#f85149]/30 px-4 py-2.5 text-sm text-[#f85149] text-center"
            >
              {activePuzzle.errors[activePuzzle.errors.length - 1]}
            </motion.div>
          )}
        </AnimatePresence>

        {activePuzzle.status === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 px-4 py-3 text-sm text-[#10b981] text-center font-semibold"
          >
            🎉 Solved in {activePuzzle.moves} step{activePuzzle.moves !== 1 ? 's' : ''}!
          </motion.div>
        )}

        {hintText && (
          <motion.div
            key={hintText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-4 py-2.5 text-sm text-[#fbbf24] text-center"
          >
            💡 {hintText}
          </motion.div>
        )}

        {/* Bottom controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
          {/* Move counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Moves</span>
            <div className="flex gap-1">
              {Array.from({ length: activePuzzle.maxMoves }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < activePuzzle.moves
                      ? activePuzzle.status === 'won'
                        ? 'bg-[#34d399]'
                        : 'bg-[#fbbf24]'
                      : 'bg-[#3a3a48]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#6e7681]">{activePuzzle.moves}/{activePuzzle.maxMoves}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleHint}
              disabled={activePuzzle.status === 'won' || (hintsUsed[activeLength] ?? 0) >= 2}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#fbbf24]/30 text-[#fbbf24] hover:border-[#fbbf24]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={`Hint (${2 - (hintsUsed[activeLength] ?? 0)} remaining)`}
            >
              Hint ({2 - (hintsUsed[activeLength] ?? 0)})
            </button>
            {activePuzzle.status !== 'won' && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/60 hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#3a3a48] text-[#9ca3af] hover:border-[#fbbf24]/50 hover:text-[#fbbf24] transition-colors"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Rules modal */}
      <AnimatePresence>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
