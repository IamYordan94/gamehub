import { useState } from 'react';
import { getWordPoolProgress, WP_PROGRESS } from '../utils/storage';

const WP_SESSION = 'wordcraft_wordpool_session';

export default function WordPoolSettings() {
  const [resetDone, setResetDone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const progress = getWordPoolProgress();
  const totalUnlocked = Object.values(progress).reduce((sum, lvl) => sum + (lvl - 1), 0);

  const handleReset = () => {
    localStorage.removeItem(WP_PROGRESS);
    localStorage.removeItem(WP_SESSION);
    setResetDone(true);
    setConfirmReset(false);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#f59e0b]">Settings</h2>

      {/* Stats */}
      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#f59e0b] uppercase tracking-wider">Your Progress</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#292524] border border-[#422006] px-4 py-3 text-center">
            <p className="text-2xl font-bold text-[#fef3c7]">{Object.keys(progress).length}</p>
            <p className="text-xs text-[#a78b71] mt-1">Categories started</p>
          </div>
          <div className="rounded-lg bg-[#292524] border border-[#422006] px-4 py-3 text-center">
            <p className="text-2xl font-bold text-[#fef3c7]">{totalUnlocked}</p>
            <p className="text-xs text-[#a78b71] mt-1">Levels completed</p>
          </div>
        </div>
      </section>

      {/* Reset Progress */}
      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#f59e0b] uppercase tracking-wider">Reset</h3>
        <p className="text-sm text-[#a78b71]">
          Reset all category progress back to level 1. This cannot be undone.
        </p>

        {resetDone ? (
          <p className="text-sm text-[#10b981] font-medium">Progress reset successfully.</p>
        ) : confirmReset ? (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-[#ef4444] text-white text-sm font-medium hover:bg-[#dc2626]"
            >
              Yes, reset everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2 rounded-lg border border-[#422006] text-[#a78b71] text-sm font-medium hover:bg-[#292524]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-lg border border-[#ef4444]/50 text-[#ef4444] text-sm font-medium hover:bg-[#ef4444]/10"
          >
            Reset all progress
          </button>
        )}
      </section>

      {/* About the game */}
      <section className="rounded-xl border border-[#422006] bg-[#292524]/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#f59e0b] uppercase tracking-wider">About WordPool</h3>
        <p className="text-sm text-[#a78b71] leading-relaxed">
          WordPool challenges you to name words fitting a category with progressively narrower constraints.
          Progress is saved locally in your browser.
        </p>
        <p className="text-xs text-[#78350f]">Version 1.0 · WordCraft Hub</p>
      </section>
    </div>
  );
}
