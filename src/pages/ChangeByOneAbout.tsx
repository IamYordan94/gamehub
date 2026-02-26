import { Link } from 'react-router-dom';

export default function ChangeByOneAbout() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#a371f7] mb-1">Change by One</h2>
        <p className="text-sm text-[#8b949e]">A classic word ladder puzzle, reinvented daily.</p>
      </div>

      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-3 text-sm text-[#c9d1d9] leading-relaxed">
        <p>
          Change by One is inspired by the <em>word ladder</em> puzzle invented by Lewis Carroll in 1877.
          Given a start word and a target word, you transform one into the other by changing exactly one letter at a time — each step must be a valid English word.
        </p>
        <p>
          Each day brings four fresh puzzles (4, 5, 6, and 7-letter words). Your progress is saved locally so you can pick up where you left off.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          to="/changebyone"
          className="px-5 py-2.5 bg-[#a371f7] hover:bg-[#9158f5] text-white font-bold rounded-xl text-sm transition-colors"
        >
          Play now
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-sm transition-colors"
        >
          Back to Hub
        </Link>
      </div>
    </div>
  );
}
