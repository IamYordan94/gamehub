import { Link } from 'react-router-dom';

export default function FermiAbout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black m-0" style={{ color: '#d4542a', fontFamily: "'JetBrains Mono', monospace" }}>
          FERMI
        </h2>
        <span className="text-[10px] px-2 py-0.5 font-black"
          style={{ background: '#ff6b35', color: '#fff', border: '2px solid #141414', borderRadius: '4px', transform: 'rotate(1deg)' }}>
          estimate
        </span>
      </div>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>What is it?</h3>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          FERMI is a daily quantity-estimation game named after <strong style={{ color: '#141414' }}>Enrico Fermi</strong>,
          the physicist famous for teaching students to estimate anything — from the number of piano tuners
          in Chicago to the energy of an atomic blast — using only reasoning and orders of magnitude.
        </p>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          Each day: a real-world question with a verifiable answer. How far is the Moon? How many
          heartbeats in a lifetime? You get 6 guesses. Win by getting within 5% of the answer.
        </p>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          The feedback is the education: you see how many orders of magnitude you're off — "about 10× off."
          This builds genuine intuition about scale, which is a skill that compounds.
        </p>
      </section>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>How to Play</h3>
        <ol className="text-sm space-y-2 list-none m-0 p-0 font-bold" style={{ color: '#6f6a5e' }}>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#ff6b35' }}>1</span>
            <span>You get a question with a real-world answer: <em>"How far is the Moon?"</em></span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#ff6b35' }}>2</span>
            <span>Type your best guess. You have <strong style={{ color: '#141414' }}>6 tries</strong>. Win by getting within <strong style={{ color: '#141414' }}>5%</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#ff6b35' }}>3</span>
            <span>Feedback colors: <span style={{ color: '#39c96b' }}>green</span> = ±5% · <span style={{ color: '#ffc93c' }}>yellow</span> = within 2× · <span style={{ color: '#ff6b35' }}>orange</span> = within 10× · <span style={{ color: '#ff4d4d' }}>red</span> = way off.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#ff6b35' }}>4</span>
            <span>After each guess see how far off: "about 10× off" or "about 100× off."</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#ff6b35' }}>5</span>
            <span>The reveal teaches WHY — with derivation and source. Every answer is verified against published data.</span>
          </li>
        </ol>
      </section>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Daily Rotation</h3>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          A new puzzle every day from rotating categories: biology, physics, space, geography, food, money &amp; more.
          Each puzzle is verified against a published source you can check.
        </p>
      </section>

      <p className="text-sm font-bold" style={{ color: '#6f6a5e' }}>
        <Link to="/" style={{ color: '#ff6b35' }} className="hover:underline">
          ← Back to Hub
        </Link>
      </p>
    </div>
  );
}
