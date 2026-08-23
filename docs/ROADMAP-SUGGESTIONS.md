# YODOKU — Suggestions & Roadmap (2026-08-23)

> Proposals from the sprint session. Priority: 🔴 high value / 🟡 nice / ⚪ later.
> Rule: keep "No ads. No tracking." philosophy honest; ads stay consent-free display slots only.

## 🔴 Quick wins (hours each)

- [ ] **NL language mode** — add a Dutch word bank + per-game NL toggle (at least for LetterMix/7 Letters). Unique position: barely any NL daily word games. Feeds WerkNL audience + Dutch SEO. Big differentiator.
- [ ] **Social share cards** — canvas-generated result images per game (score + sticker style), download/WhatsApp share button. WhatsApp = our audience. (SOCIAL-VIDEO-PLAN.md, workstream C1.)
- [ ] **Monetag activation** — paste Monetag tag into `src/utils/ads.ts` AD_CONFIG. Slots already built on hub/quiz/orderle/fermi (+seven results slot ready). Zero new code.
- [ ] **OG/meta tags per game page** — title, description, image per route. Currently minimal. (SEO-PLAN.md.)
- [ ] **Fresh audit** — INSPECTION_REPORT.md is from March; AUDIT-2026-08-22 fixed 3 criticals. Re-run a pass now that game 7 is in.

## 🟡 Growth plays (days)

- [ ] **Games 8 & 9** — WORDLE-style 5-letter daily + Connections-style grouping (16 words → 4 groups). Both are proven patterns; Ox Alpha sprint proved we can produce them fast.
- [ ] **Global streak/stats page** — aggregate each player's LOCAL stats into one "your year on Yodoku" view (still no accounts, still no tracking).
- [ ] **Android Play Store** — Capacitor project exists (android/). Finish + publish per DISTRIBUTION-PLAN.md.
- [ ] **TikTok content pipeline** — 15-30s gameplay clips (SOCIAL-VIDEO-PLAN.md); matches the "alive" visual taste.

## ⚪ Later / experiments

- [ ] Dutch daily quiz mode (separate NL bank) — only after NL word mode proves out
- [ ] Weekly tournament puzzles (harder sets, shareable)
- [ ] Discord/community leaderboard without accounts (anonymous daily codes)

## Content engine (already running)

- Quiz bank: 660 → **960 questions** (2026-08-23 sprint, free model)
- Word Pool: 30 → **35 categories**
- Weekly curator cron (Mon 10:00) keeps +44 questions/week flowing
- 7 Letters: 60 daily boards banked (26–180 words each)

## Numbers that matter (from this session)

- 7 games live (after v2.3 push) · free sprint produced ~7 months of curator output for €0
- Deploy = push to main → Vercel
