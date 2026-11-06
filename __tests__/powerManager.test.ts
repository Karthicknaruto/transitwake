import { powerManager } from '../src/services/powerManager';

describe('PowerManager — Smart GPS Battery Saver & Dynamic Throttling', () => {
  beforeEach(() => {
    powerManager.resetForTesting();
  });

  it('calculates CRUISING tier (> 10 km) with 30s interval and 75%+ savings', () => {
    const tier = powerManager.computeTier(15.2, 40); // 15.2 km away, 40 km/h
    expect(tier.level).toBe('CRUISING');
    expect(tier.intervalMs).toBe(30000);
    expect(tier.distanceThresholdMeters).toBe(200);
    expect(tier.savingsPercentage).toBeGreaterThanOrEqual(75);
  });

  it('calculates APPROACHING tier (5 to 10 km) with 10s interval', () => {
    const tier = powerManager.computeTier(7.5, 50); // 7.5 km away
    expect(tier.level).toBe('APPROACHING');
    expect(tier.intervalMs).toBe(10000);
    expect(tier.distanceThresholdMeters).toBe(50);
  });

  it('calculates ARRIVAL tier (< 5 km) with 1s high-precision polling', () => {
    const tier = powerManager.computeTier(3.8, 45); // 3.8 km away
    expect(tier.level).toBe('ARRIVAL');
    expect(tier.intervalMs).toBe(1000);
    expect(tier.distanceThresholdMeters).toBe(5);
  });

  it('applies velocity compensation for express trains moving over 75 km/h', () => {
    // When far away (>10 km) but moving at 90 km/h, drop interval to avoid overshoot
    const tier = powerManager.computeTier(12.0, 95);
    expect(tier.intervalMs).toBeLessThanOrEqual(15000);
  });

  it('forces 1s polling when manual high accuracy override is activated', () => {
    powerManager.setManualOverride(true);
    const tier = powerManager.computeTier(25.0, 30);
    expect(tier.intervalMs).toBe(1000);
    expect(powerManager.getState().manualOverride).toBe(true);
  });

  it('allows disabling battery saver altogether', () => {
    powerManager.setBatterySaverActive(false);
    expect(powerManager.getState().batterySaverActive).toBe(false);
    const tier = powerManager.computeTier(20.0, 30);
    expect(tier.intervalMs).toBe(1000); // Defaults to full rate when saver is disabled
  });
});
