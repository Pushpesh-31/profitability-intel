/**
 * Simple In-Memory Cache for Serverless Functions
 *
 * Note: In serverless environments, this cache is ephemeral and per-instance.
 * It helps with warm invocations but won't persist across cold starts.
 * For production with heavy usage, consider upgrading to Vercel KV or Upstash Redis.
 */

import NodeCache from 'node-cache';

// Cache with 1 hour TTL, check for expired keys every 10 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Get cached data or fetch fresh data
 */
export async function getCachedOrFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  // Try to get from cache
  const cached = cache.get<T>(cacheKey);
  if (cached !== undefined) {
    return { data: cached, cached: true };
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  cache.set(cacheKey, data);

  return { data, cached: false };
}

/**
 * Set a value in the cache
 */
export function setCache<T>(key: string, value: T): void {
  cache.set(key, value);
}

/**
 * Get a value from the cache
 */
export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Check if a key exists in cache
 */
export function hasCache(key: string): boolean {
  return cache.has(key);
}

export default cache;
