import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayDateStr, getDailyPuzzleIndex } from '../utils/dailySeed';
import {
  unlockWordPoolLevel,
  getWordPoolUnlockedLevel,
  getWordPoolSessionWords,
  saveWordPoolSessionWords,
  clearWordPoolSessionWords,
  getHintTargetAsync,
  setHintTargetAsync,
  clearHintTargetAsync,
} from '../utils/storage';

type Level = {
  level: number;
  name: string;
  words: string[];
};

type Category = {
  id: string;
  name: string;
  levels: Level[];
};

type WordPoolData = {
  categories: Category[];
};

type HintState = { word: string; stage: 1 | 2 | 3 | 4 } | null;

export default function WordPoolPage() {
  const { date, categoryId } = useParams();
  const puzzleDate = date ?? getTodayDateStr();

  const [data, setData] = useState<WordPoolData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [, setMaxUnlocked] = useState(1);
  const [input, setInput] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [shared, setShared] = useState(false);
  const [hint, setHint] = useState<HintState>(null);

  useEffect(() => {
    setInput('');
    setMessage(null);
    setShared(false);
    setHint(null);

    fetch('/data/wordpool-categories.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load categories');
        return r.json();
      })
      .then((d: WordPoolData) => {
        setData(d);
        let cat: Category;
        if (categoryId) {
          cat = d.categories.find((c) => c.id === categoryId) ?? d.categories[0];
        } else {
          const catIdx = getDailyPuzzleIndex(puzzleDate, d.categories.length);
          cat = d.categories[catIdx];
        }
        setCategory(cat);

        const unlocked = getWordPoolUnlockedLevel(cat.id);
        setMaxUnlocked(cat.levels.length);
        const lvlNum = Math.min(unlocked, cat.levels.length);
        const lvl = cat.levels[lvlNum - 1];
        setLevel(lvl);

        const saved = getWordPoolSessionWords(cat.id, lvlNum);
        setFoundWords(saved);
      })
      .catch(() => {});
  }, [puzzleDate, categoryId]);

  const switchLevel = (lvl: Level) => {
    if (!category) return;
    setLevel(lvl);
    setMessage(null);
    setShared(false);
    setHint(null);
    setInput('');
    const saved = getWordPoolSessionWords(category.id, lvl.level);
    setFoundWords(saved);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const word = input.trim().toLowerCase();
    if (!word || !level || !category) return;

    if (foundWords.includes(word)) {
      setMessage({ text: 'Already found', type: 'error' });
      return;
    }
    if (!level.words.includes(word)) {
      setMessage({ text: 'Not in this category', type: 'error' });
      return;
    }

    const next = [...foundWords, word];
    setFoundWords(next);
    saveWordPoolSessionWords(category.id, level.level, next);
    setInput('');
    setMessage({ text: `✓ ${word}`, type: 'success' });

    if (hint && hint.word === word) {
      setHint(null);
      clearHintTargetAsync('wordpool', `${category.id}_${level.level}`);
    }
  };

  const isComplete = !!(level && foundWords.length === level.words.length);

  useEffect(() => {
    if (isComplete && category && level) {
      unlockWordPoolLevel(category.id, level.level);
      setMaxUnlocked((prev) => Math.max(prev, Math.min(level.level + 1, category.levels.length)));
      clearWordPoolSessionWords(category.id, level.level);
      clearHintTargetAsync('wordpool', `${category.id}_${level.level}`);
    }
  }, [isComplete, category, level]);

  const handleHint = async () => {
    if (!level || !category) return;
    const puzzleId = `${category.id}_${level.level}`;
    const unfound = level.words.filter((w) => !foundWords.includes(w));
    if (unfound.length === 0) return;

    const stored = await getHintTargetAsync('wordpool', puzzleId);
    let targetWord = stored?.targetWord ?? unfound.slice().sort()[0];
    if (!unfound.includes(targetWord)) targetWord = unfound.slice().sort()[0];

    let hintLevel = stored?.targetWord === targetWord ? stored.hintLevel : 1;
    const maxLevel = 4;

    setHint({ word: targetWord, stage: hintLevel as 1 | 2 | 3 | 4 });
    const nextLevel = Math.min(hintLevel + 1, maxLevel);
    await setHintTargetAsync('wordpool', puzzleId, targetWord, nextLevel);
  };

  const hintText = hint
    ? hint.stage === 1
      ? `Try a ${hint.word.length}-letter word.`
      : hint.stage === 2
        ? `Try a ${hint.word.length}-letter word starting with "${hint.word[0].toUpperCase()}".`
        : hint.stage === 3
          ? `Try a ${hint.word.length}-letter word starting with "${hint.word.slice(0, 2).toUpperCase()}".`
          : `Try a ${hint.word.length}-letter word starting with "${hint.word.slice(0, 3).toUpperCase()}".`
    : null;

  if (!data || !category || !level) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="text-sm font-semibold animate-pulse"
          style={{ color: 'var(--wp-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading puzzle…
        </div>
      </div>
    );
  }

  const remaining = level.words.length - foundWords.length;

  return (
    <div className="space-y-5">

      {/* Category + date header */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--wp-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {categoryId ? 'Category' : `Today · ${puzzleDate}`}
          </span>
          <span
            className="text-sm font-black uppercase tracking-wide"
            style={{ color: 'var(--wp-accent-blue-side)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {category.name}
          </span>
        </div>

        {/* Level selector tabs */}
        <div className="flex gap-2 flex-wrap">
          {category.levels.map((lvl) => {
            const isActive = lvl.level === level.level;
            const isDone = lvl.level < (getWordPoolUnlockedLevel(category.id) ?? 1);
            return (
              <button
                key={lvl.level}
                onClick={() => switchLevel(lvl)}
                title={lvl.name}
                className={`wp-tab ${isActive ? 'wp-tab-active' : isDone ? 'wp-tab-done' : ''}`}
              >
                L{lvl.level}
              </button>
            );
          })}
        </div>

        {/* Current level name */}
        <p className="text-sm mt-2 m-0" style={{ color: 'var(--wp-text-muted)' }}>
          <span className="font-bold" style={{ color: 'var(--wp-text)' }}>Level {level.level}:</span>{' '}
          {level.name}
        </p>
      </section>

      {/* Game area */}
      <section>
        {/* Progress row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold m-0" style={{ color: 'var(--wp-text)' }}>
            {foundWords.length}{' '}
            <span style={{ color: 'var(--wp-text-muted)' }}>/</span>{' '}
            {level.words.length}
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--wp-text-muted)' }}>words found</span>
          </p>
          {!isComplete && (
            <button onClick={handleHint} className="wp-btn-pink">
              Hint
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="h-2 rounded-full mb-4 overflow-hidden"
          style={{ background: 'var(--wp-surface-2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--wp-accent-blue)' }}
            initial={false}
            animate={{ width: `${(foundWords.length / level.words.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Hint display */}
        {hintText && (
          <motion.div
            key={hintText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-4 py-2 rounded flex items-center justify-between gap-2"
            style={{
              background: 'rgba(232,183,181,0.15)',
              border: '1px solid var(--wp-accent-pink)',
              color: 'var(--wp-accent-pink-side)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <span>💡 {hintText}</span>
            <button
              onClick={() => setHint(null)}
              style={{ color: 'var(--wp-text-muted)', fontSize: '12px' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--wp-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--wp-text-muted)')}
            >
              ✕
            </button>
          </motion.div>
        )}

        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded p-6 text-center space-y-4"
            style={{
              background: 'rgba(159,195,218,0.15)',
              border: '1px solid var(--wp-accent-blue)',
              borderBottom: '3px solid var(--wp-accent-blue-dark)',
            }}
          >
            <p
              className="text-xl font-black uppercase tracking-widest m-0"
              style={{ color: 'var(--wp-accent-blue-side)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Level complete!
            </p>
            <p className="text-sm m-0" style={{ color: 'var(--wp-text-muted)' }}>
              You found all {level.words.length} words.
              {level.level < category.levels.length
                ? ` Level ${level.level + 1} unlocked!`
                : ' All levels complete!'}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {level.level < category.levels.length && (
                <button
                  onClick={() => switchLevel(category.levels[level.level])}
                  className="wp-btn-primary"
                >
                  Next Level →
                </button>
              )}
              <button
                onClick={() => {
                  const text = `WordPool ${category.name} – L${level.level} (${level.name}): found ${foundWords.length}/${level.words.length} — ${foundWords.join(', ')}`;
                  navigator.clipboard.writeText(text);
                  setShared(true);
                }}
                className="wp-btn-secondary"
              >
                {shared ? 'Copied!' : 'Share'}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setMessage(null); }}
                placeholder="Type a word…"
                className="wp-input flex-1"
                autoComplete="off"
                autoCapitalize="off"
              />
              <button
                type="submit"
                className="wp-btn-primary"
                aria-disabled={!input.trim()}
              >
                Submit
              </button>
            </form>

            {message && (
              <motion.p
                key={message.text}
                initial={{ opacity: 0, x: message.type === 'error' ? -4 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-semibold mb-3 m-0"
                style={{ color: message.type === 'success' ? 'var(--wp-accent-blue-side)' : '#c0443b' }}
              >
                {message.text}
              </motion.p>
            )}

            {/* Found words */}
            {foundWords.length > 0 && (
              <div className="mb-4">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--wp-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Found words
                </p>
                <div className="flex flex-wrap gap-2">
                  {foundWords.map((w, i) => (
                    <span key={i} className="wp-word-chip">{w}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining count */}
            <p className="text-xs m-0" style={{ color: 'var(--wp-text-muted)' }}>
              {remaining} word{remaining !== 1 ? 's' : ''} remaining in this level
            </p>
          </>
        )}
      </section>

      {/* How to play info card */}
      <section>
        <div
          className="wp-card"
          style={{ borderLeft: '3px solid var(--wp-accent-blue)' }}
        >
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--wp-accent-blue-side)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            How to play
          </h2>
          <p className="text-sm leading-relaxed mb-2 m-0" style={{ color: 'var(--wp-text-muted)' }}>
            Type words that belong to the current category constraint. Each level narrows the category — from broad to very specific.
          </p>
          <p className="text-sm m-0" style={{ color: 'var(--wp-text-muted)' }}>
            Find all words in a level to unlock the next. Use <strong style={{ color: 'var(--wp-text)' }}>Hint</strong> for progressive clues.
          </p>
        </div>
      </section>

    </div>
  );
}
