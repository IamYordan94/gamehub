import { Link } from 'react-router-dom';

export default function LetterMixAbout() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#60a5fa]">About Clear the String</h2>

      <section className="rounded-xl border border-[#2a2a38] bg-[#1a1a24]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#e8e9ed]">What is it?</h3>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          Clear the String is a daily word puzzle where letters from multiple hidden words are scrambled together into a single string. Your goal is to identify and remove all the solution words — clearing every letter.
        </p>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          Unlike word searches, the letters are completely mixed — not grouped by word. Strategic thinking matters: removing one word may reveal letters needed for another.
        </p>
      </section>

      <section className="rounded-xl border border-[#2a2a38] bg-[#1a1a24]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#e2e8f0]">How to Play</h3>
        <ol className="text-sm text-[#9ca3af] space-y-2 list-none m-0 p-0">
          <li className="flex gap-3"><span className="text-[#60a5fa] font-bold w-5 flex-shrink-0">1</span><span>Click letters from the string to spell a word.</span></li>
          <li className="flex gap-3"><span className="text-[#60a5fa] font-bold w-5 flex-shrink-0">2</span><span>Press <strong className="text-[#e8e9ed]">Submit</strong>. Any valid English word using those exact letters is accepted.</span></li>
          <li className="flex gap-3"><span className="text-[#60a5fa] font-bold w-5 flex-shrink-0">3</span><span>Found letters disappear from the string.</span></li>
          <li className="flex gap-3"><span className="text-[#60a5fa] font-bold w-5 flex-shrink-0">4</span><span>Find all hidden solution words to win. Use the <strong className="text-[#e8e9ed]">Hint</strong> button if you're stuck.</span></li>
        </ol>
      </section>

      <section className="rounded-xl border border-[#2a2a38] bg-[#1a1a24]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#e2e8f0]">Difficulty Levels</h3>
        <div className="space-y-2 text-sm text-[#94a3b8]">
          <div className="flex gap-3 items-start">
            <span className="text-[#60a5fa] font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5">Easy</span>
            <span>Shorter strings with fewer words. Good for getting a feel for the mechanics.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-[#60a5fa] font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5">Medium</span>
            <span>More words, longer strings, and a bit more overlap between shared letters.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-[#60a5fa] font-bold uppercase tracking-wider text-xs w-14 flex-shrink-0 mt-0.5">Hard</span>
            <span>Long strings with many words. Letter dependencies make order of removal critical.</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#2a2a38] bg-[#1a1a24]/50 p-6 space-y-3">
        <h3 className="text-lg font-medium text-[#e2e8f0]">Daily Puzzles</h3>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          A new set of puzzles (one per difficulty) is released every day. Puzzles are pre-seeded by date, so everyone plays the same puzzle on the same day. Your completions are saved locally in your browser.
        </p>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          You can also browse past puzzles via the <strong className="text-[#e2e8f0]">Calendar</strong>.
        </p>
      </section>

      <p className="text-sm text-[#6b7280]">
        <Link to="/" className="text-[#60a5fa] hover:underline">← Back to Hub</Link>
      </p>
    </div>
  );
}
