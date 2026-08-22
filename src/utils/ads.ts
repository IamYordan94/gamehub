// ─────────────────────────────────────────────────────────────
// Ad layer — network-agnostic config + slot support.
//
// To enable ads: paste your Monetag tag URL below (Monetag
// dashboard → Websites → your site → Get tag). Leave it empty
// and the site runs ad-free. AdSense can be added later via
// AD_CONFIG.adsenseClient.
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
  return { rewarded: true, dismissed: false };
}
