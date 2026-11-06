export interface OfflineCacheStats {
  cachedTilesCount: number;
  cachedQueriesCount: number;
  lastSyncTimestamp: number | null;
  isOffline: boolean;
}

export interface CachedSearchResult {
  query: string;
  results: any[];
  timestamp: number;
}

export type NetworkStatusListener = (isOnline: boolean) => void;
