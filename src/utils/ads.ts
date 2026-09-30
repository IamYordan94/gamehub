// ─────────────────────────────────────────────────────────────
// Ad layer — network-agnostic config + slot support.
//
// LIVE TODAY: the Monetag In-Page Push tag (zone 11640179) loads
// from index.html — one gentle closable format, no popunders.
// This slot system is dormant: paste a Monetag tag URL below to
// activate <AdSlot> placements, or an AdSense client later via
// AD_CONFIG.adsenseClient. With both empty, slots render nothing.
// ─────────────────────────────────────────────────────────────

export const AD_CONFIG = {
  monetagTagUrl: '', // e.g. 'https://alwingulla.com/88/tag.min.js' — paste your real tag here
  adsenseClient: '', // future: e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
};

export const adsEnabled = AD_CONFIG.monetagTagUrl.length > 0 || AD_CONFIG.adsenseClient.length > 0;

export interface AdResult {
  rewarded: boolean;
  dismissed: boolean;
}

/** Hint gating stays off on web for now — hints are free. */
export async function shouldShowAdForHint(_game: string): Promise<boolean> {
  return false;
}

export async function showRewardedAd(): Promise<AdResult> {
  // Fail-closed: no ad shown -> no reward. (No callers today; hints stay free.)
  return { rewarded: false, dismissed: true };
}
