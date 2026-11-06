import { offlineCacheService } from '../src/services/offlineCacheService';

describe('OfflineCacheService (Subway Tunnel Offline Mode)', () => {
  beforeEach(async () => {
    await offlineCacheService.clearCache();
    offlineCacheService.setOnline(true);
  });

  afterEach(async () => {
    await offlineCacheService.clearCache();
  });

  test('initializes with online status and zero cache count', () => {
    expect(offlineCacheService.isOnline()).toBe(true);
    const stats = offlineCacheService.getStats();
    expect(stats.isOffline).toBe(false);
    expect(stats.cachedTilesCount).toBe(0);
    expect(stats.cachedQueriesCount).toBe(0);
  });

  test('notifies listeners when network status transitions offline in subway tunnels', () => {
    const listener = jest.fn();
    const unsubscribe = offlineCacheService.addNetworkListener(listener);

    offlineCacheService.setOnline(false);
    expect(listener).toHaveBeenCalledWith(false);
    expect(offlineCacheService.isOnline()).toBe(false);

    offlineCacheService.setOnline(true);
    expect(listener).toHaveBeenCalledWith(true);

    unsubscribe();
    offlineCacheService.setOnline(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('caches and retrieves station search results offline with query normalization', async () => {
    const mockResults = [
      {
        id: 'osm-1',
        name: 'Kempegowda Majestic Metro Station',
        latitude: 12.9767,
        longitude: 77.5713,
      },
    ];

    await offlineCacheService.cacheSearchResults('Majestic Metro', mockResults);

    // Retrieve with exact query
    const cachedExact = offlineCacheService.getCachedSearchResults('Majestic Metro');
    expect(cachedExact).toEqual(mockResults);

    // Retrieve with normalized query (different casing and extra whitespace)
    const cachedNormalized = offlineCacheService.getCachedSearchResults('  majestic metro ');
    expect(cachedNormalized).toEqual(mockResults);

    // Non-cached query returns null
    const nonExistent = offlineCacheService.getCachedSearchResults('Indiranagar');
    expect(nonExistent).toBeNull();
  });

  test('tracks cached map tile URLs for subterranean navigation', async () => {
    const tile1 = 'https://basemaps.cartocdn.com/rastertiles/voyager/14/11723/7621.png';
    const tile2 = 'https://basemaps.cartocdn.com/rastertiles/voyager/14/11723/7622.png';

    expect(offlineCacheService.isTileCached(tile1)).toBe(false);

    await offlineCacheService.cacheTile(tile1);
    expect(offlineCacheService.isTileCached(tile1)).toBe(true);
    expect(offlineCacheService.isTileCached(tile2)).toBe(false);

    await offlineCacheService.cacheTile(tile2);
    expect(offlineCacheService.getStats().cachedTilesCount).toBe(2);
  });

  test('enforces cache limits with LRU eviction for station queries', async () => {
    // Fill cache past limit
    for (let i = 0; i < 55; i++) {
      await offlineCacheService.cacheSearchResults(`Stop ${i}`, [
        { id: `stop-${i}`, name: `Station ${i}`, latitude: 12.0 + i * 0.01, longitude: 77.0 },
      ]);
    }

    const stats = offlineCacheService.getStats();
    // Maximum query capacity capped at 50
    expect(stats.cachedQueriesCount).toBeLessThanOrEqual(50);

    // Most recent stop should be present
    expect(offlineCacheService.getCachedSearchResults('Stop 54')).not.toBeNull();
  });

  test('clearCache purges all stored tiles and search entries', async () => {
    await offlineCacheService.cacheSearchResults('MG Road', [
      { id: '1', name: 'MG Road', latitude: 12.975, longitude: 77.609 },
    ]);
    await offlineCacheService.cacheTile('https://tile.test/1/1/1.png');

    expect(offlineCacheService.getStats().cachedQueriesCount).toBe(1);
    expect(offlineCacheService.getStats().cachedTilesCount).toBe(1);

    await offlineCacheService.clearCache();

    expect(offlineCacheService.getStats().cachedQueriesCount).toBe(0);
    expect(offlineCacheService.getStats().cachedTilesCount).toBe(0);
    expect(offlineCacheService.getCachedSearchResults('MG Road')).toBeNull();
  });
});
