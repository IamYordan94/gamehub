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
    <span key={i} style={prev[i] !== ch ? { color: 'var(--cbo-highlight)', fontWeight: 800 } : {}}>
      {ch.toUpperCase()}
    </span>
  ));
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function WordChain({ chain }: { chain: string[] }) {
  return (
    <div className="w-full">
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        Your path
      </p>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {chain.map((word, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="cbo-chain-word">
              {i > 0 ? highlightDiff(chain[i - 1], word) : word.toUpperCase()}
            </div>
            {i < chain.length - 1 && (
              <span className="text-sm font-bold" style={{ color: 'var(--cbo-accent)' }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PuzzleTab({ ps, active, onClick }: { ps: CboPuzzleState; active: boolean; onClick: () => void }) {
  const isDone = ps.status === 'won';
  return (
    <button
      onClick={onClick}
      className={`cbo-tab ${active ? 'cbo-tab-active' : isDone ? 'cbo-tab-done' : ''}`}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-md w-full p-6"
        style={{
          background: 'var(--cbo-surface)',
          border: '1px solid var(--cbo-border)',
          borderBottom: '3px solid var(--cbo-border-dark)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2
            className="text-base font-black uppercase tracking-widest"
            style={{ color: 'var(--cbo-accent)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-lg leading-none"
            style={{
              background: 'var(--cbo-surface-2)',
              border: '1px solid var(--cbo-border)',
              color: 'var(--cbo-text-muted)',
            }}
          >
            ✕
          </button>
        </div>
        <ol className="space-y-3 list-none m-0 p-0">
          {[
            <>You're given a <strong style={{ color: 'var(--cbo-text)' }}>start word</strong> and a <strong style={{ color: 'var(--cbo-text)' }}>target word</strong> of the same length.</>,
            <>Each step, type a new word that differs from the previous word by <strong style={{ color: 'var(--cbo-text)' }}>exactly one letter</strong>.</>,
            <>Every word you type must be a <strong style={{ color: 'var(--cbo-text)' }}>real English word</strong>.</>,
            <>Reach the target word in as few steps as possible. The puzzle resets if you exceed the move limit.</>,
          ].map((text, i) => (
            <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--cbo-text-muted)', lineHeight: '1.6' }}>
              <span
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(62,159,168,0.12)', color: 'var(--cbo-accent)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {i + 1}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <div
          className="mt-4 p-3 rounded"
          style={{ background: 'var(--cbo-surface-2)', border: '1px solid var(--cbo-border)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            Example: CAT → DOG
          </p>
          <div className="flex items-center gap-2 flex-wrap text-sm font-mono font-bold">
            <span style={{ color: 'var(--cbo-highlight)' }}>CAT</span>
            <span style={{ color: 'var(--cbo-text-muted)' }}>→</span>
            <span style={{ color: 'var(--cbo-text)' }}>COT</span>
            <span style={{ color: 'var(--cbo-text-muted)' }}>→</span>
            <span style={{ color: 'var(--cbo-text)' }}>DOT</span>
            <span style={{ color: 'var(--cbo-text-muted)' }}>→</span>
            <span style={{ color: 'var(--cbo-accent)' }}>DOG</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="cbo-btn-primary mt-5 w-full justify-center py-3"
          style={{ fontSize: '13px' }}
        >
          Got it — let&apos;s play
        </button>
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
    if (used >= 2) { setHintText('No more hints for this puzzle.'); return; }

    const puzzleId = `${getTodayCboDateStr()}_${activeLength}`;
    const words = getCboWordsByLength(activeLength);
    const usedWords = activePuzzle.wordChain.slice(1);

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
    const maxLevel = 2;
    let hintTextToShow: string;
    if (targetWord) {
      hintTextToShow = hintLevel === 1
        ? `Try a word starting with "${targetWord[0].toUpperCase()}".`
        : `Try a word starting with "${targetWord.slice(0, 2).toUpperCase()}".`;
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
      if (!result.rewarded) { setHintText('Watch the full ad to get a hint!'); return; }
    }

    setHintText(hintTextToShow);
    if (targetWord) {
      const nextLevel = Math.min(hintLevel + 1, maxLevel);
      await setHintTargetAsync('changebyone', puzzleId, targetWord, nextLevel);
    }
    setHintsUsed(prev => ({ ...prev, [activeLength]: used + 1 }));
    await recordHintEvent('changebyone', puzzleId, `hint-level-${hintLevel}`, showAd);
  }, [activePuzzle, activeLength, hintsUsed]);

  // ── Loading / error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--cbo-border)', borderTopColor: 'var(--cbo-accent)' }}
        />
        <p className="text-sm font-semibold" style={{ color: 'var(--cbo-text-muted)' }}>Loading today's challenge…</p>
      </div>
    );
  }

  if (error || !gameState || !activePuzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold" style={{ color: 'var(--cbo-accent)' }}>{error ?? 'Could not load game'}</p>
        <button onClick={() => window.location.reload()} className="cbo-btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  const completedCount = gameState.puzzles.filter(p => p.status === 'won').length;
  const totalPuzzles = gameState.puzzles.length;
  const allDone = completedCount === totalPuzzles;

  return (
    <div className="space-y-4">

      {/* Puzzle selector bar */}
      <div
        className="p-4"
        style={{
          background: 'var(--cbo-surface)',
          border: '1px solid var(--cbo-border)',
          borderBottom: '2px solid var(--cbo-border-dark)',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
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
                className={`cbo-dot ${ps.status === 'won' ? 'cbo-dot-won' : ''}`}
                title={`${ps.length}-letter: ${ps.status}`}
              />
            ))}
            <span
              className="text-xs font-bold ml-1"
              style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {completedCount}/{totalPuzzles}
            </span>
          </div>
        </div>
      </div>

      {/* Main game card */}
      <div
        className="p-5 space-y-5"
        style={{
          background: 'var(--cbo-surface)',
          border: '1px solid var(--cbo-border)',
          borderBottom: '2px solid var(--cbo-border-dark)',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      >
        {/* Puzzle label + start → target */}
        <div className="text-center space-y-3">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {activePuzzle.length}-Letter Puzzle · {gameState.date}
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="cbo-word-key cbo-word-start">
              {activePuzzle.start_word.toUpperCase()}
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--cbo-text-muted)' }}>→</span>
            <div className="cbo-word-key cbo-word-target">
              {activePuzzle.end_word.toUpperCase()}
            </div>
          </div>
        </div>

        {/* All done banner */}
        {allDone && (
          <div
            className="rounded p-4 text-center"
            style={{
              background: 'rgba(62,159,168,0.08)',
              border: '1px solid rgba(62,159,168,0.4)',
              borderBottom: '2px solid rgba(62,159,168,0.5)',
            }}
          >
            <p className="font-bold" style={{ color: 'var(--cbo-accent)' }}>🎉 All {totalPuzzles} puzzles solved!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cbo-text-muted)' }}>Come back tomorrow for a new set.</p>
          </div>
        )}

        {/* Next puzzle button */}
        {activePuzzle.status === 'won' && (() => {
          const next = gameState.puzzles.find(p => p.length > activeLength && p.status !== 'won');
          return next ? (
            <div className="flex justify-center">
              <button onClick={() => setActiveLength(next.length)} className="cbo-btn-primary">
                Next Puzzle ({next.length}L)
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          ) : null;
        })()}

        {/* Word chain */}
        {activePuzzle.wordChain.length > 1 && (
          <WordChain chain={activePuzzle.wordChain} />
        )}

        {/* Input row */}
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
              className="cbo-input"
            />
            <button
              onClick={handleSubmit}
              disabled={input.length !== activeLength}
              className="cbo-btn-primary"
              style={{ padding: '12px 20px', fontSize: '15px' }}
            >
              Go
            </button>
          </div>
        )}

        {/* Error feedback */}
        <AnimatePresence>
          {activePuzzle.errors.length > 0 && (
            <motion.div
              key={activePuzzle.errors[activePuzzle.errors.length - 1]}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded px-4 py-2.5 text-sm text-center font-semibold"
              style={{
                background: 'rgba(214,59,59,0.07)',
                border: '1px solid rgba(214,59,59,0.3)',
                color: '#c0392b',
              }}
            >
              {activePuzzle.errors[activePuzzle.errors.length - 1]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win state */}
        {activePuzzle.status === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded px-4 py-3 text-sm text-center font-bold"
            style={{
              background: 'rgba(62,159,168,0.08)',
              border: '1px solid rgba(62,159,168,0.4)',
              borderBottom: '2px solid rgba(62,159,168,0.5)',
              color: 'var(--cbo-accent)',
            }}
          >
            🎉 Solved in {activePuzzle.moves} step{activePuzzle.moves !== 1 ? 's' : ''}!
          </motion.div>
        )}

        {/* Hint text */}
        {hintText && (
          <motion.div
            key={hintText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded px-4 py-2.5 text-sm text-center font-semibold"
            style={{
              background: 'rgba(216,169,58,0.08)',
              border: '1px solid rgba(216,169,58,0.35)',
              color: 'var(--cbo-highlight)',
            }}
          >
            💡 {hintText}
          </motion.div>
        )}

        {/* Bottom controls */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--cbo-border)' }}
        >
          {/* Move counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Moves</span>
            <div className="flex gap-1">
              {Array.from({ length: activePuzzle.maxMoves }).map((_, i) => (
                <div
                  key={i}
                  className={`cbo-dot ${
                    i < activePuzzle.moves
                      ? activePuzzle.status === 'won' ? 'cbo-dot-won' : 'cbo-dot-used'
                      : ''
                  }`}
                />
              ))}
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {activePuzzle.moves}/{activePuzzle.maxMoves}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleHint}
              disabled={activePuzzle.status === 'won' || (hintsUsed[activeLength] ?? 0) >= 2}
              className="cbo-btn-highlight"
              title={`Hint (${2 - (hintsUsed[activeLength] ?? 0)} remaining)`}
            >
              💡 Hint ({2 - (hintsUsed[activeLength] ?? 0)})
            </button>
            {activePuzzle.status !== 'won' && (
              <button onClick={handleReset} className="cbo-btn-secondary">
                Reset
              </button>
            )}
            <button onClick={() => setShowRules(true)} className="cbo-btn-secondary" style={{ padding: '8px 12px' }}>
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
