import { searchPlaces, reverseGeocode } from '../src/services/nominatim';

describe('Nominatim OpenStreetMap Geocoder (Item 7 & 8)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns empty array when query is less than 2 characters', async () => {
    const results = await searchPlaces('a');
    expect(results).toEqual([]);
  });

  it('parses valid Nominatim JSON results accurately', async () => {
    const mockData = [
      {
        place_id: 12345,
        name: 'Grand Central Terminal',
        display_name: 'Grand Central Terminal, 89 E 42nd St, New York, NY 10017',
        lat: '40.7527',
        lon: '-73.9772',
        type: 'station',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const results = await searchPlaces('Grand Central');
    expect(results.length).toBe(1);
    expect(results[0].placeId).toBe('12345');
    expect(results[0].name).toBe('Grand Central Terminal');
    expect(results[0].latitude).toBeCloseTo(40.7527);
    expect(results[0].longitude).toBeCloseTo(-73.9772);
  });

  it('handles network failure gracefully without throwing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network offline')) as any;
    const results = await searchPlaces('Downtown');
    expect(results).toEqual([]);
  });

  it('reverse geocodes coordinates to readable name', async () => {
    const mockReverse = {
      display_name: 'Penn Station, 7th Ave, New York, NY',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReverse,
    }) as any;

    const name = await reverseGeocode({ latitude: 40.7505, longitude: -73.9934 });
    expect(name).toContain('Penn Station');
  });

  it('falls back to coordinate string when reverse geocode fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Offline')) as any;
    const name = await reverseGeocode({ latitude: 40.7505, longitude: -73.9934 });
    expect(name).toBe('Pin (40.7505, -73.9934)');
  });

  it('falls back to cached station search results when network is offline in subway tunnels', async () => {
    const mockData = [
      {
        place_id: 9999,
        name: 'Metro Underground Station',
        display_name: 'Metro Underground Station, Platform 1',
        lat: '12.9716',
        lon: '77.5946',
        type: 'station',
      },
    ];

    // First successful online search
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const onlineResults = await searchPlaces('Metro Underground');
    expect(onlineResults.length).toBe(1);

    // Second search while offline in subway tunnel
    global.fetch = jest.fn().mockRejectedValue(new Error('Tunnel No Signal')) as any;
    const offlineResults = await searchPlaces('Metro Underground');
    expect(offlineResults.length).toBe(1);
    expect(offlineResults[0].name).toBe('Metro Underground Station');
  });
});
