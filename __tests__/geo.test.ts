import {
  haversineDistance,
  isAlarmTriggered,
  formatDistance,
  calculateAdaptiveInterval,
  estimateETA,
} from '../src/utils/geo';

describe('Geo Utilities & Haversine Distance Engine', () => {
  describe('haversineDistance', () => {
    it('returns 0 when coordinates are identical', () => {
      const coord = { latitude: 37.7749, longitude: -122.4194 };
      expect(haversineDistance(coord, coord)).toBe(0);
    });

    it('calculates London to Paris distance accurately (~343 km)', () => {
      const london = { latitude: 51.5074, longitude: -0.1278 };
      const paris = { latitude: 48.8566, longitude: 2.3522 };
      const distance = haversineDistance(london, paris);
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(346);
    });

    it('detects a short 4 km commute segment accurately', () => {
      // Lower Manhattan to Times Square (~5.5 km)
      const pointA = { latitude: 40.7128, longitude: -74.006 };
      const pointB = { latitude: 40.758, longitude: -73.9855 };
      const distance = haversineDistance(pointA, pointB);
      expect(distance).toBeGreaterThan(5.0);
      expect(distance).toBeLessThan(5.6);
    });
  });

  describe('isAlarmTriggered', () => {
    it('triggers alarm when within 4.0 km (default)', () => {
      expect(isAlarmTriggered(4.0, 4.0)).toBe(true);
      expect(isAlarmTriggered(3.9, 4.0)).toBe(true);
      expect(isAlarmTriggered(1.2, 4.0)).toBe(true);
      expect(isAlarmTriggered(0.1, 4.0)).toBe(true);
    });

    it('does NOT trigger alarm when outside 4.0 km or negative', () => {
      expect(isAlarmTriggered(4.01, 4.0)).toBe(false);
      expect(isAlarmTriggered(4.5, 4.0)).toBe(false);
      expect(isAlarmTriggered(10.0, 4.0)).toBe(false);
      expect(isAlarmTriggered(-1, 4.0)).toBe(false);
    });

    it('respects custom user-configured radiuses (e.g. 2 km, 5 km)', () => {
      expect(isAlarmTriggered(1.9, 2.0)).toBe(true);
      expect(isAlarmTriggered(2.1, 2.0)).toBe(false);
      expect(isAlarmTriggered(4.8, 5.0)).toBe(true);
    });
  });

  describe('formatDistance', () => {
    it('formats distances under 1 km in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.05)).toBe('50 m');
      expect(formatDistance(0.854)).toBe('854 m');
    });

    it('formats distances 1 km and above with one decimal place', () => {
      expect(formatDistance(4.0)).toBe('4.0 km');
      expect(formatDistance(3.82)).toBe('3.8 km');
      expect(formatDistance(12.45)).toBe('12.5 km');
    });

    it('handles null and invalid distances safely', () => {
      expect(formatDistance(null)).toBe('--');
      expect(formatDistance(-1)).toBe('--');
      expect(formatDistance(NaN)).toBe('--');
    });
  });

  describe('calculateAdaptiveInterval', () => {
    it('uses battery-saver mode (> 15 km)', () => {
      const interval = calculateAdaptiveInterval(25);
      expect(interval.timeIntervalMs).toBe(60000);
      expect(interval.distanceIntervalMeters).toBe(500);
    });

    it('uses medium tracking mode (5-15 km)', () => {
      const interval = calculateAdaptiveInterval(10);
      expect(interval.timeIntervalMs).toBe(20000);
      expect(interval.distanceIntervalMeters).toBe(200);
    });

    it('uses high precision mode (< 5 km) near the 4 km stop boundary', () => {
      const interval = calculateAdaptiveInterval(4.5);
      expect(interval.timeIntervalMs).toBe(5000);
      expect(interval.distanceIntervalMeters).toBe(50);
    });
  });

  describe('estimateETA', () => {
    it('estimates ETA correctly with vehicle speed', () => {
      // 40 km at 40 km/h = 60 mins
      expect(estimateETA(40, 40)).toBe(60);
      // 4 km at 60 km/h = 4 mins
      expect(estimateETA(4, 60)).toBe(4);
    });

    it('falls back to default transit estimate when speed is zero or null', () => {
      // 40 km with fallback 40 km/h = 60 mins
      expect(estimateETA(40, null)).toBe(60);
      expect(estimateETA(40, 0)).toBe(60);
    });

    it('returns 0 when distance is 0', () => {
      expect(estimateETA(0, 50)).toBe(0);
    });
  });
});
