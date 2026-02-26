import { useEffect, useRef } from 'react';

export default function AnimatedString() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const HOLD_BEFORE_START_MS = 900;
    const SWIRL_DURATION_MS = 1400;
    const HOLD_COIL_MS = 450;
    const RETURN_DURATION_MS = 950;
    const MORPH_SWAP_MS = 120;

    const startStr = "SRTGNEHTCAELI".split("");
    const endStr = "CLEARTHESTRING".split("");
    const n = Math.max(startStr.length, endStr.length);

    const glyphs: HTMLDivElement[] = [];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "lettermix-glyph lettermix-glyph-on";
      el.textContent = startStr[i] ?? "";
      stage.appendChild(el);
      glyphs.push(el);
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function linePositions(count: number): [number, number][] {
      const r = stage!.getBoundingClientRect();
      const cx = r.width / 2;
      const cy = r.height / 2;
      const step = 18;
      const total = (count - 1) * step;
      const startX = cx - total / 2;
      return Array.from({ length: count }, (_, i) => [startX + i * step, cy]);
    }

    function spiralPoints(width: number, height: number, step: number): [number, number][] {
      const pts: [number, number][] = [];
      let left = 28, top = 20;
      let right = width - 28, bottom = height - 20;

      while (left < right && top < bottom) {
        for (let x = left; x <= right; x += step) pts.push([x, top]);
        for (let y = top + step; y <= bottom; y += step) pts.push([right, y]);
        for (let x = right - step; x >= left; x -= step) pts.push([x, bottom]);
        for (let y = bottom - step; y >= top + step; y -= step) pts.push([left, y]);
        left += step * 2;
        top += step * 2;
        right -= step * 2;
        bottom -= step * 2;
      }
      return pts;
    }

    function coilPositions(count: number): [number, number][] {
      const r = stage!.getBoundingClientRect();
      const pts = spiralPoints(r.width, r.height, 12);
      return Array.from({ length: count }, (_, i) =>
        pts[Math.min(pts.length - 1, Math.floor(i * (pts.length / count)))]
      );
    }

    function setPositions(pos: [number, number][], rot = 0) {
      for (let i = 0; i < glyphs.length; i++) {
        const p = pos[i] || pos[pos.length - 1];
        glyphs[i].style.left = p[0] + "px";
        glyphs[i].style.top = p[1] + "px";
        glyphs[i].style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
        glyphs[i].style.opacity = "1";
      }
    }

    function tween(fromPos: [number, number][], toPos: [number, number][], ms: number, spin: boolean): Promise<void> {
      return new Promise((resolve) => {
        const start = performance.now();
        function frame(now: number) {
          const t = Math.min(1, (now - start) / ms);
          const e = easeOutCubic(t);

          for (let i = 0; i < glyphs.length; i++) {
            const fp = fromPos[i] || fromPos[fromPos.length - 1];
            const tp = toPos[i] || toPos[toPos.length - 1];

            const x = lerp(fp[0], tp[0], e);
            const y = lerp(fp[1], tp[1], e);

            const rot = spin ? lerp(140 + i * 8, 0, e) : 0;

            glyphs[i].style.left = x + "px";
            glyphs[i].style.top = y + "px";
            glyphs[i].style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
          }

          if (t < 1 && !reduce) requestAnimationFrame(frame);
          else resolve();
        }
        if (reduce) {
          resolve();
          return;
        }
        requestAnimationFrame(frame);
      });
    }

    async function run() {
      const lineStart = linePositions(n);
      setPositions(lineStart, 0);

      glyphs[n - 1].style.opacity = "0";
      glyphs[n - 1].textContent = "";

      await new Promise(r => setTimeout(r, HOLD_BEFORE_START_MS));

      const coil = coilPositions(n);
      glyphs[n - 1].style.opacity = "1";
      await tween(lineStart, coil, SWIRL_DURATION_MS, true);

      await new Promise(r => setTimeout(r, HOLD_COIL_MS));
      await new Promise(r => setTimeout(r, MORPH_SWAP_MS));

      for (let i = 0; i < n; i++) glyphs[i].textContent = endStr[i] ?? "";

      const lineEnd = linePositions(n);
      await tween(coil, lineEnd, RETURN_DURATION_MS, false);
    }

    let resizeT: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        run();
      }, 220);
    };

    window.addEventListener("resize", handleResize);
    run();

    return () => {
      window.removeEventListener("resize", handleResize);
      stage.innerHTML = "";
    };
  }, []);

  return (
    <div className="w-full max-w-[520px] flex justify-center my-[2px] mb-[6px]">
      <div
        ref={stageRef}
        className="lettermix-string-stage"
        aria-hidden="true"
      />
    </div>
  );
}
