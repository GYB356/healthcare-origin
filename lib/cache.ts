import NodeCache from 'node-cache';

// Initialize cache with TTL of 5 minutes by default
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
  maxKeys: 1000, // Maximum number of keys in cache
});

/**
 * Cache middleware for API routes
 * @param key - Cache key or function to generate cache key from request
 * @param ttl - Time to live in seconds (optional, defaults to 5 minutes)
 */
export const withCache = <T>(
  key: string | ((req: any) => string),
  ttl?: number
) => {
  return {
    get: (req: any): T | undefined => {
      const cacheKey = typeof key === 'function' ? key(req) : key;
      return cache.get<T>(cacheKey);
    },
    set: (req: any, data: T): void => {
      const cacheKey = typeof key === 'function' ? key(req) : key;
      cache.set(cacheKey, data, ttl || undefined);
    },
    invalidate: (req: any): void => {
      const cacheKey = typeof key === 'function' ? key(req) : key;
      cache.del(cacheKey);
    },
  };
};

/**
 * Generate cache key from request path and query parameters
 */
export const generateCacheKey = (req: { url?: string; query?: Record<string, any> }): string => {
  const path = req.url?.split('?')[0] || '';
  const query = req.query ? new URLSearchParams(req.query as Record<string, string>).toString() : '';
  return `${path}?${query}`;
};

/**
 * Clear all cache or cache keys matching a pattern
 */
export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.flushAll();
    return;
  }

  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

/**
 * Memoize a function with cache
 */
export const memoize = <T, U extends any[]>(
  fn: (...args: U) => Promise<T>,
  keyFn: (...args: U) => string,
  ttl?: number
): ((...args: U) => Promise<T>) => {
  return async (...args: U): Promise<T> => {
    const key = keyFn(...args);
    const cached = cache.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = await fn(...args);
    cache.set(key, result, ttl || undefined);
    
    return result;
  };
}; 