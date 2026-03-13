import { Link } from 'react-router-dom';

export default function LetterMixAbout() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--lm-accent)' }}>
        About Clear the String
      </h2>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
          borderBottom: '3px solid var(--lm-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--lm-text)' }}>What is it?</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--lm-text-muted)' }}>
          Clear the String is a daily word puzzle where letters from multiple hidden words are scrambled together into a single string. Your goal is to identify and remove all the solution words — clearing every letter.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--lm-text-muted)' }}>
          Unlike word searches, the letters are completely mixed — not grouped by word. Strategic thinking matters: removing one word may reveal letters needed for another.
        </p>
      </section>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
          borderBottom: '3px solid var(--lm-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--lm-text)' }}>How to Play</h3>
        <ol className="text-sm space-y-2 list-none m-0 p-0" style={{ color: 'var(--lm-text-muted)' }}>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--lm-accent)' }}>1</span>
            <span>Click letters from the string to spell a word.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--lm-accent)' }}>2</span>
            <span>Press <strong style={{ color: 'var(--lm-text)' }}>Submit</strong>. Any valid English word using those exact letters is accepted.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--lm-accent)' }}>3</span>
            <span>Found letters disappear from the string.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--lm-accent)' }}>4</span>
            <span>Find all hidden solution words to win. Use the <strong style={{ color: 'var(--lm-text)' }}>Hint</strong> button if you're stuck.</span>
          </li>
        </ol>
      </section>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
          borderBottom: '3px solid var(--lm-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--lm-text)' }}>Difficulty Levels</h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--lm-text-muted)' }}>
          <div className="flex gap-3 items-start">
            <span className="font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--lm-accent)' }}>Easy</span>
            <span>Shorter strings with fewer words. Good for getting a feel for the mechanics.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--lm-accent)' }}>Medium</span>
            <span>More words, longer strings, and a bit more overlap between shared letters.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--lm-accent)' }}>Hard</span>
            <span>Long strings with many words. Letter dependencies make order of removal critical.</span>
          </div>
        </div>
      </section>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--lm-surface)',
          border: '1px solid var(--lm-border)',
          borderBottom: '3px solid var(--lm-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--lm-text)' }}>Daily Puzzles</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--lm-text-muted)' }}>
          A new set of puzzles (one per difficulty) is released every day. Puzzles are pre-seeded by date, so everyone plays the same puzzle on the same day. Your completions are saved locally in your browser.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--lm-text-muted)' }}>
          You can also browse past puzzles via the <strong style={{ color: 'var(--lm-text)' }}>Calendar</strong>.
        </p>
      </section>

      <p className="text-sm" style={{ color: 'var(--lm-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--lm-accent)' }} className="hover:underline">
          ← Back to Hub
        </Link>
      </p>
    </div>
  );
}
