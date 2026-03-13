import { useState } from 'react';
import { Link } from 'react-router-dom';
import LetterMixBackgroundGrid from '../components/LetterMixBackgroundGrid';
import AnimatedString from '../components/AnimatedString';
import { getTodayDateStr } from '../utils/dailySeed';
import { getLetterMixCompletedFor } from '../utils/storage';

const LEVELS = ['easy', 'medium', 'hard'] as const;

export default function LetterMixHome() {
  const today = getTodayDateStr();
  const levelCompletion = LEVELS.map((lvl) => !!getLetterMixCompletedFor(today, lvl));
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--lm-bg)', color: 'var(--lm-text)' }}>
      <LetterMixBackgroundGrid />

      {/* Dark nav bar */}
      <header
        className="sticky top-0 z-20 px-4 flex items-center justify-between"
        style={{
          background: 'var(--lm-nav)',
          borderBottom: '2px solid var(--lm-nav-border)',
          minHeight: '52px',
        }}
      >
        <Link
          to="/"
          className="text-sm font-semibold"
          style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >
          ← Hub
        </Link>
        <span
          className="text-sm font-black uppercase tracking-widest"
          style={{ color: 'var(--lm-accent)', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          Clear the String
        </span>
        <div style={{ width: '48px' }} /> {/* spacer for symmetry */}
      </header>

      <div className="flex items-center justify-center px-[18px] py-[48px]">
        <section className="w-full max-w-[520px] flex flex-col items-center gap-[14px] text-center relative z-10">

          {/* Animated String title */}
          <AnimatedString />

          {/* Tagline */}
          <p className="font-bold tracking-wide m-0 mb-[14px]" style={{ color: 'var(--lm-text-muted)', fontSize: '15px' }}>
            One string. One solution. Every day.
          </p>

          {/* Daily Puzzle Card */}
          <div className="lettermix-card" role="region" aria-label="Daily puzzle">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-start gap-2 text-left min-w-0">
                <div className="flex items-baseline gap-[10px] flex-wrap">
                  <div className="font-bold" style={{ color: 'var(--lm-text)' }}>Daily puzzle</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--lm-text-muted)' }}>{today}</div>
                </div>
                <div className="flex gap-3 items-center flex-wrap" aria-label="Daily levels">
                  {LEVELS.map((lvl, i) => (
                    <div key={lvl} className="flex items-center gap-1.5">
                      <div className={`lettermix-dot ${levelCompletion[i] ? 'lettermix-dot-on' : ''}`}></div>
                      <span
                        className="text-[11px] font-bold tracking-widest uppercase"
                        style={{ color: 'var(--lm-text-faint)' }}
                      >
                        {lvl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/lettermix/play" className="lettermix-btn">
                Play
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="lettermix-divider" aria-hidden="true"></div>

          {/* Navigation Menu */}
          <nav className="w-full flex flex-col gap-[10px] mt-[6px] items-center" aria-label="Menu">
            <Link to="/lettermix/calendar" className="lettermix-menu-item">
              <svg className="lettermix-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 7V3m8 4V3M4 11h16M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Previous puzzles</span>
            </Link>

            <button className="lettermix-menu-item" onClick={() => setShowHowToPlay(true)}>
              <svg className="lettermix-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 18h.01M10.5 8.5a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 2.3v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              <span>How to play</span>
            </button>

            <Link to="/lettermix/about" className="lettermix-menu-item">
              <svg className="lettermix-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 8h.01" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              <span>About</span>
            </Link>

            <a
              href="#language"
              className="lettermix-menu-item"
              onClick={(e) => { e.preventDefault(); document.getElementById('language')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              <svg className="lettermix-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5h7m-3 0v3m0 0h3m-3 0H6m12 13-3-7-3 7m1-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M14 5c0 6-3 10-8 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Language</span>
            </a>
          </nav>

          {/* Language */}
          <section id="language" className="w-full text-left mt-[4px] mb-[24px]">
            <div className="lettermix-card" style={{ width: '100%' }}>
              <h3 className="font-bold text-[15px] mb-[10px]" style={{ color: 'var(--lm-text)' }}>Language</h3>
              <div className="flex items-center gap-3">
                <span className="text-[22px]">🇺🇸</span>
                <div>
                  <p className="text-sm font-bold m-0" style={{ color: 'var(--lm-text)' }}>English (US)</p>
                  <p className="text-xs font-semibold m-0 mt-0.5" style={{ color: 'var(--lm-text-faint)' }}>More languages coming soon</p>
                </div>
              </div>
            </div>
          </section>

        </section>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-[18px]"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="w-full max-w-[520px] text-left"
            style={{
              background: 'var(--lm-surface)',
              border: '1px solid var(--lm-border)',
              borderBottom: '3px solid var(--lm-border-dark)',
              borderRadius: '6px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[14px]">
              <h3 className="font-black text-[16px] m-0" style={{ color: 'var(--lm-text)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                How to play
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-[20px] leading-none transition-colors"
                style={{ color: 'var(--lm-text-muted)' }}
                aria-label="Close"
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--lm-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--lm-text-muted)')}
              >
                ×
              </button>
            </div>
            <ol className="flex flex-col gap-[10px] text-sm font-semibold leading-[1.6] list-none m-0 p-0" style={{ color: 'var(--lm-text-muted)' }}>
              <li className="flex gap-3">
                <span className="font-black text-[13px] w-5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--lm-accent)' }}>1</span>
                <span>You're given a scrambled string of letters. Hidden inside are solution words.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-[13px] w-5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--lm-accent)' }}>2</span>
                <span>Click letters to select them and form a word, then press <strong style={{ color: 'var(--lm-text)' }}>Submit</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-[13px] w-5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--lm-accent)' }}>3</span>
                <span>Any valid English word using those exact letters is accepted — not just the solution words.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-[13px] w-5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--lm-accent)' }}>4</span>
                <span>Find all hidden solution words to win. Use the <strong style={{ color: 'var(--lm-text)' }}>Hint</strong> button if you're stuck.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-[13px] w-5 flex-shrink-0 mt-[1px]" style={{ color: 'var(--lm-accent)' }}>5</span>
                <span>Three difficulty levels daily: <strong style={{ color: 'var(--lm-text)' }}>easy</strong>, <strong style={{ color: 'var(--lm-text)' }}>medium</strong>, <strong style={{ color: 'var(--lm-text)' }}>hard</strong>. New puzzles every day.</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
