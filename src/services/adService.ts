import { AD_CONFIG } from '../config/admob';
import { subscriptionService } from './subscriptionService';

type AdDismissCallback = () => void;

class AdService {
  private lastInterstitialTime: number = 0;
  private isAlarmActive: boolean = false;
  private onShowInterstitialListener: ((onDismiss: AdDismissCallback) => void) | null = null;

  /**
   * Sets whether the emergency wake-up alarm is active.
   * While active, ALL interstitial popup ads are strictly blocked to prioritize waking the user.
   */
  public setAlarmActive(active: boolean) {
    this.isAlarmActive = active;
  }

  /**
   * Resets internal timestamps and state (useful for tests or app restarts).
   */
  public resetForTesting() {
    this.lastInterstitialTime = 0;
    this.isAlarmActive = false;
  }

  /**
   * Registers the active UI modal / native ad handler to present the interstitial.
   */
  public registerInterstitialHandler(handler: (onDismiss: AdDismissCallback) => void) {
    this.onShowInterstitialListener = handler;
  }

  public unregisterInterstitialHandler() {
    this.onShowInterstitialListener = null;
  }

  /**
   * Checks whether banner ads should be rendered.
   * Prime subscribers never see banner ads.
   */
  public shouldShowBanner(): boolean {
    return !subscriptionService.isAdFree();
  }

  /**
   * Evaluates whether an interstitial popup ad can be shown safely right now.
   */
  public canShowInterstitial(): boolean {
    // 0. PRIME SUBSCRIBER CHECK: Zero ads for Prime members
    if (subscriptionService.isAdFree()) {
      return false;
    }

    // 1. SAFETY FIRST: Never show ads if alarm is ringing!
    if (this.isAlarmActive) {
      return false;
    }

    const now = Date.now();
    // 2. Frequency capping / cooldown check
    if (now - this.lastInterstitialTime < AD_CONFIG.interstitialCooldownMs) {
      return false;
    }

    return true;
  }

  /**
   * Attempts to display an interstitial popup ad.
   * Calls `onComplete` when ad is dismissed or immediately if ad is blocked.
   */
  public triggerInterstitial(onComplete?: AdDismissCallback): boolean {
    if (!this.canShowInterstitial() || !this.onShowInterstitialListener) {
      if (onComplete) onComplete();
      return false;
    }

    this.lastInterstitialTime = Date.now();
    this.onShowInterstitialListener(() => {
      if (onComplete) onComplete();
    });
    return true;
  }
}

export const adService = new AdService();
