# Yodoku — Execution Tracker

**Build branch for Yodoku+: `yodoku-plus`** (merge to main = deploy; branch pushes do not deploy).
Updated: 2026-10-03 (evening — Yodoku+ build in progress)

## Locked decisions
- Pricing: **€2.99/mo · €19.99/yr** (approved by Yordan)
- Brand: publisher = **Yordan Creatives**; product name = **Yodoku**
- Shop window: **ALL 7 games**; Quiz Master additionally gets the strategic standalone push
- Free forever: today's puzzles + the last 7 days. Yodoku+: full archive + ad-free + cross-device sync + unlimited practice
- Payments: Lemon Squeezy (web, merchant of record) · Google Play Billing via RevenueCat (Android)
- No domain changes · no popunder ads · no paid ads · no new game until two flagship rotations fail

## Status board
| Phase | Task | Status |
|---|---|---|
| A | Telemetry: Vercel Analytics custom events — `share_open/download/whatsapp/copy` via ShareCardModal (covers all 7 games); per-game play counts come from per-route page views | ✅ done (branch) |
| A | Hub front-door copy → "Seven daily games. One minute each. Free forever." + ticker "no signup" | ✅ done (branch) |
| A | `hello@yodoku.app` email | ⏳ needs domain DNS access (Yordan) |
| A | Newsletter (English, bot-composed; **Brevo or Resend** — Yordan's pick, final choice when he opens the account; sender script supports both) | ⏳ needs account (Yordan) + bot composer (me) |
| A | Baseline numbers: Vercel dashboard → Analytics (page views per game, last 30 days) | ⏳ Yordan pastes numbers |
| B | Directory submission list | ✅ 35 verified targets + ready blurbs → `docs/marketing/DIRECTORY-SUBMISSIONS.md` |
| B | Newsletter target list | ✅ 23 verified targets + 3 pitch templates → `docs/marketing/NEWSLETTER-TARGETS.md` |
| B | Account due-diligence guide | ✅ → `docs/marketing/ACCOUNT-SETUP-GUIDE.md` — **Bulgaria supported** (Lemon Squeezy + Paddle + Play, EUR). Play gate: 12 testers × 14 continuous days for new personal accounts |
| B | Daily WhatsApp digest cron at 08:00 (script `yodoku-daily-digest.py` sends via `hermes send`; job deliver=local; rotating featured game) | ✅ created + first send verified 2026-10-03 (WhatsApp bridge had died — relaunched manually, adapter adopted it; see hermes-gateway-ops skill, WinError-5 section) |
| C | Monetization scaffold `src/utils/monetization.ts` (`PAID_ENABLED=false`, `?plus=1` + `?pluspreview=1` overrides, env config: `VITE_CHECKOUT_URL` / `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) | ✅ done (merged) |
| C | Calendar gating integration — all 5 surfaces (Orderle/Fermi lists, ChangeByOne/LetterMix/WordPool grids) with `LockBadge` + `PlusSheet` | ✅ done — verified on built preview: 11 locked rows (ORDERLE/FERMI), 25 locked cells each grid calendar, sheet opens, flag-off mode completely unchanged |
| C | Supabase accounts (magic link) + anonymous-progress merge | ⏳ after accounts |
| C | `/plus` page (matches approved design), hub masthead chip, account scaffold (`src/utils/account.ts` — lazy Supabase, dormant until env set) | ✅ done — CTA shows "Launching soon" until `VITE_CHECKOUT_URL` exists |
| C | Lemon Squeezy webhook receiver (`api/`) | ⏳ next |
| C | Lemon Squeezy checkout + entitlement store wiring | ⏳ after accounts |
| C | Subscription UI: pricing page, "Plus" hints on locked days | ⏳ with C |
| D | Signed release build: AAB + APK | ✅ built 2026-10-03 (BUILD SUCCESSFUL, signed) — app-release.aab 14.1MB / app-release.apk 14.3MB. Keystore `~/yodoku-release.keystore` (alias yodoku) + README alongside; helper `scripts/build-android.sh` |
| D | Play listing assets (8 phone screenshots, feature graphic, description, data-safety draft) | ⏳ next |
| D | RevenueCat wiring | ⏳ after accounts |
| D | Play closed-test gate: 12 testers opted in continuously × 14 days before production (Google policy, verified) | ⏳ recruit testers before Play launch |
| E | Monetization ladder (premium ad network ≥500k sessions/mo; sponsor ≥50k players) | later |
| F | Gates day 30/60/90 (see MASTER-PLAN §3F) | later |

## Paywall integration points (verified in code)
- `src/pages/OrderleCalendar.tsx` — 19-day list, tiles link to `/orderle/play?date=`; gate each tile with `isArchiveUnlocked(dateStr)`
- `src/pages/FermiCalendar.tsx` — same pattern as above
- `src/pages/ChangeByOneCalendar.tsx`, `src/pages/LetterMixCalendar.tsx` — same pattern
- `src/pages/WordPoolPreviousGames.tsx` — list of previous pools
- Helper module: `src/utils/monetization.ts` — use `isArchiveUnlocked()` at each tile; the copy "Puzzles cycle every 45 days" needs a "last 7 days free" line when the paywall flips on

## Working notes
- Android build: `bash scripts/build-android.sh` (auto-uses Android Studio JBR as JAVA_HOME; SDK from `android/local.properties`). Release keystore: `~/yodoku-release.keystore` (yodoku / YodokuKey2026) — NEVER commit; `android/keystore.properties` is gitignored.
- Repo = deploy: push `main` → Vercel auto-deploys. Branch pushes are safe.
- Strategy docs: `docs/MASTER-PLAN.md`, `docs/COMPETITIVE-ANALYSIS.md`, `docs/marketing/*`
- After the paywall flips: bump `CACHE` in `public/sw.js` (service-worker shell change)
