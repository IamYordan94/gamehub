import { Link } from 'react-router-dom';

export default function ChangeByOneAbout() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2
          className="text-2xl font-black mb-1"
          style={{ color: 'var(--cbo-accent)' }}
        >
          Change by One
        </h2>
        <p className="text-sm" style={{ color: 'var(--cbo-text-muted)' }}>
          A classic word ladder puzzle, reinvented daily.
        </p>
      </div>

      <div
        className="p-5 space-y-3 text-sm leading-relaxed"
        style={{
          background: 'var(--cbo-surface)',
          border: '1px solid var(--cbo-border)',
          borderBottom: '3px solid var(--cbo-border-dark)',
          borderRadius: '6px',
        }}
      >
        <p style={{ color: 'var(--cbo-text)' }}>
          Change by One is inspired by the <em>word ladder</em> puzzle invented by Lewis Carroll in 1877.
          Given a start word and a target word, you transform one into the other by changing exactly one letter at a time — each step must be a valid English word.
        </p>
        <p style={{ color: 'var(--cbo-text)' }}>
          Each day brings four fresh puzzles (4, 5, 6, and 7-letter words). Your progress is saved locally so you can pick up where you left off.
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/changebyone" className="cbo-btn-primary">
          Play now
        </Link>
        <Link to="/" className="cbo-btn-secondary">
          Back to Hub
        </Link>
      </div>
    </div>
  );
}
