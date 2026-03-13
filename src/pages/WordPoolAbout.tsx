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
      <h2 className="text-xl font-semibold text-[#f59e0b]">About WordPool</h2>

      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#fef3c7]">What is it?</h3>
        <p className="text-sm text-[#a78b71] leading-relaxed">
          WordPool is a vocabulary challenge built around progressively narrowing categories. Starting broad
          (e.g. "Animals"), each level adds a new constraint — geographic, physical, behavioral — until only
          a handful of precise words qualify.
        </p>
        <p className="text-sm text-[#a78b71] leading-relaxed">
          It's less about speed and more about depth of knowledge. How specific can you go?
        </p>
      </section>

      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#fef3c7]">How to Play</h3>
        <ol className="text-sm text-[#a78b71] space-y-2 list-none m-0 p-0">
          <li className="flex gap-3">
            <span className="text-[#f59e0b] font-bold w-5 flex-shrink-0">1</span>
            <span>You're given a category and constraint level (e.g. "Animals – Level 3: African Animals").</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#f59e0b] font-bold w-5 flex-shrink-0">2</span>
            <span>Type words that fit the category and press <strong className="text-[#fef3c7]">Submit</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#f59e0b] font-bold w-5 flex-shrink-0">3</span>
            <span>Find all valid words to complete the level and unlock the next one.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#f59e0b] font-bold w-5 flex-shrink-0">4</span>
            <span>Progress is saved locally in your browser.</span>
          </li>
        </ol>
      </section>

      {categories.length > 0 && (
        <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-6 space-y-3">
          <h3 className="text-lg font-medium text-[#fef3c7]">Categories</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-[#a78b71]">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="text-[#f59e0b]">·</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#78350f] mt-2">Each category has multiple levels of increasing specificity.</p>
        </section>
      )}

      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#fef3c7]">Daily Rotation</h3>
        <p className="text-sm text-[#a78b71] leading-relaxed">
          The daily puzzle rotates through categories automatically based on the date. You can also play any
          category at your own pace via <strong className="text-[#fef3c7]">Previous games</strong> in the menu.
        </p>
      </section>

      <p className="text-sm text-[#78350f]">
        <Link to="/" className="text-[#f59e0b] hover:underline">← Back to Hub</Link>
      </p>
    </div>
  );
}
