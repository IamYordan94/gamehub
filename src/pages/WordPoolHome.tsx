import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LetterMixBackgroundGrid from '../components/LetterMixBackgroundGrid';
import { getTodayDateStr, getDailyPuzzleIndex } from '../utils/dailySeed';

type Category = { id: string; name: string; levels: { level: number; name: string }[] };
type WordPoolData = { categories: Category[] };

export default function WordPoolHome() {
  const today = getTodayDateStr();
  const [data, setData] = useState<WordPoolData | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    fetch('/data/wordpool-categories.json')
      .then((r) => r.json())
      .then(setData);
  }, []);

  const todayCategory = data
    ? data.categories[getDailyPuzzleIndex(today, data.categories.length)]
    : null;

  return (
    <>
      <LetterMixBackgroundGrid />
      <div className="min-h-screen flex items-center justify-center px-[18px] py-[56px]">
        <section className="w-full max-w-[520px] flex flex-col items-center gap-[14px] text-center">
          <div className="w-full flex justify-start mb-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-[rgba(255,255,255,0.78)] font-[750] tracking-[0.01em] hover:text-[rgba(255,255,255,0.92)] transition-colors text-sm"
            >
              <span>←</span>
              <span>Hub</span>
            </Link>
          </div>

          {/* Title */}
          <div className="w-full max-w-[480px] rounded-[18px] border border-[rgba(52,211,153,0.15)] bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.02)] p-6 flex items-center justify-center">
            <h1 className="text-[28px] font-[900] tracking-[0.08em] text-[#34d399] drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              WORDPOOL
            </h1>
          </div>

          <p className="text-[rgba(255,255,255,0.72)] font-[650] tracking-[0.01em] m-0 mb-[14px]">
            Name words that fit the category. Narrow it down, level by level.
          </p>

          {/* Daily Puzzle Card */}
          <div className="game-home-card" role="region" aria-label="Daily puzzle">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-start gap-2 text-left min-w-0">
                <div className="flex items-baseline gap-[10px] flex-wrap">
                  <div className="font-[800] tracking-[0.03em]">Daily puzzle</div>
                  <div className="text-[rgba(255,255,255,0.68)] font-[700] tracking-[0.02em]">
                    {today}
                  </div>
                </div>
                {todayCategory && (
                  <p className="text-sm text-[#34d399] font-[700] m-0">
                    Today: {todayCategory.name}
                  </p>
                )}
              </div>
              <Link
                to="/wordpool/play"
                className={`game-home-btn game-home-btn-wordpool`}
              >
                Play
              </Link>
            </div>
          </div>

          <div
            className="w-[140px] h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.18)] to-transparent my-2"
            aria-hidden="true"
          />

          <nav className="w-full flex flex-col gap-[10px] mt-[6px] items-center" aria-label="Menu">
            <Link to="/wordpool/previous" className="game-home-menu-item">
              <svg className="game-home-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 7V3m8 4V3M4 11h16M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Previous games</span>
            </Link>
            <button className="game-home-menu-item w-full max-w-[260px]" onClick={() => setShowHowToPlay(true)}>
              <svg className="game-home-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 18h.01M10.5 8.5a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 2.3v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              <span>How to play</span>
            </button>
            <Link to="/wordpool/about" className="game-home-menu-item">
              <svg className="game-home-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 8h.01" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              <span>About</span>
            </Link>
            <a href="#language" className="game-home-menu-item" onClick={(e) => { e.preventDefault(); document.getElementById('language')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <svg className="game-home-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5h7m-3 0v3m0 0h3m-3 0H6m12 13-3-7-3 7m1-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M14 5c0 6-3 10-8 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Language</span>
            </a>
          </nav>

          <section id="language" className="w-full text-left mt-[4px] mb-[24px]">
            <div className="game-home-card" style={{ width: '100%' }}>
              <h3 className="text-[rgba(255,255,255,0.92)] font-[800] tracking-[0.02em] text-[15px] mb-[10px]">Language</h3>
              <div className="flex items-center gap-3">
                <span className="text-[22px]">🇺🇸</span>
                <div>
                  <p className="text-[rgba(255,255,255,0.86)] text-sm font-[700] m-0">English (US)</p>
                  <p className="text-[rgba(255,255,255,0.52)] text-xs font-[600] m-0 mt-0.5">More languages coming soon</p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>

      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-[18px]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHowToPlay(false)}
        >
          <div className="game-home-card w-full max-w-[520px] text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-[10px]">
              <h3 className="text-[rgba(255,255,255,0.92)] font-[800] tracking-[0.02em] text-[15px] m-0">How to play</h3>
              <button onClick={() => setShowHowToPlay(false)} className="text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.86)] transition-colors text-[20px] leading-none ml-4" aria-label="Close">×</button>
            </div>
            <ol className="flex flex-col gap-[10px] text-[rgba(255,255,255,0.72)] text-sm font-[600] leading-[1.5] list-none m-0 p-0">
              <li className="flex gap-3"><span className="text-[#34d399] font-[800] text-[13px] w-5 flex-shrink-0 mt-[1px]">1</span><span>Type words that belong to the current category. Each level narrows the constraint.</span></li>
              <li className="flex gap-3"><span className="text-[#34d399] font-[800] text-[13px] w-5 flex-shrink-0 mt-[1px]">2</span><span>Find all words in a level to unlock the next.</span></li>
              <li className="flex gap-3"><span className="text-[#34d399] font-[800] text-[13px] w-5 flex-shrink-0 mt-[1px]">3</span><span>Use <strong className="text-[rgba(255,255,255,0.86)]">Hint</strong> for progressive clues (length → first letter).</span></li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
