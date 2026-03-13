// Web-only: ads are not shown. These stubs keep the rest of the codebase compatible.

export interface AdResult {
  rewarded: boolean;
  dismissed: boolean;
}

/** Always returns false on web — hints are always free. */
export async function shouldShowAdForHint(_game: string): Promise<boolean> {
  return false;
}

/** No-op on web. */
export async function showRewardedAd(): Promise<AdResult> {
  return { rewarded: true, dismissed: false };
}
