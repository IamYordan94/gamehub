// PlusLocked.tsx — the archive lock: small badge + the unlock sheet.
// Design reference: docs/design/yodoku-plus-preview.html (approved 2026-10-03).

import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const mono = "'JetBrains Mono', ui-monospace, monospace";

/** Small dark chip shown on locked archive days. */
export function LockBadge() {
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.06em',
        background: '#1E2028',
        color: '#d9f24b',
        border: '2px solid #141414',
        borderRadius: '4px',
        padding: '3px 9px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      🔒 PLUS
    </span>
  );
}

/** The unlock sheet — one small modal, no dead ends. */
export function PlusSheet({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(20,20,20,0.6)', zIndex: 1000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              maxWidth: 430,
              width: 'calc(100% - 40px)',
              background: '#ffffff',
              border: '2.5px solid #141414',
              borderRadius: '16px',
              boxShadow: '8px 8px 0 #141414',
              padding: '24px 22px',
              textAlign: 'center',
              fontFamily: 'Bahnschrift, "Segoe UI", system-ui, sans-serif',
              color: '#141414',
            }}
          >
            <div style={{ fontSize: 34, lineHeight: 1.1 }}>🔒</div>
            <h4 style={{ margin: '10px 0 6px', fontSize: 19 }}>This one&rsquo;s in the archive</h4>
            <p style={{ color: 'rgba(20,20,20,0.62)', fontSize: 14, margin: '0 0 18px' }}>
              {context ? `${context} puzzles` : 'Puzzles'} older than 7 days live in the full archive.
              Yodoku+ opens every puzzle since launch — all seven games.
            </p>
            <Link
              to="/plus"
              onClick={onClose}
              style={{
                display: 'inline-block',
                width: '100%',
                textAlign: 'center',
                textDecoration: 'none',
                border: '2.5px solid #141414',
                borderRadius: '10px',
                padding: '13px 16px',
                fontWeight: 800,
                fontSize: 15,
                boxShadow: '4px 4px 0 #141414',
                background: '#d9f24b',
                color: '#141414',
              }}
            >
              Unlock the archive — €19.99/yr
            </Link>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-block',
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                border: '2.5px solid #141414',
                borderRadius: '10px',
                padding: '11px 16px',
                fontWeight: 800,
                fontSize: 14,
                background: 'transparent',
                color: '#141414',
                marginTop: 10,
                fontFamily: 'inherit',
              }}
            >
              Not now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
