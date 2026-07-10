/**
 * @module lib/security/rateLimit
 *
 * Fixed-window per-key rate limiter. In-memory by design for a single demo
 * instance; a multi-replica deployment should back this with Redis/Upstash.
 * Keeps abusive clients from exhausting AI API quotas.
 */

/** Default maximum requests allowed per window. */
const DEFAULT_LIMIT = 20;

/** Default rate-limit window duration in milliseconds (1 minute). */
const DEFAULT_WINDOW_MS = 60_000;

/**
 * Internal bucket tracking request count and window expiry for a single key.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

/** In-memory store of all active rate-limit buckets, keyed by client identifier. */
const buckets = new Map<string, Bucket>();

/**
 * Result of a rate-limit check, indicating whether the request is allowed
 * and how many requests remain in the current window.
 */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}

/**
 * Checks and increments the rate-limit counter for a given key. Returns
 * whether the request is allowed, how many requests remain, and when the
 * window resets.
 *
 * @param key - Client identifier to rate-limit against (e.g. IP address).
 * @param limit - Maximum requests per window (defaults to 20).
 * @param windowMs - Window duration in milliseconds (defaults to 60 000).
 * @param now - Current timestamp in epoch milliseconds (injectable for testing).
 * @returns Rate-limit decision with remaining quota.
 */
export function rateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS,
  now: number = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/**
 * Clears all rate-limit buckets. Exposed exclusively for test isolation —
 * production code must never call this.
 */
export function resetRateLimits(): void {
  buckets.clear();
}
