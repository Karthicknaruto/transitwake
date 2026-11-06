import { PowerState, PowerTierConfig, PowerTierLevel } from '../types/power';

class PowerManager {
  private state: PowerState = {
    currentTier: 'ARRIVAL',
    intervalMs: 1000,
    distanceThresholdMeters: 5,
    batterySaverActive: true,
    manualOverride: false,
  };

  public getState(): PowerState {
    return { ...this.state };
  }

  public setBatterySaverActive(active: boolean): void {
    this.state.batterySaverActive = active;
  }

  public setManualOverride(override: boolean): void {
    this.state.manualOverride = override;
  }

  /**
   * Computes the optimal GPS polling tier based on distance and velocity
   */
  public computeTier(distanceKm: number, speedKmh: number = 0): PowerTierConfig {
    if (!this.state.batterySaverActive || this.state.manualOverride) {
      return {
        level: 'ARRIVAL',
        name: 'High Precision (Standard)',
        intervalMs: 1000,
        distanceThresholdMeters: 5,
        savingsPercentage: 0,
      };
    }

    let tier: PowerTierConfig;

    if (distanceKm > 10.0) {
      tier = {
        level: 'CRUISING',
        name: 'Cruising (Power Saver)',
        intervalMs: 30000,
        distanceThresholdMeters: 200,
        savingsPercentage: 78,
      };
    } else if (distanceKm > 5.0) {
      tier = {
        level: 'APPROACHING',
        name: 'Approaching (Balanced)',
        intervalMs: 10000,
        distanceThresholdMeters: 50,
        savingsPercentage: 45,
      };
    } else {
      tier = {
        level: 'ARRIVAL',
        name: 'Arrival Zone (High Precision)',
        intervalMs: 1000,
        distanceThresholdMeters: 5,
        savingsPercentage: 0,
      };
    }

    // Velocity compensation: if ground speed > 75 km/h, halve the polling interval
    if (speedKmh > 75 && tier.intervalMs > 1000) {
      tier = {
        ...tier,
        intervalMs: Math.max(1000, Math.floor(tier.intervalMs / 2)),
      };
    }

    this.state.currentTier = tier.level;
    this.state.intervalMs = tier.intervalMs;
    this.state.distanceThresholdMeters = tier.distanceThresholdMeters;

    return tier;
  }

  public resetForTesting(): void {
    this.state = {
      currentTier: 'ARRIVAL',
      intervalMs: 1000,
      distanceThresholdMeters: 5,
      batterySaverActive: true,
      manualOverride: false,
    };
  }
}

export const powerManager = new PowerManager();
