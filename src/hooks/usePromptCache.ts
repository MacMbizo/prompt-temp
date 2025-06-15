
import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '@/hooks/usePrompts';

interface CacheEntry {
  data: Prompt[];
  timestamp: number;
  filters: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

export const usePromptCache = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCacheKey = (filters: Record<string, any>) => {
    return JSON.stringify(filters);
  };

  const getFromCache = useCallback((filters: Record<string, any>): Prompt[] | null => {
    const key = getCacheKey(filters);
    const entry = cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const setCache = useCallback((filters: Record<string, any>, data: Prompt[]) => {
    const key = getCacheKey(filters);
    cache.set(key, {
      data: [...data], // Clone to prevent mutations
      timestamp: Date.now(),
      filters: key
    });
  }, []);

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Array.from(cache.values());
    const validEntries = entries.filter(
      entry => Date.now() - entry.timestamp <= CACHE_DURATION
    );
    
    return {
      totalEntries: cache.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      memoryUsage: JSON.stringify(Array.from(cache.entries())).length
    };
  }, []);

  // Cleanup expired entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    getFromCache,
    setCache,
    clearCache,
    getCacheStats,
    isLoading,
    setIsLoading
  };
};
