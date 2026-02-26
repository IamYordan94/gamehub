import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWordPoolProgress } from '../utils/storage';

type Level = { level: number; name: string; words: string[] };
type Category = { id: string; name: string; levels: Level[] };

export default function WordPoolPreviousGames() {
  const [categories, setCategories] = useState<Category[]>([]);
  const progress = getWordPoolProgress();

  useEffect(() => {
    fetch('/data/wordpool-categories.json')
      .then((r) => r.json())
      .then((d: { categories: Category[] }) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#f59e0b]">Progress</h2>
      <p className="text-sm text-[#a78b71]">
        Your unlocked levels per category. Click to play a specific category.
      </p>

      {categories.length === 0 ? (
        <div className="animate-pulse text-[#a78b71] text-sm">Loading...</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const unlockedLevel = progress[cat.id] ?? 1;
            const currentLevelName = cat.levels.find((l) => l.level === Math.min(unlockedLevel, cat.levels.length))?.name ?? '';
            const allComplete = unlockedLevel > cat.levels.length;

            return (
              <div key={cat.id} className="rounded-lg border border-[#422006] bg-[#292524] px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[#fef3c7] font-medium">{cat.name}</span>
                  <Link
                    to={`/wordpool/category/${cat.id}`}
                    className="text-sm px-3 py-1 rounded-lg bg-[#f59e0b] text-[#1a1410] font-medium hover:bg-[#fbbf24]"
                  >
                    Play
                  </Link>
                </div>

                {/* Level progress bar */}
                <div className="flex gap-1 mb-1.5">
                  {cat.levels.map((l) => (
                    <div
                      key={l.level}
                      className={`h-1.5 flex-1 rounded-full ${
                        l.level < unlockedLevel
                          ? 'bg-[#10b981]'
                          : l.level === unlockedLevel && !allComplete
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#422006]'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#a78b71]">
                  {allComplete
                    ? 'All levels complete!'
                    : `Level ${unlockedLevel}: ${currentLevelName}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
