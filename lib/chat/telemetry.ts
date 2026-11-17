/**
 * One trace per chat request: outcome, tokens, estimated cost and timings.
 *
 * Every trace is printed as one JSON line (Vercel → Logs, filter "chat_trace"),
 * kept in memory for this instance, and, when shared storage is set up, added to
 * daily totals and a list of recent traces that the admin page reads.
 *
 * Visitor text is stored only when the admin turns on "Save questions and
 * answers", and never printed to the logs. IPs and device ids are stored as
 * short keyed hashes: enough to tell visitors apart, not to identify anyone.
 */
import { createHmac } from 'node:crypto';
import { hashToObject, hasStore, pipeline } from './store';

export type Outcome =
  | 'answered'      // the model replied
  | 'refused'       // the model declined (stop_reason "refusal")
  | 'error'         // the API call failed
  | 'aborted'       // the visitor closed the chat mid-answer
  | 'rate_limited'  // a 429 from our own limits
  | 'rejected'      // a malformed or forged request (4xx)
  | 'paused';       // chat disabled or over budget

export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };

export type Trace = {
  id: string;
  at: string;              // ISO time the request arrived
  outcome: Outcome;
  status: number;          // HTTP status we returned
  reason?: string;         // error code, limit scope, API error status…
  model?: string;
  effort?: string;
  question?: number;       // 1 for the first question of a chat, 2 for the next…
  chars?: number;          // length of the question
  device?: string;         // hashed
  ip?: string;             // hashed
  tokens?: Tokens;
  costUsd?: number;
  ttftMs?: number;         // request start → first answer text
  durationMs: number;      // request start → last byte
  stopReason?: string;
  requestId?: string;      // Anthropic request id, for support tickets
  q?: string;              // question, only with "Save questions and answers"
  a?: string;              // answer, likewise
};

// ---- cost --------------------------------------------------------------------------

/** USD per million tokens. Cache writes are 5-minute TTL. Check https://claude.com/pricing when changing models. */
export const PRICES: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};

export function costUsd(model: string, t: Tokens) {
  const p = PRICES[model];
  if (!p) return 0;
  return (t.input * p.input + t.output * p.output + t.cacheRead * p.cacheRead + t.cacheWrite * p.cacheWrite) / 1e6;
}

// ---- helpers -----------------------------------------------------------------------

export function pseudonym(kind: string, value: string) {
  const secret = process.env.ANTHROPIC_API_KEY ?? 'no-key';
  return createHmac('sha256', secret).update(`${kind}:${value}`).digest('base64url').slice(0, 10);
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);   // UTC
const monthKey = (d: Date) => d.toISOString().slice(0, 7);
const TRACE_LIST = 'chat:traces';
const KEEP_TRACES = 500;
const KEEP_DAYS_SEC = 400 * 24 * 3600;

type Totals = Record<string, number>;

function countsFor(t: Trace): Totals {
  const c: Totals = { requests: 1, [t.outcome]: 1 };
  if (t.tokens) {
    c.input = t.tokens.input;
    c.output = t.tokens.output;
    c.cache_read = t.tokens.cacheRead;
    c.cache_write = t.tokens.cacheWrite;
  }
  if (t.costUsd) c.cost_micro = Math.round(t.costUsd * 1e6);
  if (t.outcome === 'answered') {
    c.duration_ms = Math.round(t.durationMs);
    if (t.ttftMs !== undefined) {
      c.ttft_ms = Math.round(t.ttftMs);
      c.ttft_n = 1;
    }
  }
  return c;
}

// ---- in-memory fallback (per instance) ----------------------------------------------

const memory = {
  traces: [] as Trace[],
  days: new Map<string, Totals>(),
  months: new Map<string, number>(), // cost_micro
};

function addTotals(into: Totals, add: Totals) {
  for (const [k, v] of Object.entries(add)) into[k] = (into[k] ?? 0) + v;
}

function remember(t: Trace, counts: Totals) {
  memory.traces.unshift(t);
  memory.traces.length = Math.min(memory.traces.length, 200);
  const d = new Date(t.at);
  const day = memory.days.get(dayKey(d)) ?? {};
  addTotals(day, counts);
  memory.days.set(dayKey(d), day);
  if (memory.days.size > 40) memory.days.delete(memory.days.keys().next().value!);
  if (counts.cost_micro) memory.months.set(monthKey(d), (memory.months.get(monthKey(d)) ?? 0) + counts.cost_micro);
}

// ---- recording ----------------------------------------------------------------------

// A flood of rejected requests must not turn into a flood of storage writes:
// rate-limited requests are counted locally and written in batches.
let pendingLimited = 0;
let lastLimitedFlush = 0;
const LIMITED_FLUSH_MS = 30_000;

export async function recordTrace(t: Trace) {
  const { q, a, ...loggable } = t;
  void q;
  void a;
  console.log(JSON.stringify({ evt: 'chat_trace', ...loggable }));

  const counts = countsFor(t);
  remember(t, counts);
  if (t.costUsd) addSpend(t.costUsd);
  if (!hasStore()) return;

  if (t.outcome === 'rate_limited') {
    pendingLimited++;
    if (Date.now() - lastLimitedFlush < LIMITED_FLUSH_MS) return;
    counts.requests = pendingLimited;
    counts.rate_limited = pendingLimited;
  }
  // Fold limited requests seen since the last write into this one.
  if (t.outcome !== 'rate_limited' && pendingLimited > 0) {
    counts.requests += pendingLimited;
    counts.rate_limited = (counts.rate_limited ?? 0) + pendingLimited;
  }
  const flushed = pendingLimited;
  pendingLimited = 0;
  lastLimitedFlush = Date.now();

  const d = new Date(t.at);
  const day = `chat:d:${dayKey(d)}`;
  const month = `chat:m:${monthKey(d)}`;
  const cmds: (string | number)[][] = [
    ['LPUSH', TRACE_LIST, JSON.stringify(t)],
    ['LTRIM', TRACE_LIST, 0, KEEP_TRACES - 1],
    ...Object.entries(counts).map(([k, v]) => ['HINCRBY', day, k, v]),
    ['EXPIRE', day, KEEP_DAYS_SEC],
  ];
  if (counts.cost_micro) cmds.push(['HINCRBY', month, 'cost_micro', counts.cost_micro], ['EXPIRE', month, KEEP_DAYS_SEC]);
  if (!(await pipeline(cmds))) pendingLimited += flushed; // try again with the next write
}

// ---- spend, for the budget check -----------------------------------------------------

let spendCache: { at: number; day: string; today: number; month: number } | null = null;
const SPEND_TTL_MS = 10_000;

function addSpend(usd: number) {
  if (spendCache && spendCache.day === dayKey(new Date())) {
    spendCache.today += usd;
    spendCache.month += usd;
  }
}

/** Estimated spend today (UTC) and this month, in USD. Cached for a few seconds. */
export async function getSpend(): Promise<{ today: number; month: number }> {
  const now = new Date();
  if (spendCache && spendCache.day === dayKey(now) && Date.now() - spendCache.at < SPEND_TTL_MS) {
    return { today: spendCache.today, month: spendCache.month };
  }
  let today = (memory.days.get(dayKey(now))?.cost_micro ?? 0) / 1e6;
  let month = (memory.months.get(monthKey(now)) ?? 0) / 1e6;
  if (hasStore()) {
    const r = await pipeline([
      ['HGET', `chat:d:${dayKey(now)}`, 'cost_micro'],
      ['HGET', `chat:m:${monthKey(now)}`, 'cost_micro'],
    ]);
    if (r) {
      today = Number(r[0] ?? 0) / 1e6;
      month = Number(r[1] ?? 0) / 1e6;
    }
  }
  spendCache = { at: Date.now(), day: dayKey(now), today, month };
  return { today, month };
}

// ---- reading, for the admin page -----------------------------------------------------

export type DayRow = { day: string; t: Totals };

export async function readDashboard(days = 14): Promise<{
  source: 'store' | 'memory';
  days: DayRow[];
  month: number;
  traces: Trace[];
}> {
  const now = new Date();
  const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(now.getTime() - i * 864e5)));

  if (hasStore()) {
    const r = await pipeline([
      ...keys.map(k => ['HGETALL', `chat:d:${k}`]),
      ['HGET', `chat:m:${monthKey(now)}`, 'cost_micro'],
      ['LRANGE', TRACE_LIST, 0, KEEP_TRACES - 1],
    ]);
    if (r) {
      const rows = keys.map((day, i) => {
        const h = hashToObject(r[i]);
        return { day, t: Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Number(v)])) };
      });
      const traces = ((r[keys.length + 1] as string[] | null) ?? []).flatMap(s => {
        try {
          return [JSON.parse(s) as Trace];
        } catch {
          return [];
        }
      });
      return { source: 'store', days: rows, month: Number(r[keys.length] ?? 0) / 1e6, traces };
    }
  }
  return {
    source: 'memory',
    days: keys.map(day => ({ day, t: { ...(memory.days.get(day) ?? {}) } })),
    month: (memory.months.get(monthKey(now)) ?? 0) / 1e6,
    traces: [...memory.traces],
  };
}

export async function clearTraces() {
  memory.traces = [];
  if (hasStore()) await pipeline([['DEL', TRACE_LIST]]);
}

/** Test hook. */
export function resetTelemetry() {
  memory.traces = [];
  memory.days.clear();
  memory.months.clear();
  spendCache = null;
  pendingLimited = 0;
  lastLimitedFlush = 0;
}
