import {
  generateWhatsAppEtaUrl,
  encodeRouteForSync,
  decodeRouteFromSync,
  RouteSyncPayload,
} from '../src/utils/routeSync';

describe('routeSync utility suite', () => {
  it('generates a clean WhatsApp ETA url with destination and radius', () => {
    const url = generateWhatsAppEtaUrl({
      destinationName: 'Churchgate Terminal',
      distanceKm: 8.5,
      etaMinutes: 14,
      speedKmh: 45,
      radiusKm: 4.0,
    });

    expect(url).toContain('https://wa.me/?text=');
    expect(decodeURIComponent(url)).toContain('Churchgate Terminal');
    expect(decodeURIComponent(url)).toContain('8.5 km');
    expect(decodeURIComponent(url)).toContain('14 mins');
    expect(decodeURIComponent(url)).toContain('4.0 km');
  });

  it('encodes and decodes a commuter route accurately', () => {
    const payload: RouteSyncPayload = {
      version: 1,
      destinationName: 'Kempegowda Majestic',
      destination: { latitude: 12.9767, longitude: 77.5713 },
      radiusKm: 4.0,
      originName: 'Indiranagar Metro',
      origin: { latitude: 12.9784, longitude: 77.6408 },
      transfer: {
        name: 'MG Road Interchange',
        coords: { latitude: 12.9756, longitude: 77.6066 },
        wakeRadiusKm: 2.0,
      },
    };

    const token = encodeRouteForSync(payload);
    expect(token).toBeTruthy();

    const decoded = decodeRouteFromSync(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.destinationName).toBe('Kempegowda Majestic');
    expect(decoded?.destination.latitude).toBeCloseTo(12.9767);
    expect(decoded?.radiusKm).toBe(4.0);
    expect(decoded?.transfer?.name).toBe('MG Road Interchange');
  });

  it('handles URL hash fragments during decoding', () => {
    const payload: RouteSyncPayload = {
      version: 1,
      destinationName: 'Dadar Station',
      destination: { latitude: 19.0178, longitude: 72.8478 },
      radiusKm: 2.5,
    };

    const token = encodeRouteForSync(payload);
    const hashUrl = `https://transitwake.app/sync#sync=${token}`;

    const decoded = decodeRouteFromSync(hashUrl);
    expect(decoded).not.toBeNull();
    expect(decoded?.destinationName).toBe('Dadar Station');
    expect(decoded?.radiusKm).toBe(2.5);
  });

  it('returns null for corrupted or invalid sync tokens', () => {
    expect(decodeRouteFromSync('')).toBeNull();
    expect(decodeRouteFromSync('not-a-valid-base64-json')).toBeNull();
    expect(decodeRouteFromSync('{}')).toBeNull();
  });
});
