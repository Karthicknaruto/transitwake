import { Coordinates } from '../types';

export type LocationUpdateCallback = (coords: Coordinates, speedKmh: number | null) => void;

class LocationService {
  private watcher: any = null;
  private isTracking: boolean = false;

  /**
   * Requests foreground and background location permissions.
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { requestForegroundPermissionsAsync, requestBackgroundPermissionsAsync } = require('expo-location');
      const { status: fgStatus } = await requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        return false;
      }

      // Try background permission (optional on web or emulator)
      try {
        await requestBackgroundPermissionsAsync();
      } catch (e) {
        // Continue even if background fails in dev
      }

      return true;
    } catch (err) {
      console.warn('Location permissions check (fallback for web/dev):', err);
      return true;
    }
  }

  /**
   * Retrieves the current device coordinates.
   */
  public async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const { getCurrentPositionAsync, Accuracy } = require('expo-location');
      const location = await getCurrentPositionAsync({
        accuracy: Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (err) {
      // Fallback for emulator / web if device GPS is not simulated
      return {
        latitude: 40.7527,
        longitude: -73.9772,
      };
    }
  }

  /**
   * Starts watching device position in real-time.
   */
  public async startTracking(
    callback: LocationUpdateCallback,
    intervalMs: number = 5000,
    distanceMeters: number = 50
  ) {
    if (this.isTracking) {
      this.stopTracking();
    }
    this.isTracking = true;

    try {
      const { watchPositionAsync, Accuracy } = require('expo-location');
      this.watcher = await watchPositionAsync(
        {
          accuracy: Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval: distanceMeters,
        },
        (loc: any) => {
          const speedMps = loc.coords.speed;
          const speedKmh = speedMps && speedMps > 0 ? speedMps * 3.6 : null;
          callback(
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            },
            speedKmh
          );
        }
      );
    } catch (err) {
      console.warn('watchPositionAsync fallback for dev:', err);
    }
  }

  public stopTracking() {
    this.isTracking = false;
    if (this.watcher && typeof this.watcher.remove === 'function') {
      this.watcher.remove();
      this.watcher = null;
    }
  }
}

export const locationService = new LocationService();
