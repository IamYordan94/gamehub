import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdSlot from '../components/AdSlot';

type GameCardProps = {
  delay?: number;
  accentColor: string;
  accentSide: string;
  textColor: string;
  label: string;
  sticker: string;
  stickerColor: string;
  description: string;
  tags: string[];
  playTo: string;
  aboutTo: string;
  disabled?: boolean;
};

function GameCard({
  delay = 0,
  accentColor,
  accentSide,
  textColor,
  label,
  sticker,
  stickerColor,
  description,
  tags,
  playTo,
  aboutTo,
  disabled = false,
}: GameCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
      style={{
        background: 'var(--hub-panel)',
        border: '2.5px solid var(--hub-ink)',
        borderRadius: '12px',
        boxShadow: '6px 6px 0 var(--hub-ink)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Accent strip */}
      <div style={{ height: '5px', width: '100%', flexShrink: 0, background: accentColor }} />

      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        {/* Label + sticker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="text-[15px] font-black uppercase tracking-[0.08em] m-0"
            style={{ color: textColor, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
            {label}
          </h2>
          {!disabled && (
            <span style={{
              background: stickerColor,
              color: 'var(--hub-ink)',
              padding: '2px 8px',
              border: '2px solid var(--hub-ink)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              transform: 'rotate(1deg)',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
            }}>
              {sticker}
            </span>
          )}
          {disabled && (
            <span style={{
              background: 'var(--hub-gray)',
              color: 'var(--hub-ink-soft)',
              padding: '2px 8px',
              border: '2px solid var(--hub-ink)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              soon
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-[1.55] font-semibold m-0" style={{ color: 'var(--hub-ink-soft)' }}>
          {description}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-[7px]">
          {tags.map((t, i) => (
            <span key={t} style={{
              background: 'var(--hub-bg)',
              color: 'var(--hub-ink-soft)',
              border: '2px solid var(--hub-ink)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              transform: `rotate(${i % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[10px] mt-auto pt-1">
          {disabled ? (
            <span
              className="opacity-40 cursor-not-allowed"
              style={{
                background: accentColor,
                color: '#fff',
                border: '2.5px solid var(--hub-ink)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: `3px 3px 0 ${accentSide}`,
              }}
            >
              Locked
            </span>
          ) : (
            <Link
              to={playTo}
              style={{
                background: 'var(--hub-ink)',
                color: 'var(--hub-bg)',
                border: '2.5px solid var(--hub-ink)',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
              }}
            >
              Play
            </Link>
          )}
          <Link
            to={aboutTo}
            style={{
              background: 'var(--hub-panel)',
              color: 'var(--hub-ink)',
              border: '2.5px solid var(--hub-ink)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
            }}
          >
            {disabled ? 'Suggest' : 'About'}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function Hub() {
  return (
    <div style={{ background: 'var(--hub-bg)', minHeight: '100vh', color: 'var(--hub-ink)' }}>
      {/* Masthead */}
      <header
        className="px-5 py-5 flex flex-col items-start gap-1"
        style={{
          background: 'var(--hub-dark)',
          borderBottom: '3px solid var(--hub-ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            className="text-[22px] md:text-[26px] font-black uppercase tracking-[0.14em] m-0"
            style={{
              color: 'var(--hub-bg)',
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              letterSpacing: '0.14em',
            }}
          >
            WordCraft Hub
          </h1>
          <span style={{
            background: 'var(--hub-lime)',
            color: 'var(--hub-dark)',
            padding: '2px 10px',
            border: '2px solid var(--hub-bg)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 800,
            transform: 'rotate(-1deg)',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase',
          }}>
            6 games
          </span>
        </div>
        <p
          className="text-sm font-semibold m-0"
          style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.02em' }}
        >
          Pick one. Lose time responsibly.
        </p>
      </header>

      {/* Ticker bar */}
      <div style={{
        background: 'var(--hub-ink)',
        color: 'var(--hub-bg)',
        padding: '4px 0',
        fontWeight: 800,
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ display: 'inline-block', animation: 'marquee 22s linear infinite' }}>
          six daily games · new puzzles every day · free to play · share your score &nbsp;&nbsp;&nbsp;
          six daily games · new puzzles every day · free to play · share your score &nbsp;&nbsp;&nbsp;
        </span>
      </div>

      {/* Game grid */}
      <main className="p-4 md:p-6 max-w-[1040px] mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ color: 'var(--hub-ink-soft)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Games
          </span>
          <div style={{ flex: 1, height: '2px', background: 'var(--hub-ink)', opacity: 0.15 }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: 'var(--hub-ink-soft)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Game 1: Clear the String */}
          <GameCard
            delay={0}
            accentColor="#D63B3B"
            accentSide="#7A1F1F"
            textColor="#C03030"
            label="Clear the String"
            sticker="word"
            stickerColor="#ffc93c"
            description="Find the hidden solution words hiding in a scrambled string — and clear every single letter."
            tags={['daily', 'word', 'puzzle']}
            playTo="/lettermix"
            aboutTo="/lettermix/about"
          />

          {/* Game 2: Change by One */}
          <GameCard
            delay={0.06}
            accentColor="#3E9FA8"
            accentSide="#1E5A61"
            textColor="#2C7A82"
            label="Change by One"
            sticker="ladder"
            stickerColor="#5bc9ff"
            description="Transform a word into another, one letter at a time. Every step must be a real word."
            tags={['daily', 'ladder', 'words']}
            playTo="/changebyone"
            aboutTo="/changebyone/about"
          />

          {/* Game 3: Word Pool */}
          <GameCard
            delay={0.12}
            accentColor="#9FC3DA"
            accentSide="#4E86A8"
            textColor="#4E86A8"
            label="Word Pool"
            sticker="category"
            stickerColor="#d9f24b"
            description="Name every word in the category. Each level narrows the constraint until only a handful qualify."
            tags={['category', 'vocab', 'levels']}
            playTo="/wordpool"
            aboutTo="/wordpool/about"
          />

          {/* Game 4: ORDERLE */}
          <GameCard
            delay={0.18}
            accentColor="#39c96b"
            accentSide="#1e7a3d"
            textColor="#2a9f52"
            label="ORDERLE"
            sticker="sequence"
            stickerColor="#d9f24b"
            description="Put a handful of items in the correct order — one swap at a time. Then learn why the order matters."
            tags={['daily', 'sequence', 'logic']}
            playTo="/orderle"
            aboutTo="/orderle/about"
          />

          {/* Game 5: FERMI */}
          <GameCard
            delay={0.24}
            accentColor="#ff6b35"
            accentSide="#a8401f"
            textColor="#d4542a"
            label="FERMI"
            sticker="estimate"
            stickerColor="#ffc93c"
            description="Guess the real-world number. Learn orders of magnitude. Calibrate your intuition — one question a day."
            tags={['daily', 'quantity', 'science']}
            playTo="/fermi"
            aboutTo="/fermi/about"
          />

          {/* Game 6: Quiz Master */}
          <GameCard
            delay={0.30}
            accentColor="#8B5CF6"
            accentSide="#5B3FA8"
            textColor="#6D4BD8"
            label="Quiz Master"
            sticker="trivia"
            stickerColor="#ffc93c"
            description="Ten questions a day across eleven categories. One shared score — bragging rights included."
            tags={['daily', 'trivia', 'quiz']}
            playTo="/quiz"
            aboutTo="/quiz/about"
          />

        </div>

        <AdSlot slot="hub-grid-footer" minHeight={120} />

        {/* Footer */}
        <footer className="mt-10 pt-6 flex flex-col items-center gap-2" style={{ borderTop: '2px solid var(--hub-ink)', opacity: 0.3 }}>
          <p className="text-[11px] font-bold m-0" style={{ color: 'var(--hub-ink-soft)', letterSpacing: '0.04em' }}>
            All games are free to play.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy"
              className="text-[11px] font-bold"
              style={{ color: 'var(--hub-ink-soft)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <span style={{ color: 'var(--hub-ink-soft)' }}>·</span>
            <Link to="/terms"
              className="text-[11px] font-bold"
              style={{ color: 'var(--hub-ink-soft)', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>

      {/* Inline keyframes for ticker */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
