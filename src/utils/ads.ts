import { AdMob, type RewardAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Test ad unit IDs - replace with your production IDs before release
const AD_UNIT_IDS = {
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  },
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // Test ID
  }
};

let isInitialized = false;

export async function initializeAds(): Promise<void> {
  if (!isNative || isInitialized) return;

  try {
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: true,
    });
    isInitialized = true;
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
}

function getRewardedAdUnitId(): string {
  if (Capacitor.getPlatform() === 'ios') {
    return AD_UNIT_IDS.ios.rewarded;
  }
  return AD_UNIT_IDS.android.rewarded;
}

export interface AdResult {
  rewarded: boolean;
  dismissed: boolean;
  error?: string;
}

export async function showRewardedAd(): Promise<AdResult> {
  if (!isNative) {
    console.log('Not on native platform, skipping ad');
    return { rewarded: true, dismissed: false };
  }

  if (!isInitialized) {
    console.warn('AdMob not initialized, attempting to initialize...');
    try {
      await initializeAds();
    } catch (error) {
      return { 
        rewarded: false, 
        dismissed: true, 
        error: 'Failed to initialize AdMob' 
      };
    }
  }

  try {
    const options: RewardAdOptions = {
      adId: getRewardedAdUnitId(),
      isTesting: true,
    };

    // Prepare and show the ad
    await AdMob.prepareRewardVideoAd(options);
    await AdMob.showRewardVideoAd();
    
    // If we reach here, the user watched the ad and got the reward
    return {
      rewarded: true,
      dismissed: true,
    };
  } catch (error: unknown) {
    console.error('Error showing rewarded ad:', error);
    return {
      rewarded: false,
      dismissed: true,
      error: error instanceof Error ? error.message : 'Failed to show ad',
    };
  }
}

export async function shouldShowAdForHint(game: string): Promise<boolean> {
  if (!isNative) return false;
  
  try {
    const { getHintsUsedToday } = await import('./database');
    const hintsUsed = await getHintsUsedToday(game);
    return hintsUsed >= 1;
  } catch (error) {
    console.error('Error checking hint usage:', error);
    return false;
  }
}
