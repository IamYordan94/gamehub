import { useEffect, useRef } from 'react';

export default function LetterMixBackgroundGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const WORDS = [
      "CLEAR THE STRING",
      "ONE STRING",
      "ONE SOLUTION",
      "EVERY DAY",
      "DAILY PUZZLE",
      "PLAY",
      "PREVIOUS PUZZLES",
      "HOW TO PLAY",
      "ABOUT",
      "FEEDBACK",
      "LANGUAGE",
      "HINT",
      "RESET",
      "SUBMIT",
      "HIDDEN WORDS",
      "FOUND WORDS",
      "SELECT LETTERS",
      "CLEAR",
      "EASY",
      "MEDIUM",
      "HARD"
    ];

    const CELL = 38;
    const GAP = 6;
    const PAD = 18;

    function makeStream() {
      return WORDS.join("   ").toUpperCase();
    }

    function build() {
      if (!root) return;
      root.innerHTML = "";

      const grid = document.createElement("div");
      grid.className = "lettermix-bg-grid";
      root.appendChild(grid);

      const w = window.innerWidth;
      const h = window.innerHeight;

      const availW = Math.max(0, w - PAD * 2);
      const availH = Math.max(0, h - PAD * 2);

      const cols = Math.max(1, Math.floor((availW + GAP) / (CELL + GAP)));
      const rows = Math.max(1, Math.floor((availH + GAP) / (CELL + GAP)));
      const total = cols * rows;

      grid.style.setProperty("--bg-cell", CELL + "px");
      grid.style.setProperty("--bg-cols", String(cols));
      grid.style.setProperty("--bg-rows", String(rows));

      const stream = makeStream();
      const len = stream.length;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const cell = document.createElement("div");
        cell.className = "lettermix-bg-cell";

        const span = document.createElement("span");
        span.className = "lettermix-bg-ch";

        const ch = stream[i % len];
        span.textContent = ch === " " ? "" : ch;

        cell.appendChild(span);
        frag.appendChild(cell);
      }

      grid.appendChild(frag);
    }

    build();

    let t: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(t);
      t = setTimeout(build, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
