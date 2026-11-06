import { locationService } from '../src/services/locationService';

// Mock expo-location module
jest.mock(
  'expo-location',
  () => {
    return {
      Accuracy: {
        Balanced: 3,
        High: 4,
      },
      requestForegroundPermissionsAsync: jest.fn(),
      requestBackgroundPermissionsAsync: jest.fn(),
      getCurrentPositionAsync: jest.fn(),
      watchPositionAsync: jest.fn(),
    };
  },
  { virtual: true }
);

const ExpoLocation = require('expo-location');

describe('LocationService Real-time GPS & Commute Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    locationService.stopTracking();
  });

  describe('requestPermissions', () => {
    it('returns true when foreground permissions are granted', async () => {
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
      });
      ExpoLocation.requestBackgroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
      });

      const granted = await locationService.requestPermissions();
      expect(granted).toBe(true);
    });

    it('returns false when foreground permissions are denied', async () => {
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
      });

      const granted = await locationService.requestPermissions();
      expect(granted).toBe(false);
    });

    it('falls back safely if permission check throws (web / dev fallback)', async () => {
      ExpoLocation.requestForegroundPermissionsAsync.mockRejectedValueOnce(
        new Error('Permissions not supported on web')
      );

      const granted = await locationService.requestPermissions();
      expect(granted).toBe(true);
    });
  });

  describe('getCurrentLocation', () => {
    it('returns coordinates when device GPS position is retrieved', async () => {
      ExpoLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      });

      const loc = await locationService.getCurrentLocation();
      expect(loc).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
      });
    });

    it('returns default fallback coordinates if device GPS fails', async () => {
      ExpoLocation.getCurrentPositionAsync.mockRejectedValueOnce(
        new Error('Location timeout')
      );

      const loc = await locationService.getCurrentLocation();
      expect(loc).toEqual({
        latitude: 40.7527,
        longitude: -73.9772,
      });
    });
  });

  describe('startTracking & stopTracking', () => {
    it('starts watching position and converts speed m/s to km/h', async () => {
      let registeredCallback: any = null;
      const mockRemove = jest.fn();

      ExpoLocation.watchPositionAsync.mockImplementationOnce(
        async (_options: any, callback: any) => {
          registeredCallback = callback;
          return { remove: mockRemove };
        }
      );

      const updateCallback = jest.fn();
      await locationService.startTracking(updateCallback, 3000, 25);

      expect(ExpoLocation.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          timeInterval: 3000,
          distanceInterval: 25,
        }),
        expect.any(Function)
      );

      // Simulate GPS position update from device (10 m/s = 36 km/h)
      registeredCallback({
        coords: {
          latitude: 40.73,
          longitude: -73.99,
          speed: 10,
        },
      });

      expect(updateCallback).toHaveBeenCalledWith(
        { latitude: 40.73, longitude: -73.99 },
        36 // 10 * 3.6
      );

      // Simulate stopTracking
      locationService.stopTracking();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('handles null or negative speed gracefully', async () => {
      let registeredCallback: any = null;
      ExpoLocation.watchPositionAsync.mockImplementationOnce(
        async (_options: any, callback: any) => {
          registeredCallback = callback;
          return { remove: jest.fn() };
        }
      );

      const updateCallback = jest.fn();
      await locationService.startTracking(updateCallback);

      // Speed is null
      registeredCallback({
        coords: {
          latitude: 40.73,
          longitude: -73.99,
          speed: null,
        },
      });

      expect(updateCallback).toHaveBeenCalledWith(
        { latitude: 40.73, longitude: -73.99 },
        null
      );
    });

    it('re-starting tracking stops any previous watcher before creating a new one', async () => {
      const firstRemove = jest.fn();
      const secondRemove = jest.fn();

      ExpoLocation.watchPositionAsync
        .mockResolvedValueOnce({ remove: firstRemove })
        .mockResolvedValueOnce({ remove: secondRemove });

      const cb = jest.fn();
      await locationService.startTracking(cb);
      await locationService.startTracking(cb);

      expect(firstRemove).toHaveBeenCalled();
    });
  });
});
