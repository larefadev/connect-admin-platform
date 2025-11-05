import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live en milisegundos
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 30 * 60 * 1000; // 30 minutos por defecto

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

export const useQueryCache = () => {
  const cacheRef = useRef(queryCache);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    return cacheRef.current.get<T>(key);
  }, []);

  const setCachedData = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    cacheRef.current.set(key, data, ttl);
  }, []);

  const hasCachedData = useCallback((key: string): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const invalidateCache = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  const invalidatePattern = useCallback((pattern: string): void => {
    cacheRef.current.invalidatePattern(pattern);
  }, []);

  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return {
    getCachedData,
    setCachedData,
    hasCachedData,
    invalidateCache,
    invalidatePattern,
    clearCache
  };
};
