import { OfflineCacheStats, CachedSearchResult, NetworkStatusListener } from '../types/offline';

const STORAGE_KEY_QUERIES = 'transitwake_offline_queries_v1';
const STORAGE_KEY_TILES = 'transitwake_offline_tiles_v1';
const MAX_CACHED_QUERIES = 50;
const MAX_CACHED_TILES = 500;

class OfflineCacheService {
  private onlineStatus: boolean = true;
  private networkListeners: Set<NetworkStatusListener> = new Set();
  private cachedQueries: Map<string, CachedSearchResult> = new Map();
  private cachedTiles: Set<string> = new Set();
  private lastSyncTime: number | null = null;

  constructor() {
    this.initNetworkMonitoring();
    this.loadFromStorage();
  }

  private initNetworkMonitoring() {
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      this.onlineStatus = window.navigator.onLine ?? true;

      window.addEventListener('online', () => {
        this.setOnline(true);
      });

      window.addEventListener('offline', () => {
        this.setOnline(false);
      });
    }
  }

  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedQueries = window.localStorage.getItem(STORAGE_KEY_QUERIES);
        if (storedQueries) {
          const parsed: CachedSearchResult[] = JSON.parse(storedQueries);
          parsed.forEach((item) => {
            this.cachedQueries.set(this.normalizeQuery(item.query), item);
          });
        }

        const storedTiles = window.localStorage.getItem(STORAGE_KEY_TILES);
        if (storedTiles) {
          const parsedTiles: string[] = JSON.parse(storedTiles);
          parsedTiles.forEach((tile) => this.cachedTiles.add(tile));
        }
      }
    } catch {
      // Memory fallback if storage is restricted
    }
  }

  private persistStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const queryArray = Array.from(this.cachedQueries.values());
        window.localStorage.setItem(STORAGE_KEY_QUERIES, JSON.stringify(queryArray));

        const tileArray = Array.from(this.cachedTiles);
        window.localStorage.setItem(STORAGE_KEY_TILES, JSON.stringify(tileArray));
      }
    } catch {
      // Memory fallback
    }
  }

  public isOnline(): boolean {
    return this.onlineStatus;
  }

  public setOnline(status: boolean) {
    if (this.onlineStatus !== status) {
      this.onlineStatus = status;
      this.notifyNetworkListeners();
    }
  }

  public addNetworkListener(listener: NetworkStatusListener): () => void {
    this.networkListeners.add(listener);
    return () => {
      this.networkListeners.delete(listener);
    };
  }

  private notifyNetworkListeners() {
    this.networkListeners.forEach((listener) => {
      try {
        listener(this.onlineStatus);
      } catch {
        // Safe dispatch
      }
    });
  }

  public async cacheSearchResults(query: string, results: any[]): Promise<void> {
    if (!query || results.length === 0) return;

    const key = this.normalizeQuery(query);
    const now = Date.now();

    // LRU eviction if capacity exceeded
    if (this.cachedQueries.size >= MAX_CACHED_QUERIES && !this.cachedQueries.has(key)) {
      const oldestKey = this.cachedQueries.keys().next().value;
      if (oldestKey) {
        this.cachedQueries.delete(oldestKey);
      }
    }

    this.cachedQueries.set(key, {
      query,
      results: [...results],
      timestamp: now,
    });
    this.lastSyncTime = now;
    this.persistStorage();
  }

  public getCachedSearchResults(query: string): any[] | null {
    const key = this.normalizeQuery(query);
    const item = this.cachedQueries.get(key);
    return item ? [...item.results] : null;
  }

  public async cacheTile(tileUrl: string): Promise<void> {
    if (!tileUrl) return;

    if (this.cachedTiles.size >= MAX_CACHED_TILES && !this.cachedTiles.has(tileUrl)) {
      const oldestTile = this.cachedTiles.values().next().value;
      if (oldestTile) {
        this.cachedTiles.delete(oldestTile);
      }
    }

    this.cachedTiles.add(tileUrl);
    this.lastSyncTime = Date.now();
    this.persistStorage();
  }

  public isTileCached(tileUrl: string): boolean {
    return this.cachedTiles.has(tileUrl);
  }

  public getStats(): OfflineCacheStats {
    return {
      cachedTilesCount: this.cachedTiles.size,
      cachedQueriesCount: this.cachedQueries.size,
      lastSyncTimestamp: this.lastSyncTime,
      isOffline: !this.onlineStatus,
    };
  }

  public async clearCache(): Promise<void> {
    this.cachedQueries.clear();
    this.cachedTiles.clear();
    this.lastSyncTime = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY_QUERIES);
        window.localStorage.removeItem(STORAGE_KEY_TILES);
      }
    } catch {
      // Memory fallback
    }
  }
}

export const offlineCacheService = new OfflineCacheService();
