/**
 * Optional shared storage: a Redis database reached over Upstash's REST API
 * (free tier is plenty for a portfolio). It holds the admin's config overrides,
 * daily usage totals and the most recent traces, so they survive deploys and are
 * shared by every serverless instance.
 *
 * Without it everything still works: config comes from env vars and telemetry is
 * kept in memory per instance (and always printed to the logs).
 *
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or the KV_REST_API_URL +
 * KV_REST_API_TOKEN pair that Vercel's Upstash integration sets.
 */

type Command = (string | number)[];

function credentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

export function hasStore() {
  return credentials() !== null;
}

/**
 * Runs commands in one round trip. Returns null when there is no store or it
 * fails: callers treat storage as best effort and never fail a visitor's request
 * because of it.
 */
export async function pipeline(commands: Command[]): Promise<unknown[] | null> {
  const c = credentials();
  if (!c || commands.length === 0) return null;
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      cache: 'no-store',
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    const failed = out.find(r => r.error);
    if (failed) throw new Error(failed.error);
    return out.map(r => r.result);
  } catch (err) {
    console.error('[chat-store]', err instanceof Error ? err.message : 'request failed');
    return null;
  }
}

export async function command(...cmd: Command): Promise<unknown> {
  return (await pipeline([cmd]))?.[0] ?? null;
}

/** HGETALL comes back as a flat [field, value, ...] array. */
export function hashToObject(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(raw)) for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1]);
  return out;
}
