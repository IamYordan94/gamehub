// telemetry.ts — thin wrapper over Vercel Analytics custom events.
// Never throws: telemetry must never break a game (offline, blocked, tests).
// Events land in the Vercel dashboard: Analytics → Events.

import { track as vaTrack } from '@vercel/analytics';

export type TelemetryProps = Record<string, string | number | boolean | null | undefined>;

/** Fire one custom analytics event. Safe no-op on any failure. */
export function track(event: string, props?: TelemetryProps): void {
  try {
    vaTrack(event, props);
  } catch {
    /* analytics unavailable — never break the game for telemetry */
  }
}
