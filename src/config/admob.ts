import { Platform } from 'react-native';

/**
 * Google AdMob Ad Unit Configuration
 * 
 * To monetize your app and earn revenue:
 * 1. Create an account at https://admob.google.com
 * 2. Create an App for Android and/or iOS
 * 3. Create a "Banner" Ad Unit and an "Interstitial" Ad Unit
 * 4. Replace the PRODUCTION IDs below with your real IDs from AdMob console!
 */

// Official Google AdMob Sample/Test Ad Unit IDs (Guaranteed to return test ads safely)
const ADMOB_TEST_IDS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

// Replace these with your real AdMob IDs when releasing to the Google Play Store / Apple App Store!
const ADMOB_PRODUCTION_IDS = {
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
  },
  ios: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB',
  },
};

// Set this to TRUE during development and testing to prevent policy violations and account bans
const IS_DEV_MODE = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

const platform = Platform.OS === 'ios' ? 'ios' : 'android';
const activeIds = IS_DEV_MODE ? ADMOB_TEST_IDS[platform] : ADMOB_PRODUCTION_IDS[platform];

export const AD_CONFIG = {
  isDevMode: IS_DEV_MODE,
  bannerAdUnitId: activeIds.banner,
  interstitialAdUnitId: activeIds.interstitial,
  // Minimum time between interstitial popup ads (in milliseconds) to prevent spamming users
  interstitialCooldownMs: 45000, // 45 seconds
};
