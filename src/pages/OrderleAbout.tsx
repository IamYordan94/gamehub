import { Link } from 'react-router-dom';

export default function OrderleAbout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black m-0" style={{ color: '#2a9f52', fontFamily: "'JetBrains Mono', monospace" }}>
          ORDERLE
        </h2>
        <span className="text-[10px] px-2 py-0.5 font-black"
          style={{ background: '#d9f24b', color: '#141414', border: '2px solid #141414', borderRadius: '4px', transform: 'rotate(-1deg)' }}>
          sequence
        </span>
      </div>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>What is it?</h3>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          ORDERLE is a daily sequence-deduction game. Each day you get items in a scrambled order.
          Your job is to arrange them correctly — not by guessing, but by understanding the underlying rule.
        </p>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          The mechanic is simple: <strong style={{ color: '#141414' }}>tap two tiles to swap them.</strong> Only
          two tiles ever move. Green means correct position. Yellow with an arrow tells you whether
          a tile belongs earlier or later. No gray tiles — every item is part of the puzzle.
        </p>
        <p className="text-sm leading-relaxed font-bold" style={{ color: '#6f6a5e' }}>
          <strong style={{ color: '#141414' }}>What makes it special:</strong> the reveal card. After every
          puzzle — win or lose — you get 2–3 sentences explaining WHY the order is what it is, with
          a citation to a published source. The game is the hook; the explanation is the product.
        </p>
      </section>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>How to Play</h3>
        <ol className="text-sm space-y-2 list-none m-0 p-0 font-bold" style={{ color: '#6f6a5e' }}>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#39c96b' }}>1</span>
            <span>You're shown items in a scrambled order. <strong style={{ color: '#141414' }}>Tap one tile, then another to SWAP them.</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#39c96b' }}>2</span>
            <span><span style={{ padding: '1px 6px', background: '#39c96b', border: '2px solid #141414', borderRadius: '3px', fontWeight: 800, fontSize: '10px' }}>GREEN</span> = correct position. <span style={{ padding: '1px 6px', background: '#ffc93c', border: '2px solid #141414', borderRadius: '3px', fontWeight: 800, fontSize: '10px', marginLeft: '4px' }}>YELLOW ◀▶</span> = belongs earlier/later.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#39c96b' }}>3</span>
            <span>You have as many tries as there are items. The swap rule guarantees it's always solvable.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black w-5 flex-shrink-0" style={{ color: '#39c96b' }}>4</span>
            <span>After solving, read <strong style={{ color: '#141414' }}>the reveal</strong> — that's the whole point. Copy and share your result grid.</span>
          </li>
        </ol>
      </section>

      <section className="p-6 space-y-3" style={{
        background: '#ffffff', border: '2.5px solid #141414', borderRadius: '12px', boxShadow: '4px 4px 0 #141414',
      }}>
        <h3 className="text-lg font-black" style={{ color: '#141414', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Weekly Rotation</h3>
        <div className="space-y-2 text-sm font-bold" style={{ color: '#6f6a5e' }}>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-20 flex-shrink-0 mt-0.5" style={{ color: '#39c96b' }}>Monday</span>
            <span>Cooking & food processes (4-item quick)</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-20 flex-shrink-0 mt-0.5" style={{ color: '#39c96b' }}>Tue–Thu</span>
            <span>Science, history, grammar (6-item standard)</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-20 flex-shrink-0 mt-0.5" style={{ color: '#39c96b' }}>Friday</span>
            <span>Everyday processes</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-20 flex-shrink-0 mt-0.5" style={{ color: '#39c96b' }}>Saturday</span>
            <span>Hardest puzzle of the week</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-black uppercase tracking-wider text-xs w-20 flex-shrink-0 mt-0.5" style={{ color: '#39c96b' }}>Sunday</span>
            <span>8-item long sequence</span>
          </div>
        </div>
      </section>

      <p className="text-sm font-bold" style={{ color: '#6f6a5e' }}>
        <Link to="/" style={{ color: '#39c96b' }} className="hover:underline">
          ← Back to Hub
        </Link>
      </p>
    </div>
  );
}
