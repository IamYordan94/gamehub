import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Category = { id: string; name: string };

export default function WordPoolAbout() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/data/wordpool-categories.json')
      .then((r) => r.json())
      .then((d: { categories: Category[] }) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--wp-accent-blue-dark)' }}>
        About WordPool
      </h2>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--wp-surface)',
          border: '1px solid var(--wp-border)',
          borderBottom: '3px solid var(--wp-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--wp-text)' }}>What is it?</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--wp-text-muted)' }}>
          WordPool is a vocabulary challenge built around progressively narrowing categories. Starting broad
          (e.g. "Animals"), each level adds a new constraint — geographic, physical, behavioral — until only
          a handful of precise words qualify.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--wp-text-muted)' }}>
          It's less about speed and more about depth of knowledge. How specific can you go?
        </p>
      </section>

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--wp-surface)',
          border: '1px solid var(--wp-border)',
          borderBottom: '3px solid var(--wp-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--wp-text)' }}>How to Play</h3>
        <ol className="text-sm space-y-2 list-none m-0 p-0" style={{ color: 'var(--wp-text-muted)' }}>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--wp-accent-blue-dark)' }}>1</span>
            <span>You're given a category and constraint level (e.g. "Animals – Level 3: African Animals").</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--wp-accent-blue-dark)' }}>2</span>
            <span>Type words that fit the category and press <strong style={{ color: 'var(--wp-text)' }}>Submit</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--wp-accent-blue-dark)' }}>3</span>
            <span>Find all valid words to complete the level and unlock the next one.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--wp-accent-blue-dark)' }}>4</span>
            <span>Progress is saved locally in your browser.</span>
          </li>
        </ol>
      </section>

      {categories.length > 0 && (
        <section
          className="p-6 space-y-3"
          style={{
            background: 'var(--wp-surface)',
            border: '1px solid var(--wp-border)',
            borderBottom: '3px solid var(--wp-border-dark)',
            borderRadius: '6px',
          }}
        >
          <h3 className="text-lg font-medium" style={{ color: 'var(--wp-text)' }}>Categories</h3>
          <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--wp-text-muted)' }}>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span style={{ color: 'var(--wp-accent-blue-dark)' }}>·</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--wp-text-muted)' }}>
            Each category has multiple levels of increasing specificity.
          </p>
        </section>
      )}

      <section
        className="p-6 space-y-3"
        style={{
          background: 'var(--wp-surface)',
          border: '1px solid var(--wp-border)',
          borderBottom: '3px solid var(--wp-border-dark)',
          borderRadius: '6px',
        }}
      >
        <h3 className="text-lg font-medium" style={{ color: 'var(--wp-text)' }}>Daily Rotation</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--wp-text-muted)' }}>
          The daily puzzle rotates through categories automatically based on the date. You can also play any
          category at your own pace via <strong style={{ color: 'var(--wp-text)' }}>Previous games</strong> in the menu.
        </p>
      </section>

      <p className="text-sm" style={{ color: 'var(--wp-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--wp-accent-blue-dark)' }} className="hover:underline">
          ← Back to Hub
        </Link>
      </p>
    </div>
  );
}
