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
    <div className="min-h-screen" style={{ background: 'var(--cbo-bg)', color: 'var(--cbo-text)' }}>
      {/* Dark nav bar */}
      <header
        className="px-4 flex items-center justify-between sticky top-0 z-30"
        style={{
          background: 'var(--cbo-dark)',
          borderBottom: '2px solid var(--cbo-dark-2)',
          minHeight: '52px',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.01em', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            ← Hub
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>|</span>
          <h1
            className="text-base font-black tracking-widest uppercase"
            style={{ color: 'var(--cbo-accent)', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            Change by One
          </h1>
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 rounded transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            aria-label="Menu"
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 z-50 w-48 overflow-hidden"
                style={{
                  background: 'var(--cbo-surface)',
                  border: '1px solid var(--cbo-border)',
                  borderBottom: '3px solid var(--cbo-border-dark)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
                aria-label="Change by One menu"
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--cbo-border)' }}>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--cbo-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Info
                  </span>
                </div>
                <div className="p-1.5 flex flex-col gap-0.5">
                  <Link
                    to="/changebyone/calendar"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded text-sm font-semibold"
                    style={{ color: 'var(--cbo-text)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cbo-surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    Previous Puzzles
                  </Link>
                  <Link
                    to="/changebyone/about"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded text-sm font-semibold"
                    style={{ color: 'var(--cbo-text)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cbo-surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    About
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded text-sm font-semibold"
                    style={{ color: 'var(--cbo-text)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cbo-surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
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
