export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Destination {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusKm: number; // default 4.0 km
}

export type AlarmStatus = 'IDLE' | 'TRACKING' | 'TRIGGERED' | 'SNOOZED';

export interface TrackingState {
  currentLocation: Coordinates | null;
  speedKmh: number | null;
  heading: number | null;
  distanceKm: number | null;
  etaMinutes: number | null;
  status: AlarmStatus;
  destination: Destination | null;
  isSimulating: boolean;
  simulationProgress: number; // 0 to 1
}

export interface AdConfig {
  showMockAdsInDev: boolean;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  interstitialCooldownMs: number;
}

export * from './auth';
export * from './notification';
export * from './power';
export * from './routes';
export * from './subscription';
export * from './offline';
