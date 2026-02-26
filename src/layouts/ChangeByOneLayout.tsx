import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChangeByOneLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e2e8f0]">
      <header className="border-b border-[#30363d] px-4 py-4 flex items-center justify-between sticky top-0 bg-[#0d1117]/95 backdrop-blur z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#8b949e] hover:text-white transition-colors text-sm">
            ← Hub
          </Link>
          <span className="text-[#30363d]">|</span>
          <h1 className="text-xl font-bold text-[#a371f7]">Change by One</h1>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e]"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 z-50 w-52 rounded-xl border border-[#30363d] bg-[#161b22] shadow-xl overflow-hidden"
                aria-label="Change by One menu"
              >
                <div className="p-2">
                  <Link
                    to="/changebyone/about"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[#8b949e] hover:bg-[#21262d] hover:text-[#a371f7] text-sm"
                  >
                    About
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[#8b949e] hover:bg-[#21262d] hover:text-[#a371f7] text-sm"
                  >
                    Back to Hub
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
