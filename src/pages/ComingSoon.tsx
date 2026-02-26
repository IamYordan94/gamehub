import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
      <span className="text-6xl mb-4">🎯</span>
      <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-2">Coming Soon</h2>
      <p className="text-[#a1a1aa] mb-6">
        We&apos;re working on the third game. Stay tuned!
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb]"
      >
        Back to Hub
      </Link>
    </div>
  );
}
