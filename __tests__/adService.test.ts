import { adService } from '../src/services/adService';
import { subscriptionService } from '../src/services/subscriptionService';

describe('AdService Monetization & Safety Guardrails', () => {
  beforeEach(async () => {
    adService.resetForTesting();
    await subscriptionService.resetForTesting();
  });

  afterEach(async () => {
    await subscriptionService.resetForTesting();
  });

  it('allows showing interstitial when alarm is idle, user is free tier, and handler is registered', () => {
    let adShown = false;
    adService.registerInterstitialHandler((onDismiss) => {
      adShown = true;
      onDismiss();
    });

    const result = adService.triggerInterstitial();
    expect(result).toBe(true);
    expect(adShown).toBe(true);
  });

  it('handles unregistered interstitial handler gracefully by falling back to immediate callback', () => {
    adService.unregisterInterstitialHandler();
    const onDismiss = jest.fn();
    const result = adService.triggerInterstitial(onDismiss);
    expect(result).toBe(false);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('STRICTLY BLOCKS interstitial ads when alarm is active (Zero-Delay Wakeup Guarantee)', () => {
    let adShown = false;
    adService.registerInterstitialHandler((onDismiss) => {
      adShown = true;
      onDismiss();
    });

    // Simulate alarm being triggered
    adService.setAlarmActive(true);

    const onDismiss = jest.fn();
    const result = adService.triggerInterstitial(onDismiss);
    // Must be blocked!
    expect(result).toBe(false);
    expect(adShown).toBe(false);
    expect(onDismiss).toHaveBeenCalled(); // must proceed immediately without delay
  });

  it('STRICTLY BLOCKS interstitial ads when user is a Prime subscriber', async () => {
    let adShown = false;
    adService.registerInterstitialHandler((onDismiss) => {
      adShown = true;
      onDismiss();
    });

    // Subscribe to Prime
    await subscriptionService.purchasePrime();
    expect(subscriptionService.isAdFree()).toBe(true);

    const onDismiss = jest.fn();
    const result = adService.triggerInterstitial(onDismiss);

    expect(result).toBe(false);
    expect(adShown).toBe(false);
    expect(onDismiss).toHaveBeenCalled(); // Proceeds immediately with zero ad delay
  });

  it('shouldShowBanner returns false for Prime subscribers and true for free users', async () => {
    expect(adService.shouldShowBanner()).toBe(true);

    await subscriptionService.purchasePrime();
    expect(adService.shouldShowBanner()).toBe(false);

    await subscriptionService.wipeData();
    expect(adService.shouldShowBanner()).toBe(true);
  });

  it('enforces cooldown / frequency capping between popups for free users', () => {
    let callCount = 0;
    adService.registerInterstitialHandler((onDismiss) => {
      callCount++;
      onDismiss();
    });

    // First call succeeds
    const first = adService.triggerInterstitial();
    expect(first).toBe(true);
    expect(callCount).toBe(1);

    // Immediate second call is throttled by cooldown
    const second = adService.triggerInterstitial();
    expect(second).toBe(false);
    expect(callCount).toBe(1);
  });
});
