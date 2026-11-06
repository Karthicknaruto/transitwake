import { Coordinates } from '../types';

const EARTH_RADIUS_KM = 6371.0088; // WGS84 mean earth radius in km

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (completely offline, zero API calls).
 * 
 * @param coord1 Origin coordinate
 * @param coord2 Destination coordinate
 * @returns Distance in kilometers
 */
export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const lat1 = toRadians(coord1.latitude);
  const lon1 = toRadians(coord1.longitude);
  const lat2 = toRadians(coord2.latitude);
  const lon2 = toRadians(coord2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Checks whether the current distance is within the trigger alarm radius (default 4.0 km).
 */
export function isAlarmTriggered(distanceKm: number, radiusKm: number = 4.0): boolean {
  if (distanceKm < 0) return false;
  return distanceKm <= radiusKm;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 * Examples: 0.45 km -> "450 m", 3.82 km -> "3.8 km", 12.0 km -> "12.0 km"
 */
export function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null || isNaN(distanceKm) || distanceKm < 0) {
    return '--';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  const rounded = Math.round(distanceKm * 10) / 10;
  return `${rounded.toFixed(1)} km`;
}

/**
 * Calculates battery-optimized GPS polling parameters based on distance remaining.
 * Far away -> low battery consumption (infrequent updates)
 * Close to stop -> high accuracy (frequent updates)
 */
export function calculateAdaptiveInterval(distanceKm: number): {
  timeIntervalMs: number;
  distanceIntervalMeters: number;
} {
  if (distanceKm > 15) {
    return { timeIntervalMs: 60000, distanceIntervalMeters: 500 };
  } else if (distanceKm > 5) {
    return { timeIntervalMs: 20000, distanceIntervalMeters: 200 };
  } else {
    // Within 5km: High precision to ensure 4km trigger is caught promptly
    return { timeIntervalMs: 5000, distanceIntervalMeters: 50 };
  }
}

/**
 * Estimates remaining arrival time in minutes.
 * @param distanceKm Distance remaining in km
 * @param speedKmh Current speed in km/h. If missing or stationary, falls back to standard 45 km/h transit speed.
 */
export function estimateETA(distanceKm: number, speedKmh: number | null): number {
  if (distanceKm <= 0) return 0;
  
  // Use current speed if moving faster than walking speed (5 km/h), else fallback to transit estimate (40 km/h)
  const effectiveSpeed = (speedKmh && speedKmh > 5) ? speedKmh : 40;
  const hours = distanceKm / effectiveSpeed;
  return Math.max(1, Math.round(hours * 60));
}
