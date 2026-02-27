import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LetterMixLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetHandler, setResetHandler] = useState<(() => void) | null>(null);
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
      {/* Clear the String-specific header - grey + blue accent */}
      <header className="border-b border-[#2a2a38] px-4 py-4 flex items-center justify-between sticky top-0 bg-[#121218]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#9ca3af] hover:text-[#e8e9ed] transition-colors text-sm">
            ← Hub
          </Link>
          <span className="text-[#52525b]">|</span>
          <h1 className="text-xl font-bold text-[#60a5fa]">Clear the String</h1>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 rounded-lg hover:bg-[#1e3a5f] text-[#94a3b8]"
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
                className="absolute top-full right-0 mt-2 z-50 w-56 rounded-xl border border-[#2a2a38] bg-[#1a1a24] shadow-xl overflow-hidden"
                aria-label="Clear the String menu"
              >
                <div className="px-4 py-2 border-b border-[#2a2a38]">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">Game</span>
                </div>
                <div className="p-2">
                <button 
                  onClick={() => { 
                    if (resetHandler) resetHandler(); 
                    setMenuOpen(false); 
                  }} 
                  className="w-full text-left block px-2 py-2 rounded-lg text-[#9ca3af] hover:bg-[#2a2a38] hover:text-[#60a5fa]"
                >
                  Reset puzzle
                </button>
                <Link to="/lettermix/calendar" onClick={() => setMenuOpen(false)} className="block px-2 py-2 rounded-lg text-[#9ca3af] hover:bg-[#2a2a38] hover:text-[#60a5fa]">
                  Calendar
                </Link>
                </div>
                <div className="px-4 py-2 border-b border-t border-[#2a2a38]">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">App</span>
                </div>
                <div className="p-2">
                <Link to="/lettermix/about" onClick={() => setMenuOpen(false)} className="block px-2 py-2 rounded-lg text-[#9ca3af] hover:bg-[#2a2a38] hover:text-[#60a5fa]">
                  About
                </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        <Outlet context={{ setResetHandler }} />
      </main>
    </div>
  );
}
