import { Link } from 'react-router-dom';

export default function ChangeByOneAbout() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--cbo-accent)' }}>
        About Change by One
      </h2>

      <section className="p-6 space-y-3" style={{
        background: 'var(--cbo-surface)', border: '2.5px solid var(--cbo-border)',
        borderRadius: '12px', boxShadow: '4px 4px 0 var(--cbo-border)',
      }}>
        <h3 className="text-lg font-black" style={{ color: 'var(--cbo-text)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>What is it?</h3>
        <p className="text-sm leading-relaxed font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
          Change by One is inspired by the <em>word ladder</em> puzzle invented by Lewis Carroll in 1877.
          Given a start word and a target word, you transform one into the other by changing exactly one
          letter at a time — each step must be a valid English word.
        </p>
        <p className="text-sm leading-relaxed font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
          Each day brings four fresh puzzles (4, 5, 6, and 7-letter words). Your progress is saved
          locally so you can pick up where you left off.
        </p>
      </section>

      <section className="p-6 space-y-3" style={{
        background: 'var(--cbo-surface)', border: '2.5px solid var(--cbo-border)',
        borderRadius: '12px', boxShadow: '4px 4px 0 var(--cbo-border)',
      }}>
        <h3 className="text-lg font-black" style={{ color: 'var(--cbo-text)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>How to Play</h3>
        <ol className="text-sm space-y-2 list-none m-0 p-0 font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: 'var(--cbo-accent)' }}>1</span>
            <span>You're given a start word and a target word of the same length.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: 'var(--cbo-accent)' }}>2</span>
            <span>Change <strong style={{ color: 'var(--cbo-text)' }}>one letter at a time</strong> — every intermediate word must be a real English word.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: 'var(--cbo-accent)' }}>3</span>
            <span>Reach the target word in as few steps as possible. Stars are awarded based on efficiency.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: 'var(--cbo-accent)' }}>4</span>
            <span>Progress is saved locally in your browser. Come back anytime.</span>
          </li>
        </ol>
      </section>

      <section className="p-6 space-y-3" style={{
        background: 'var(--cbo-surface)', border: '2.5px solid var(--cbo-border)',
        borderRadius: '12px', boxShadow: '4px 4px 0 var(--cbo-border)',
      }}>
        <h3 className="text-lg font-black" style={{ color: 'var(--cbo-text)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Daily Puzzles</h3>
        <div className="space-y-2 text-sm font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-16 flex-shrink-0 mt-0.5" style={{ color: 'var(--cbo-accent)' }}>4 letters</span>
            <span>Quick warm-up — short paths, familiar words.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-16 flex-shrink-0 mt-0.5" style={{ color: 'var(--cbo-accent)' }}>5 letters</span>
            <span>Moderate challenge with more word options.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-16 flex-shrink-0 mt-0.5" style={{ color: 'var(--cbo-accent)' }}>6 letters</span>
            <span>Harder — fewer valid intermediate words.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-16 flex-shrink-0 mt-0.5" style={{ color: 'var(--cbo-accent)' }}>7 letters</span>
            <span>The longest path. Strategic thinking required.</span>
          </div>
        </div>
        <p className="text-xs mt-2 font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
          You can browse past puzzles via the <strong style={{ color: 'var(--cbo-text)' }}>Calendar</strong> in the menu.
        </p>
      </section>

      <p className="text-sm font-bold" style={{ color: 'var(--cbo-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--cbo-accent)' }} className="hover:underline">
          ← Back to Hub
        </Link>
      </p>
    </div>
  );
}
