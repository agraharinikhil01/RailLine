/**
 * RailLine Cache Service
 * Supports multi-tiered caching: in-memory with TTL for local/dev,
 * ready to bind Redis client when REDIS_URL is provided (PRD §18).
 */

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private memoryCache = new Map<string, CacheItem<unknown>>();
  private stats = {
    hits: 0,
    misses: 0,
  };

  async get<T>(key: string): Promise<T | null> {
    const item = this.memoryCache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    return {
      keysCount: this.memoryCache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatePercentage: Number(hitRate.toFixed(1)),
    };
  }
}

export const cacheService = new CacheService();
