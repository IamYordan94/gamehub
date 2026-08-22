import { Link } from 'react-router-dom';
import { CATEGORY_META, QUIZ_PER_DAY } from '../utils/quizLogic';

export default function QuizAbout() {
  return (
    <div className="flex flex-col items-center pt-2 pb-8">
      <div className="w-full max-w-[520px] flex flex-col gap-[14px]">
        <div className="w-full p-6 flex items-center justify-center"
          style={{ background: 'var(--qz-nav)', border: '2.5px solid var(--qz-ink)', borderRadius: '12px', boxShadow: '6px 6px 0 var(--qz-ink)' }}>
          <h1 className="text-[22px] font-black tracking-[0.12em] uppercase flex items-center gap-2"
            style={{ color: '#8b5cf6', fontFamily: "'JetBrains Mono', monospace" }}>
            QUIZ MASTER
          </h1>
        </div>

        <div style={{
          background: 'var(--qz-panel)', border: '2.5px solid var(--qz-ink)',
          borderRadius: '12px', padding: '18px 20px', boxShadow: '6px 6px 0 var(--qz-ink)',
        }}>
          <p className="text-sm font-bold leading-[1.65] m-0" style={{ color: 'var(--qz-ink)' }}>
            Quiz Master is a daily general-knowledge quiz. Every day, one shared set of{' '}
            {QUIZ_PER_DAY} questions — same questions for everyone, so you can compare
            scores with friends. Questions ramp from easy to hard and span seven
            categories. Finish the quiz, keep your streak alive, and share your
            score grid.
          </p>
        </div>

        <div style={{
          background: 'var(--qz-panel)', border: '2.5px solid var(--qz-ink)',
          borderRadius: '12px', padding: '18px 20px', boxShadow: '6px 6px 0 var(--qz-ink)',
        }}>
          <h3 className="text-sm font-black uppercase tracking-widest m-0 mb-2"
            style={{ color: 'var(--qz-ink-soft)', fontFamily: "'JetBrains Mono', monospace" }}>
            Categories
          </h3>
          <div className="flex flex-col gap-2">
            {Object.entries(CATEGORY_META).map(([id, meta]) => (
              <div key={id} className="flex items-center gap-3 text-sm font-bold" style={{ color: 'var(--qz-ink)' }}>
                <span style={{ fontSize: '18px' }}>{meta.emoji}</span>
                <span>{meta.label}</span>
                <span className="text-xs font-bold ml-auto px-2 py-0.5"
                  style={{ background: 'var(--qz-yellow)', border: '2px solid var(--qz-ink)', borderRadius: '4px' }}>
                  {id === 'general' ? 'everything' : 'daily mix'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--qz-panel)', border: '2.5px solid var(--qz-ink)',
          borderRadius: '12px', padding: '18px 20px', boxShadow: '6px 6px 0 var(--qz-ink)',
        }}>
          <h3 className="text-sm font-black uppercase tracking-widest m-0 mb-2"
            style={{ color: 'var(--qz-ink-soft)', fontFamily: "'JetBrains Mono', monospace" }}>
            The rules
          </h3>
          <ul className="text-sm font-bold leading-[1.7] m-0 pl-4" style={{ color: 'var(--qz-ink)' }}>
            <li>One daily quiz, one attempt that counts per day.</li>
            <li>Tap an answer to lock it in — no changing after.</li>
            <li>Streaks build when you play on consecutive days.</li>
            <li>Everything is saved on your device. No account needed.</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center mt-2">
          <Link to="/quiz/play" style={{
            background: 'var(--qz-ink)', color: 'var(--qz-bg)',
            border: '2.5px solid var(--qz-ink)', borderRadius: '8px',
            padding: '10px 24px', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none', boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
          }}>
            Play today's quiz
          </Link>
          <Link to="/" style={{
            background: 'var(--qz-panel)', color: 'var(--qz-ink)',
            border: '2.5px solid var(--qz-ink)', borderRadius: '8px',
            padding: '10px 20px', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none', boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
          }}>
            ← Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
