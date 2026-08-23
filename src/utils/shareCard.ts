// shareCard.ts — pure canvas drawing for Sticker Pack share cards.
// No React imports. Draws a 1080x1350 PNG-style card onto any canvas 2D context.

export interface ShareCardOptions {
  gameId: string;          // e.g. 'seven-letters', 'orderle', 'fermi', 'quiz-master'
  title: string;           // game name, rendered UPPERCASE in mono
  accentColor: string;     // per-game accent (e.g. var(--sv-accent) value)
  lines: string[];         // result lines (score, tier, emoji grid, etc.)
  footer?: string;         // defaults to 'yodoku.app'
}

// System fonts only — no external font loading (see NOTES.md).
const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";
const BODY = "Bahnschrift, 'Arial Narrow', Arial, sans-serif";

const INK = '#141414';
const PAPER = '#f6f3ec';
const PANEL = '#ffffff';
const INK_SOFT = '#6f6a5e';
const CARD_W = 1080;
const CARD_H = 1080;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      out.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) out.push(line);
  return out;
}

/**
 * Draw the share card onto `canvas` at 1080x1080 and return the canvas.
 * Pure DOM canvas — safe to call from anywhere.
 */
export function drawShareCard(canvas: HTMLCanvasElement, options: ShareCardOptions): HTMLCanvasElement {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const accent = options.accentColor || INK;
  const footer = options.footer || 'yodoku.app';

  // ── Paper background ────────────────────────────────────────────────────
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // subtle dot grid texture
  ctx.fillStyle = 'rgba(20,20,20,0.05)';
  for (let gx = 40; gx < CARD_W; gx += 60) {
    for (let gy = 40; gy < CARD_H; gy += 60) {
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Ink border frame ────────────────────────────────────────────────────
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, CARD_W - 48, CARD_H - 48);

  // ── Game name header (mono uppercase) ───────────────────────────────────
  const title = options.title.toUpperCase();
  ctx.font = `800 64px ${MONO}`;
  ctx.textBaseline = 'top';
  const titleW = ctx.measureText(title).width;

  // sticker chip behind title, rotated slightly like a real sticker
  ctx.save();
  ctx.translate(90, 90);
  ctx.rotate(-0.02);
  ctx.shadowColor = 'rgba(20,20,20,0.35)';
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;
  ctx.fillStyle = accent;
  roundRect(ctx, 0, 0, titleW + 80, 110, 16);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  roundRect(ctx, 0, 0, titleW + 80, 110, 16);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `800 56px ${MONO}`;
  ctx.fillText(title, 40, 30);
  ctx.restore();

  // ── Result panel ────────────────────────────────────────────────────────
  const panelX = 90;
  const panelY = 280;
  const panelW = CARD_W - 180;

  // measure needed height first
  ctx.font = `700 44px ${BODY}`;
  let wrapped: { text: string; big: boolean }[] = [];
  for (const raw of options.lines.slice(0, 8)) {
    if (/^[🟩🟨🟧🟥⬜\s]+$/.test(raw)) {
      wrapped.push({ text: raw, big: true }); // emoji grid rows stay as-is
    } else {
      for (const l of wrapText(ctx, raw, panelW - 120)) {
        wrapped.push({ text: l, big: false });
      }
    }
  }
  const rowH = 62;
  const gridRowH = 78;
  const panelH =
    wrapped.reduce((h, r) => h + (r.big ? gridRowH : rowH), 0) + 100;
  const panelHClamped = Math.min(Math.max(panelH, 260), CARD_H - panelY - 200);

  // white panel with hard shadow
  ctx.save();
  ctx.shadowColor = 'rgba(20,20,20,0.4)';
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 10;
  ctx.shadowBlur = 0;
  ctx.fillStyle = PANEL;
  roundRect(ctx, panelX, panelY, panelW, panelHClamped, 20);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  roundRect(ctx, panelX, panelY, panelW, panelHClamped, 20);
  ctx.stroke();

  // result lines inside the panel
  let cy = panelY + 50;
  for (const row of wrapped) {
    if (cy > panelY + panelHClamped - 40) break;
    if (row.big) {
      ctx.font = `700 ${gridRowH - 22}px ${BODY}`;
      ctx.textAlign = 'center';
      ctx.fillText(row.text.trim(), panelX + panelW / 2, cy - 4);
      ctx.textAlign = 'left';
      cy += gridRowH;
    } else {
      ctx.font = `700 44px ${BODY}`;
      ctx.fillStyle = INK;
      ctx.fillText(row.text, panelX + 60, cy);
      cy += rowH;
    }
  }

  // accent underline strip at panel bottom
  ctx.fillStyle = accent;
  ctx.fillRect(panelX + 6, panelY + panelHClamped - 18, panelW - 12, 12);

  // ── Footer ──────────────────────────────────────────────────────────────
  ctx.font = `800 46px ${MONO}`;
  ctx.fillStyle = INK_SOFT;
  ctx.textAlign = 'center';
  ctx.fillText(footer.toUpperCase(), CARD_W / 2, CARD_H - 130);
  ctx.textAlign = 'left';

  // small accent square stamp bottom-right
  ctx.save();
  ctx.translate(CARD_W - 150, CARD_H - 160);
  ctx.rotate(0.08);
  ctx.fillStyle = accent;
  roundRect(ctx, 0, 0, 70, 70, 12);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  roundRect(ctx, 0, 0, 70, 70, 12);
  ctx.stroke();
  ctx.restore();

  return canvas;
}
