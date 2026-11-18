/**
 * Chat settings. Each one has a built-in default, can be overridden by an env
 * var, and (when shared storage is set up) by the admin page at /admin.
 * Precedence: admin override > env var > default.
 *
 * The same schema drives validation, the env parsing and the admin form.
 */
import { command, hasStore, pipeline } from './store';

export const MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'] as const;
export const EFFORTS = ['low', 'medium', 'high'] as const;

type NumberField = { type: 'number'; min: number; max: number; step?: number };
type Field = { env: string; label: string; help: string; group: string } & (
  | NumberField
  | { type: 'boolean' }
  | { type: 'select'; options: readonly string[] }
);

export const FIELDS = {
  enabled: {
    env: 'CHAT_ENABLED', type: 'boolean', group: 'General', label: 'Chat enabled',
    help: 'Off: the chat shows contact details instead of answering. Nothing is sent to the API.',
  },
  model: {
    env: 'CHAT_MODEL', type: 'select', options: MODELS, group: 'General', label: 'Model',
    help: 'Haiku is the cheapest by far. Sonnet costs about 20x more, Opus about 40x.',
  },
  effort: {
    env: 'CHAT_EFFORT', type: 'select', options: EFFORTS, group: 'General', label: 'Effort',
    help: 'How hard the model thinks before answering. Thinking is billed as output tokens.',
  },
  logContent: {
    env: 'CHAT_LOG_CONTENT', type: 'boolean', group: 'General', label: 'Save questions and answers',
    help: 'Stores visitor questions and answers with each trace. The chat tells visitors when this is on.',
  },
  maxQuestions: {
    env: 'CHAT_MAX_QUESTIONS', type: 'number', min: 1, max: 20, group: 'Per conversation', label: 'Questions per chat',
    help: 'After this many, the chat shows contact details.',
  },
  maxQuestionChars: {
    env: 'CHAT_MAX_QUESTION_CHARS', type: 'number', min: 50, max: 1000, group: 'Per conversation', label: 'Max question length (characters)',
    help: '',
  },
  maxOutputTokens: {
    env: 'CHAT_MAX_OUTPUT_TOKENS', type: 'number', min: 256, max: 4096, group: 'Per conversation', label: 'Max answer tokens',
    help: 'Includes thinking. Answers that hit it end with "…".',
  },
  devicePerHour: { env: 'CHAT_DEVICE_PER_HOUR', type: 'number', min: 1, max: 1000, group: 'Rate limits', label: 'Per device, per hour', help: '' },
  devicePerDay: { env: 'CHAT_DEVICE_PER_DAY', type: 'number', min: 1, max: 5000, group: 'Rate limits', label: 'Per device, per day', help: '' },
  ipPerHour: {
    env: 'CHAT_IP_PER_HOUR', type: 'number', min: 1, max: 5000, group: 'Rate limits', label: 'Per IP, per hour',
    help: 'Keep above the device limit: offices and mobile carriers share IPs.',
  },
  ipPerDay: { env: 'CHAT_IP_PER_DAY', type: 'number', min: 1, max: 20000, group: 'Rate limits', label: 'Per IP, per day', help: '' },
  globalPerHour: {
    env: 'CHAT_GLOBAL_PER_HOUR', type: 'number', min: 1, max: 100000, group: 'Rate limits', label: 'Whole site, per hour',
    help: 'Counted per server instance.',
  },
  globalPerDay: { env: 'CHAT_GLOBAL_PER_DAY', type: 'number', min: 1, max: 500000, group: 'Rate limits', label: 'Whole site, per day', help: '' },
  dailyBudgetUsd: {
    env: 'CHAT_DAILY_BUDGET_USD', type: 'number', min: 0, max: 100, step: 0.01, group: 'Budget', label: 'Daily budget (USD)',
    help: 'When today\'s estimated spend reaches this, the chat pauses until midnight UTC. 0 = no daily cap.',
  },
  monthlyBudgetUsd: {
    env: 'CHAT_MONTHLY_BUDGET_USD', type: 'number', min: 0, max: 1000, step: 0.01, group: 'Budget', label: 'Monthly budget (USD)',
    help: 'Same, per calendar month. Also set a spend limit in the Anthropic Console: that one is exact.',
  },
} as const satisfies Record<string, Field>;

export type ChatConfig = {
  enabled: boolean;
  model: (typeof MODELS)[number];
  effort: (typeof EFFORTS)[number];
  logContent: boolean;
  maxQuestions: number;
  maxQuestionChars: number;
  maxOutputTokens: number;
  devicePerHour: number;
  devicePerDay: number;
  ipPerHour: number;
  ipPerDay: number;
  globalPerHour: number;
  globalPerDay: number;
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
};
export type ConfigKey = keyof ChatConfig;

export const DEFAULTS: ChatConfig = {
  enabled: true,
  model: 'claude-haiku-5-5',
  effort: 'low',
  logContent: false,
  maxQuestions: 6,
  maxQuestionChars: 300,
  maxOutputTokens: 1024,
  devicePerHour: 15,
  devicePerDay: 30,
  ipPerHour: 30,
  ipPerDay: 60,
  globalPerHour: 300,
  globalPerDay: 1500,
  dailyBudgetUsd: 0.5,
  monthlyBudgetUsd: 5,
};

/** Parses one value against its field; returns undefined when it isn't valid. */
export function parseValue<K extends ConfigKey>(key: K, raw: unknown): ChatConfig[K] | undefined {
  const f: Field = FIELDS[key];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (f.type === 'boolean') {
    if (typeof raw === 'boolean') return raw as ChatConfig[K];
    const s = String(raw).trim().toLowerCase();
    if (['1', 'true', 'on', 'yes'].includes(s)) return true as ChatConfig[K];
    if (['0', 'false', 'off', 'no'].includes(s)) return false as ChatConfig[K];
    return undefined;
  }
  if (f.type === 'select') {
    const s = String(raw).trim();
    return (f.options.includes(s) ? s : undefined) as ChatConfig[K] | undefined;
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return undefined;
  const clamped = Math.min(f.max, Math.max(f.min, n));
  return (('step' in f && f.step ? Math.round(clamped * 100) / 100 : Math.round(clamped)) as ChatConfig[K]);
}

/** Defaults with env vars applied. Invalid env values are ignored, with a log line. */
export function envConfig(): ChatConfig {
  const out = { ...DEFAULTS };
  for (const key of Object.keys(FIELDS) as ConfigKey[]) {
    const raw = process.env[FIELDS[key].env];
    if (raw === undefined || raw === '') continue;
    const v = parseValue(key, raw);
    if (v === undefined) console.warn(`[chat-config] ignoring invalid ${FIELDS[key].env}=${JSON.stringify(raw)}`);
    else (out as Record<ConfigKey, unknown>)[key] = v;
  }
  return out;
}

/** Keeps only known keys with valid values. */
export function sanitizeOverrides(raw: unknown): Partial<ChatConfig> {
  const out: Partial<ChatConfig> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const key of Object.keys(FIELDS) as ConfigKey[]) {
    if (!Object.hasOwn(raw, key)) continue; // own keys only, never inherited ones
    const v = parseValue(key, (raw as Record<string, unknown>)[key]);
    if (v !== undefined) (out as Record<ConfigKey, unknown>)[key] = v;
  }
  return out;
}

const KEY = 'chat:config';
const TTL_MS = 15_000; // how stale another instance's copy may be after an admin save
let cached: { at: number; overrides: Partial<ChatConfig> } | null = null;

export async function getOverrides(fresh = false): Promise<Partial<ChatConfig>> {
  if (!hasStore()) return {};
  if (!fresh && cached && Date.now() - cached.at < TTL_MS) return cached.overrides;
  const res = await pipeline([['GET', KEY]]);
  // null: the store is down, so keep the last good copy. [null]: no overrides saved.
  let overrides: Partial<ChatConfig> = cached?.overrides ?? {};
  if (res) {
    try {
      overrides = typeof res[0] === 'string' ? sanitizeOverrides(JSON.parse(res[0])) : {};
    } catch {
      overrides = {};
    }
  }
  cached = { at: Date.now(), overrides };
  return overrides;
}

export async function getConfig(): Promise<ChatConfig> {
  return { ...envConfig(), ...(await getOverrides()) };
}

/** Saves admin overrides; values equal to the env/default value are dropped. */
export async function saveOverrides(next: Partial<ChatConfig>): Promise<boolean> {
  const base = envConfig();
  const clean = sanitizeOverrides(next);
  for (const k of Object.keys(clean) as ConfigKey[]) if (clean[k] === base[k]) delete clean[k];
  const ok = (await command('SET', KEY, JSON.stringify(clean))) === 'OK';
  if (ok) cached = { at: Date.now(), overrides: clean };
  return ok;
}

export async function clearOverrides(): Promise<boolean> {
  const ok = (await command('DEL', KEY)) !== null;
  if (ok) cached = { at: Date.now(), overrides: {} };
  return ok;
}

/** Test hook: forget the cached overrides. */
export function resetConfigCache() {
  cached = null;
}
