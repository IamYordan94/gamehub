import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WordPoolLayout() {
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
    <div className="min-h-screen bg-[#1a1410] text-[#fef3c7]">
      {/* WordPool-specific header - warm amber/brown tones */}
      <header className="border-b border-[#422006] px-4 py-4 flex items-center justify-between sticky top-0 bg-[#1a1410]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#a78b71] hover:text-white transition-colors text-sm">
            ← Hub
          </Link>
          <span className="text-[#78350f]">|</span>
          <h1 className="text-xl font-bold text-[#f59e0b]">WordPool</h1>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 rounded-lg hover:bg-[#422006] text-[#a78b71]"
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
                className="absolute top-full right-0 mt-2 z-50 w-56 rounded-xl border border-[#422006] bg-[#292524] p-4 shadow-xl"
              >
<Link to="/wordpool" onClick={() => setMenuOpen(false)} className="block py-2 text-[#a78b71] hover:text-[#f59e0b]">
              Play
            </Link>
            <Link to="/wordpool/previous" onClick={() => setMenuOpen(false)} className="block py-2 text-[#a78b71] hover:text-[#f59e0b]">
              Previous games
            </Link>
            <Link to="/wordpool/settings" onClick={() => setMenuOpen(false)} className="block py-2 text-[#a78b71] hover:text-[#f59e0b]">
              Settings
            </Link>
            <Link to="/wordpool/about" onClick={() => setMenuOpen(false)} className="block py-2 text-[#a78b71] hover:text-[#f59e0b]">
              About
            </Link>
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
