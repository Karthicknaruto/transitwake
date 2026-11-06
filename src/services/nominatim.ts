import { Coordinates } from '../types';
import { offlineCacheService } from './offlineCacheService';

export interface SearchResult {
  placeId: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

/**
 * Searches places, train stations, bus stops, and landmarks using OpenStreetMap Nominatim API.
 * Free, open, zero API-key requirement.
 */
export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? (AbortSignal as any).timeout(7000) : undefined,
      headers: {
        'User-Agent': 'TransitWake-App/1.0',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();

    const results: SearchResult[] = data.map((item: any) => ({
      placeId: String(item.place_id),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || 'place',
    }));

    // Cache results for offline subway tunnels
    offlineCacheService.cacheSearchResults(trimmed, results);
    return results;
  } catch (error) {
    console.warn('Place search failed (offline or network issue):', error);
    // Offline subway tunnel fallback
    const cached = offlineCacheService.getCachedSearchResults(trimmed);
    if (cached && cached.length > 0) {
      return cached;
    }
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a human-readable station or place name.
 */
export async function reverseGeocode(coord: Coordinates): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}`;
    const response = await fetch(url, {
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? (AbortSignal as any).timeout(7000) : undefined,
      headers: {
        'User-Agent': 'TransitWake-App/1.0',
      },
    });

    if (!response.ok) throw new Error('Reverse geocode failed');
    const data = await response.json();
    return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : 'Selected Location';
  } catch (e) {
    return `Pin (${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)})`;
  }
}
