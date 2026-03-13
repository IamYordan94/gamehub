import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type GameCardProps = {
  delay?: number;
  accentColor: string;
  accentDark: string;
  accentSide: string;
  textColor: string;
  label: string;
  description: string;
  tags: string[];
  playTo: string;
  aboutTo: string;
  disabled?: boolean;
};

function GameCard({
  delay = 0,
  accentColor,
  accentDark,
  accentSide,
  textColor,
  label,
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
      className={`hub-card ${disabled ? 'opacity-60' : ''}`}
    >
      {/* Accent colour strip — the game's signature colour */}
      <div className="hub-card-strip" style={{ background: accentColor }} />

      <div className="hub-card-body">
        {/* Game label */}
        <h2
          className="text-[15px] font-black uppercase tracking-[0.1em] m-0"
          style={{ color: textColor, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {label}
        </h2>

        {/* Description */}
        <p className="text-sm leading-[1.55] font-semibold m-0" style={{ color: 'var(--hub-text-muted)' }}>
          {description}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-[7px]">
          {tags.map((t) => (
            <span key={t} className="hub-tag">{t}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[10px] mt-auto pt-1">
          {disabled ? (
            <span
              className="hub-open-btn opacity-40 cursor-not-allowed"
              style={{
                background: accentColor,
                color: '#1E2028',
                borderColor: accentDark,
                boxShadow: `0 3px 0 ${accentSide}`,
              }}
            >
              Locked
            </span>
          ) : (
            <Link
              to={playTo}
              className="hub-open-btn"
              style={{
                background: accentColor,
                color: '#1E2028',
                borderColor: accentDark,
                boxShadow: `0 3px 0 ${accentSide}`,
              }}
            >
              Play
            </Link>
          )}
          <Link to={aboutTo} className="hub-about-btn">
            {disabled ? 'Suggest' : 'About'}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function Hub() {
  return (
    <div className="hub-plate">

      {/* ── Masthead ── */}
      <header
        className="px-5 py-5 flex flex-col items-start gap-1"
        style={{
          background: 'var(--hub-dark)',
          borderBottom: '3px solid var(--hub-dark-2)',
        }}
      >
        <h1
          className="text-[22px] md:text-[26px] font-black uppercase tracking-[0.14em] m-0"
          style={{
            color: '#F1EDEA',
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            letterSpacing: '0.14em',
          }}
        >
          WordCraft Hub
        </h1>
        <p
          className="text-sm font-semibold m-0"
          style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.02em' }}
        >
          Pick one. Lose time responsibly.
        </p>
      </header>

      {/* ── Game grid ── */}
      <main className="p-4 md:p-6 max-w-[1040px] mx-auto">

        {/* Keyboard legend row */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ color: 'var(--hub-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Games
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--hub-border)' }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: 'var(--hub-border-dark)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* ── Game 1: Clear the String ── */}
          <GameCard
            delay={0}
            accentColor="#D63B3B"
            accentDark="#A82A2A"
            accentSide="#7A1F1F"
            textColor="#C03030"
            label="Clear the String"
            description="Find the hidden solution words hiding in a scrambled string — and clear every single letter."
            tags={['daily', 'word', 'puzzle']}
            playTo="/lettermix"
            aboutTo="/lettermix/about"
          />

          {/* ── Game 2: Change by One ── */}
          <GameCard
            delay={0.07}
            accentColor="#3E9FA8"
            accentDark="#2C7A82"
            accentSide="#1E5A61"
            textColor="#2C7A82"
            label="Change by One"
            description="Transform a word into another, one letter at a time. Every step must be a real word."
            tags={['daily', 'ladder', 'words']}
            playTo="/changebyone"
            aboutTo="/changebyone/about"
          />

          {/* ── Game 3: Word Pool ── */}
          <GameCard
            delay={0.14}
            accentColor="#9FC3DA"
            accentDark="#7EA9C5"
            accentSide="#4E86A8"
            textColor="#4E86A8"
            label="Word Pool"
            description="Name every word in the category. Each level narrows the constraint until only a handful qualify."
            tags={['category', 'vocab', 'levels']}
            playTo="/wordpool"
            aboutTo="/wordpool/about"
          />

          {/* ── Coming soon ── */}
          <GameCard
            delay={0.21}
            accentColor="#C9C4BE"
            accentDark="#ADA7A0"
            accentSide="#928D87"
            textColor="#928D87"
            label="???"
            description="More games incoming. When the universe allows it."
            tags={['mystery', 'soon']}
            playTo="/coming-soon"
            aboutTo="/coming-soon"
            disabled
          />

        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 flex flex-col items-center gap-2" style={{ borderTop: '1px solid var(--hub-border)' }}>
          <p
            className="text-[11px] font-semibold m-0"
            style={{ color: 'var(--hub-border-dark)', letterSpacing: '0.04em' }}
          >
            All games are free — no ads, no tracking.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="text-[11px] font-semibold"
              style={{ color: 'var(--hub-text-muted)', textDecoration: 'none', letterSpacing: '0.04em' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--hub-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--hub-text-muted)')}
            >
              Privacy Policy
            </Link>
            <span style={{ color: 'var(--hub-border)' }}>·</span>
            <Link
              to="/terms"
              className="text-[11px] font-semibold"
              style={{ color: 'var(--hub-text-muted)', textDecoration: 'none', letterSpacing: '0.04em' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--hub-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--hub-text-muted)')}
            >
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
