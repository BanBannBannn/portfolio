/**
 * Sliding-window rate limiter held in memory.
 *
 * Best effort only: each serverless instance has its own memory, and instances
 * come and go. It stops a single visitor (or a naive script) from hammering the
 * chat, which is the common case. The hard ceiling on cost is the monthly spend
 * limit set in the Anthropic Console, not this.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return function check(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);

    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - recent[0])) / 1000) };
    }

    recent.push(now);
    hits.set(key, recent);

    // Keep the map from growing without bound on a long-lived instance.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every(t => now - t >= windowMs)) hits.delete(k);
      }
    }
    return { ok: true };
  };
}
