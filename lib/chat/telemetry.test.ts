import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startFakeUpstash } from '../../test/fake-upstash';
import { costUsd, getSpend, readDashboard, recordTrace, resetTelemetry, type Trace } from './telemetry';

let store: Awaited<ReturnType<typeof startFakeUpstash>>;
beforeAll(async () => { store = await startFakeUpstash(); });
afterAll(() => store.close());

let logs: string[];
beforeEach(() => {
  store.reset();
  resetTelemetry();
  logs = [];
  vi.spyOn(console, 'log').mockImplementation((s: string) => void logs.push(s));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const useStore = () => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', store.url);
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', store.token);
};

let n = 0;
function trace(over: Partial<Trace> = {}): Trace {
  return {
    id: `t${n++}`,
    at: new Date().toISOString(),
    outcome: 'answered',
    status: 200,
    model: 'claude-haiku-5-5',
    tokens: { input: 30, output: 120, cacheRead: 2_000, cacheWrite: 0 },
    costUsd: costUsd('claude-haiku-5-5', { input: 30, output: 120, cacheRead: 2_000, cacheWrite: 0 }),
    ttftMs: 400,
    durationMs: 1_500,
    ...over,
  };
}

describe('costUsd', () => {
  it('prices each token kind for Haiku 5.5', () => {
    // 1M of each: $0.10 input + $0.50 output + $0.01 cache read + $0.125 cache write
    expect(costUsd('claude-haiku-5-5', { input: 1e6, output: 1e6, cacheRead: 1e6, cacheWrite: 1e6 })).toBeCloseTo(0.735, 6);
  });

  it('returns 0 for an unknown model rather than guessing', () => {
    expect(costUsd('mystery', { input: 1e6, output: 1e6, cacheRead: 0, cacheWrite: 0 })).toBe(0);
  });
});

describe('without a store', () => {
  it('prints one JSON line per trace, never the visitor text', async () => {
    await recordTrace(trace({ q: 'secret question', a: 'secret answer' }));
    expect(logs).toHaveLength(1);
    const line = JSON.parse(logs[0]);
    expect(line).toMatchObject({ evt: 'chat_trace', outcome: 'answered', ttftMs: 400 });
    expect(logs[0]).not.toContain('secret');
  });

  it('keeps totals and recent traces in memory', async () => {
    await recordTrace(trace());
    await recordTrace(trace({ outcome: 'error', tokens: undefined, costUsd: undefined }));
    const d = await readDashboard(1);
    expect(d.source).toBe('memory');
    expect(d.traces).toHaveLength(2);
    expect(d.days[0].t).toMatchObject({ requests: 2, answered: 1, error: 1, output: 120, cache_read: 2_000, ttft_n: 1 });
  });

  it('tracks spend for the budget check', async () => {
    await recordTrace(trace({ costUsd: 0.25 }));
    await recordTrace(trace({ costUsd: 0.25 }));
    expect(await getSpend()).toEqual({ today: 0.5, month: 0.5 });
  });
});

describe('with a store', () => {
  it('writes the trace and daily totals in one round trip', async () => {
    useStore();
    await recordTrace(trace({ q: 'kept in the store only' }));
    expect(store.calls).toBe(1);
    const d = await readDashboard(1);
    expect(d.source).toBe('store');
    expect(d.traces[0].q).toBe('kept in the store only');
    expect(d.days[0].t).toMatchObject({ requests: 1, answered: 1, input: 30, output: 120 });
    expect(d.month).toBeCloseTo(trace().costUsd!, 6);
  });

  it('keeps only the most recent 500 traces', async () => {
    useStore();
    for (let i = 0; i < 505; i++) await recordTrace(trace());
    expect((store.db.get('chat:traces') as string[]).length).toBe(500);
  });

  it('reads spend from the store, so every instance sees the same budget', async () => {
    useStore();
    store.db.set(`chat:d:${new Date().toISOString().slice(0, 10)}`, new Map([['cost_micro', '1200000']]));
    store.db.set(`chat:m:${new Date().toISOString().slice(0, 7)}`, new Map([['cost_micro', '3400000']]));
    expect(await getSpend()).toEqual({ today: 1.2, month: 3.4 });
  });

  it('batches rate-limited requests so a flood is not a flood of writes', async () => {
    useStore();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2026-03-01T10:00:00Z'));
    const limited = () => trace({ outcome: 'rate_limited', status: 429, tokens: undefined, costUsd: undefined, at: new Date().toISOString() });

    await recordTrace(limited());              // first one is written
    for (let i = 0; i < 50; i++) await recordTrace(limited()); // held back
    expect(store.calls).toBe(1);

    await recordTrace(trace({ at: new Date().toISOString() })); // folded into the next write
    expect(store.calls).toBe(2);
    const d = await readDashboard(1);
    expect(d.days[0].t).toMatchObject({ requests: 52, rate_limited: 51, answered: 1 });
  });

  it('never throws when the store is down', async () => {
    useStore();
    store.setDown(true);
    await expect(recordTrace(trace())).resolves.toBeUndefined();
    expect((await readDashboard(1)).source).toBe('memory');
  });
});
