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
    <div className="min-h-screen bg-[#121218] text-[#e8e9ed]">
      {/* WordPool-specific header - grey + green accent */}
      <header className="border-b border-[#2a2a38] px-4 py-4 flex items-center justify-between sticky top-0 bg-[#121218]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#9ca3af] hover:text-[#e8e9ed] transition-colors text-sm">
            ← Hub
          </Link>
          <span className="text-[#52525b]">|</span>
          <h1 className="text-xl font-bold text-[#34d399]">WordPool</h1>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 rounded-lg hover:bg-[#2a2a38] text-[#9ca3af]"
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
                className="absolute top-full right-0 mt-2 z-50 w-56 rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-4 shadow-xl"
              >
<Link to="/wordpool" onClick={() => setMenuOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#34d399]">
              Play
            </Link>
            <Link to="/wordpool/previous" onClick={() => setMenuOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#34d399]">
              Previous games
            </Link>
            <Link to="/wordpool/settings" onClick={() => setMenuOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#34d399]">
              Settings
            </Link>
            <Link to="/wordpool/about" onClick={() => setMenuOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#34d399]">
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
