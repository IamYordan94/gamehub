import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hub() {
  return (
    <div className="min-h-screen flex items-center justify-center px-[18px] py-[44px] pb-[60px]">
      <section className="w-full max-w-[980px] flex flex-col gap-[18px] items-center text-center">
        {/* Logo Header */}
        <div className="flex flex-col items-center gap-2 mt-[6px] mb-0">
          <img
            src="/images/wordcraft-hub-logo.png"
            alt="WordCraft Hub"
            className="w-[180px] h-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
          />
          <h1 className="text-[34px] font-[900] tracking-[0.01em] m-0 drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)] bg-clip-text text-transparent bg-gradient-to-r from-[#2fd1ff] to-[#fbbf24]">
            WordCraft Hub
          </h1>
        </div>
        <p className="text-[rgba(255,255,255,0.70)] font-[650] mt-0 mb-[6px]">
          Pick one. Lose time responsibly.
        </p>

        {/* Game Grid */}
        <div className="w-full grid grid-cols-12 gap-[14px] mt-[6px]">
          {/* Clear the String */}
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-12 lg:col-span-6 hub-card"
          >
            {/* Game logo */}
            <div className="relative z-[1] -mx-[16px] -mt-[16px] mb-[4px] overflow-hidden rounded-t-[18px]">
              <img
                src="/images/clear-the-string-logo.png"
                alt="Clear the String"
                className="w-full h-auto block"
              />
            </div>

            <div className="relative z-[1]">
              <p className="text-[rgba(255,255,255,0.72)] leading-[1.35] font-[600] m-0">
                Find the hidden solution words in a scrambled string and clear every letter.
              </p>
            </div>

            <div className="flex gap-[10px] flex-wrap relative z-[1]">
              <span className="hub-tag">daily</span>
              <span className="hub-tag">word</span>
              <span className="hub-tag">puzzle</span>
            </div>

            <div className="flex items-center justify-between gap-3 relative z-[1]">
              <Link to="/lettermix" className="hub-btn">
                Open
              </Link>
              <Link to="/lettermix/about" className="hub-btn-ghost">
                About
              </Link>
            </div>
          </motion.article>

          {/* Change by One */}
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-6 hub-card"
          >
            <div className="flex items-start justify-between gap-3 relative z-[1]">
              <div>
                <h2 className="text-[18px] font-[900] tracking-[0.02em] m-0">
                  Change by One
                </h2>
                <p className="text-[rgba(255,255,255,0.72)] leading-[1.35] font-[600] mt-3 mb-0">
                  Transform one word into another by changing a single letter each step.
                </p>
              </div>
              <div className="hub-icon-box">
                <span className="text-[22px] font-[1000] text-[rgba(255,255,255,0.86)] drop-shadow-[0_0_18px_rgba(163,113,247,0.35)]">
                  ↺
                </span>
              </div>
            </div>

            <div className="flex gap-[10px] flex-wrap relative z-[1] mt-3">
              <span className="hub-tag">daily</span>
              <span className="hub-tag">ladder</span>
              <span className="hub-tag">words</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-[14px] relative z-[1]">
              <Link to="/changebyone" className="hub-btn">
                Open
              </Link>
              <Link to="/changebyone/about" className="hub-btn-ghost">
                About
              </Link>
            </div>
          </motion.article>

          {/* Word Pool */}
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-6 hub-card"
          >
            {/* Game logo — screen blend makes the black pixels transparent */}
            <div className="relative z-[1] -mx-[16px] -mt-[16px] mb-[4px] overflow-hidden rounded-t-[18px]" style={{ height: '160px' }}>
              <img
                src="/images/wordpool-logo.png"
                alt="Word Pool"
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>

            <div className="flex items-start justify-between gap-3 relative z-[1]">
              <div>
                <h2 className="text-[18px] font-[900] tracking-[0.02em] m-0">
                  Word Pool
                </h2>
                <p className="text-[rgba(255,255,255,0.72)] leading-[1.35] font-[600] mt-3 mb-0">
                  Name words that belong to a category. Each level narrows the constraint until only a handful qualify.
                </p>
              </div>
            </div>

            <div className="flex gap-[10px] flex-wrap relative z-[1] mt-3">
              <span className="hub-tag">category</span>
              <span className="hub-tag">vocab</span>
              <span className="hub-tag">levels</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-[14px] relative z-[1]">
              <Link to="/wordpool" className="hub-btn">
                Open
              </Link>
              <Link to="/wordpool/about" className="hub-btn-ghost">
                About
              </Link>
            </div>
          </motion.article>

          {/* More coming soon */}
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-6 hub-card opacity-[0.78]"
          >
            <div className="flex items-start justify-between gap-3 relative z-[1]">
              <div>
                <h2 className="text-[18px] font-[900] tracking-[0.02em] m-0">
                  More coming soon
                </h2>
                <p className="text-[rgba(255,255,255,0.72)] leading-[1.35] font-[600] mt-3 mb-0">
                  You will get more games. Eventually. When the universe allows it.
                </p>
              </div>
              <div className="hub-icon-box">
                <span className="text-[22px] font-[1000] text-[rgba(255,255,255,0.86)] drop-shadow-[0_0_18px_rgba(47,209,255,0.18)]">
                  ?
                </span>
              </div>
            </div>

            <div className="flex gap-[10px] flex-wrap relative z-[1] mt-3">
              <span className="hub-tag">mystery</span>
              <span className="hub-tag">soon</span>
              <span className="hub-tag">?</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-[14px] relative z-[1]">
              <span className="hub-btn opacity-[0.55] cursor-not-allowed">
                Locked
              </span>
              <Link to="/coming-soon" className="hub-btn-ghost">
                Suggest one
              </Link>
            </div>
          </motion.article>
        </div>
      </section>
    </div>
  );
}
