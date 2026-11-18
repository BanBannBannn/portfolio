/**
 * Sliding-window rate limiter held in memory.
 *
 * `check` and `record` are separate so a request can be tested against several
 * limits and only counted once it has passed all of them.
 *
 * Best effort only: each serverless instance has its own memory. It stops a
 * single visitor or a naive script, which is the common case. The hard ceiling
 * on cost is the monthly spend limit set in the Anthropic Console.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  const recent = (key: string, now: number) => {
    const r = (hits.get(key) ?? []).filter(t => now - t < windowMs);
    if (r.length) hits.set(key, r);
    else hits.delete(key);
    return r;
  };

  return {
    check(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
      const now = Date.now();
      const r = recent(key, now);
      return r.length >= limit
        ? { ok: false, retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - r[0])) / 1000)) }
        : { ok: true };
    },

    record(key: string) {
      const now = Date.now();
      const r = recent(key, now);
      r.push(now);
      hits.set(key, r);

      // Keep the map from growing without bound on a long-lived instance.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) {
          if (v.every(t => now - t >= windowMs)) hits.delete(k);
        }
      }
    },
  };
}
