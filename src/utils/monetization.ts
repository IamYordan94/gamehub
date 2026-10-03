// monetization.ts — Yodoku+ entitlement + archive gating scaffolding.
//
// STATE (2026-10-03): scaffolding only. PAID_ENABLED is the master switch and
// stays false until accounts exist (Supabase auth + Lemon Squeezy checkout and
// webhooks). While PAID_ENABLED is false every helper returns "unlocked", so
// production behaviour is unchanged. Local testing: append ?plus=1 to any URL
// to simulate a subscriber.
//
// Integration points (Phase C): OrderleCalendar, FermiCalendar,
// ChangeByOneCalendar, LetterMixCalendar, WordPoolPreviousGames.

export const PAID_ENABLED = false;
export const FREE_ARCHIVE_DAYS = 7;

const PLUS_KEY = 'yodoku_plus_local'; // temporary until real entitlements land

function urlOverride(): boolean {
  try {
    return new URL(window.location.href).searchParams.get('plus') === '1';
  } catch {
    return false;
  }
}

/** True when the current visitor has Yodoku+ (or a local/dev override). */
export function isPlusActive(): boolean {
  if (urlOverride()) return true;
  if (!PAID_ENABLED) return false;
  try {
    return localStorage.getItem(PLUS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Days between an ISO date (YYYY-MM-DD, UTC) and today (UTC). Never negative. */
export function daysAgoUtc(dateStr: string): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const d = new Date(dateStr + 'T00:00:00Z');
  const then = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.max(0, Math.round((todayUtc - then) / 86400000));
}

/**
 * Archive policy: today + the last FREE_ARCHIVE_DAYS days are always free.
 * Older days unlock with Yodoku+. Pre-launch (PAID_ENABLED=false): all open.
 */
export function isArchiveUnlocked(dateStr: string): boolean {
  if (!PAID_ENABLED) return true;
  return daysAgoUtc(dateStr) <= FREE_ARCHIVE_DAYS || isPlusActive();
}

/** True when a day should show a "Plus" hint (future preview UI). */
export function showsPlusHint(dateStr: string): boolean {
  return PAID_ENABLED && daysAgoUtc(dateStr) > FREE_ARCHIVE_DAYS && !isPlusActive();
}
