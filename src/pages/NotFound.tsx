import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-center p-6">
      <p className="text-7xl font-black text-[#2a2a38] mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#e8e9ed] mb-2">Page not found</h1>
      <p className="text-[#9ca3af] mb-8 max-w-xs">
        That page doesn&apos;t exist. Head back to the hub and pick a game.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 text-[#e8e9ed] font-semibold hover:border-white/25 transition-colors"
      >
        ← Back to Hub
      </Link>
    </div>
  );
}
