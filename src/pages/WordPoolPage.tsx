import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayDateStr, getDailyPuzzleIndex } from '../utils/dailySeed';
import { shouldShowAdForHint, showRewardedAd } from '../utils/ads';
import { recordHintEvent } from '../utils/database';
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

  // Load category + restore session words
  useEffect(() => {
    setInput('');
    setMessage(null);
    setShared(false);
    setHint(null);

    fetch('/data/wordpool-categories.json')
      .then((r) => r.json())
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

        // All levels are always accessible; track highest reached for display only
        const unlocked = getWordPoolUnlockedLevel(cat.id);
        setMaxUnlocked(cat.levels.length);
        const lvlNum = Math.min(unlocked, cat.levels.length);
        const lvl = cat.levels[lvlNum - 1];
        setLevel(lvl);

        // Restore session words
        const saved = getWordPoolSessionWords(cat.id, lvlNum);
        setFoundWords(saved);
      });
  }, [puzzleDate, categoryId]);

  // Switch level within the same category
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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Clear hint and stored hint target when user finds the word we were hinting for
    if (hint && hint.word === word) {
      setHint(null);
      clearHintTargetAsync('wordpool', `${category.id}_${level.level}`);
    }
  };

  const isComplete = !!(level && foundWords.length === level.words.length);

  // Unlock next level when complete
  useEffect(() => {
    if (isComplete && category && level) {
      unlockWordPoolLevel(category.id, level.level);
      setMaxUnlocked((prev) => Math.max(prev, Math.min(level.level + 1, category.levels.length)));
      // Clear session words and hint target since level is done
      clearWordPoolSessionWords(category.id, level.level);
      clearHintTargetAsync('wordpool', `${category.id}_${level.level}`);
    }
  }, [isComplete, category, level]);

  // Hint system: stay on ONE word until found, progressive reveal (length → 1st → 2nd → 3rd letter)
  const handleHint = async () => {
    if (!level || !category) return;
    const puzzleId = `${category.id}_${level.level}`;
    const unfound = level.words.filter((w) => !foundWords.includes(w));
    if (unfound.length === 0) return;

    // Pick target: use stored hint target if still unfound, else first unfound alphabetically
    const stored = await getHintTargetAsync('wordpool', puzzleId);
    let targetWord = stored?.targetWord ?? unfound.slice().sort()[0];
    if (!unfound.includes(targetWord)) targetWord = unfound.slice().sort()[0];

    let hintLevel = stored?.targetWord === targetWord ? stored.hintLevel : 1;
    const maxLevel = 4;

    const showAd = await shouldShowAdForHint('wordpool');

    if (showAd) {
      const result = await showRewardedAd();

      if (!result.rewarded) {
        setMessage({ text: 'Watch the full ad to get a hint!', type: 'error' });
        return;
      }
    }

    setHint({ word: targetWord, stage: hintLevel as 1 | 2 | 3 | 4 });
    const nextLevel = Math.min(hintLevel + 1, maxLevel);
    await setHintTargetAsync('wordpool', puzzleId, targetWord, nextLevel);
    await recordHintEvent('wordpool', puzzleId, `hint-level-${hintLevel}`, showAd);
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
        <div className="animate-pulse text-[#9ca3af]">Loading puzzle...</div>
      </div>
    );
  }

  const remaining = level.words.length - foundWords.length;

  return (
    <div className="space-y-6">
      {/* Category + Level header */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold">
            {categoryId ? 'Category' : `Today · ${puzzleDate}`}
          </span>
          <span className="text-sm text-[#34d399] font-semibold">
            {category.name}
          </span>
        </div>

        {/* Level selector — all levels always accessible */}
        <div className="flex gap-1.5 flex-wrap">
          {category.levels.map((lvl) => {
            const isActive = lvl.level === level.level;
            const isDone = lvl.level < (getWordPoolUnlockedLevel(category.id) ?? 1);
            return (
              <button
                key={lvl.level}
                onClick={() => switchLevel(lvl)}
                title={lvl.name}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#34d399] text-[#0f0f1a]'
                    : isDone
                    ? 'border border-[#34d399]/40 text-[#34d399] hover:border-[#34d399]/70'
                    : 'border border-[#3a3a48] text-[#9ca3af] hover:border-[#34d399]/50 hover:text-[#e8e9ed]'
                }`}
              >
                L{lvl.level}
              </button>
            );
          })}
        </div>

        {/* Current level name */}
        <p className="text-[#9ca3af] text-sm mt-2">
          <span className="text-[#e8e9ed] font-semibold">Level {level.level}:</span>{' '}
          {level.name}
        </p>
      </section>

      {/* Game area */}
      <section>
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-[#e8e9ed]">
            {foundWords.length} <span className="text-[#6b7280]">/</span> {level.words.length}
            <span className="text-sm font-normal text-[#9ca3af] ml-2">words found</span>
          </p>
          {!isComplete && (
            <button
              onClick={handleHint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2a38] border border-[#3a3a48] text-[#9ca3af] hover:border-[#34d399]/50 hover:text-[#34d399] transition-colors"
            >
              Hint
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#2a1a0a] mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#34d399]"
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
            className="mb-3 px-4 py-2 rounded-lg border border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399] text-sm font-medium flex items-center justify-between gap-2"
          >
            <span>💡 {hintText}</span>
            <button onClick={() => setHint(null)} className="text-[#6b7280] hover:text-[#9ca3af] text-xs">
              ✕
            </button>
          </motion.div>
        )}

        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-[#10b981]/20 border border-[#10b981] p-6 text-center space-y-4"
          >
            <p className="text-xl font-semibold text-[#34d399]">Level complete!</p>
            <p className="text-[#9ca3af]">
              You found all {level.words.length} words.
              {level.level < category.levels.length
                ? ` Level ${level.level + 1} unlocked!`
                : ' All levels complete!'}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {level.level < category.levels.length && (
                <button
                  onClick={() => switchLevel(category.levels[level.level])}
                  className="px-4 py-2 rounded-lg bg-[#10b981] text-white font-medium hover:bg-[#059669]"
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
                className="px-4 py-2 rounded-lg bg-[#34d399] text-[#0f0f1a] font-medium hover:bg-[#10b981]"
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
                placeholder="Type a word..."
                className="flex-1 px-4 py-3 rounded-lg border border-[#3a3a48] bg-[#2a2a38] text-[#e8e9ed] placeholder-[#9ca3af] focus:outline-none focus:border-[#34d399]"
                autoComplete="off"
                autoCapitalize="off"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-lg bg-[#34d399] text-[#0f0f1a] font-semibold hover:bg-[#10b981] whitespace-nowrap"
              >
                Submit
              </button>
            </form>

            {message && (
              <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {message.text}
              </p>
            )}

            {/* Found words */}
            {foundWords.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-2">Found words</p>
                <div className="flex flex-wrap gap-2">
                  {foundWords.map((w, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[#10b981]/20 text-[#10b981] text-sm font-medium">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining words count */}
            <p className="text-xs text-[#6b7280]">
              {remaining} word{remaining !== 1 ? 's' : ''} remaining in this level
            </p>
          </>
        )}
      </section>

      {/* How to play */}
      <section id="how-to-play" className="rounded-xl border border-[#3a3a48] bg-[#2a2a38]/50 p-5">
        <h2 className="text-sm font-semibold text-[#34d399] uppercase tracking-wider mb-3">How to play</h2>
        <p className="text-[#9ca3af] text-sm leading-relaxed mb-2">
          Type words that belong to the current category constraint. Each level narrows the category — from broad to very specific.
        </p>
        <p className="text-[#9ca3af] text-sm">
          Find all words in a level to unlock the next. Use <strong className="text-[#e8e9ed]">Hint</strong> for progressive clues — we focus on one word at a time (length → first letter → more letters) until you find it.
        </p>
      </section>
    </div>
  );
}
