export type PowerTierLevel = 'CRUISING' | 'APPROACHING' | 'ARRIVAL';

export interface PowerTierConfig {
  level: PowerTierLevel;
  name: string;
  intervalMs: number;
  distanceThresholdMeters: number;
  savingsPercentage: number;
}

export interface PowerState {
  currentTier: PowerTierLevel;
  intervalMs: number;
  distanceThresholdMeters: number;
  batterySaverActive: boolean;
  manualOverride: boolean;
}
