import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startFakeUpstash } from '../../test/fake-upstash';
import {
  DEFAULTS, envConfig, getConfig, parseValue, resetConfigCache, sanitizeOverrides, saveOverrides, clearOverrides,
} from './config';

let store: Awaited<ReturnType<typeof startFakeUpstash>>;
beforeAll(async () => { store = await startFakeUpstash(); });
afterAll(() => store.close());

beforeEach(() => {
  store.reset();
  resetConfigCache();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const useStore = () => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', store.url);
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', store.token);
};

describe('parseValue', () => {
  it('parses booleans in the usual spellings', () => {
    for (const v of ['1', 'true', 'ON', 'yes']) expect(parseValue('enabled', v)).toBe(true);
    for (const v of ['0', 'false', 'off', 'No']) expect(parseValue('enabled', v)).toBe(false);
    expect(parseValue('enabled', 'maybe')).toBeUndefined();
  });

  it('only accepts listed options', () => {
    expect(parseValue('model', 'claude-sonnet-5-5')).toBe('claude-sonnet-5-5');
    expect(parseValue('model', 'gpt-5')).toBeUndefined();
  });

  it('clamps numbers into range and rounds them', () => {
    expect(parseValue('maxQuestions', '0')).toBe(1);
    expect(parseValue('maxQuestions', '999')).toBe(20);
    expect(parseValue('maxQuestions', '3.6')).toBe(4);
    expect(parseValue('dailyBudgetUsd', '0.123')).toBe(0.12);
    expect(parseValue('maxQuestions', 'abc')).toBeUndefined();
    expect(parseValue('maxQuestions', '')).toBeUndefined();
  });
});

describe('envConfig', () => {
  it('uses the defaults when no env vars are set', () => {
    expect(envConfig()).toEqual(DEFAULTS);
  });

  it('applies valid env vars and ignores invalid ones with a warning', () => {
    vi.stubEnv('CHAT_MAX_QUESTIONS', '4');
    vi.stubEnv('CHAT_ENABLED', 'false');
    vi.stubEnv('CHAT_MODEL', 'not-a-model');
    const c = envConfig();
    expect(c.maxQuestions).toBe(4);
    expect(c.enabled).toBe(false);
    expect(c.model).toBe(DEFAULTS.model);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('CHAT_MODEL'));
  });
});

describe('sanitizeOverrides', () => {
  it('keeps known, valid keys only', () => {
    expect(sanitizeOverrides({ maxQuestions: 3, model: 'nope', evil: 1, __proto__: { enabled: false } })).toEqual({ maxQuestions: 3 });
    expect(sanitizeOverrides('junk')).toEqual({});
    expect(sanitizeOverrides(null)).toEqual({});
  });
});

describe('overrides in the store', () => {
  it('without a store, config is env + defaults and nothing is saved', async () => {
    vi.stubEnv('CHAT_IP_PER_HOUR', '40');
    expect((await getConfig()).ipPerHour).toBe(40);
    expect(store.calls).toBe(0);
  });

  it('a saved override beats the env var, which beats the default', async () => {
    useStore();
    vi.stubEnv('CHAT_IP_PER_HOUR', '40');
    vi.stubEnv('CHAT_IP_PER_DAY', '80');
    expect(await saveOverrides({ ipPerHour: 50 })).toBe(true);
    const c = await getConfig();
    expect(c.ipPerHour).toBe(50);
    expect(c.ipPerDay).toBe(80);
    expect(c.devicePerHour).toBe(DEFAULTS.devicePerHour);
  });

  it('does not store values equal to the env/default value', async () => {
    useStore();
    await saveOverrides({ ...DEFAULTS, maxQuestions: 3 });
    expect(JSON.parse(store.db.get('chat:config') as string)).toEqual({ maxQuestions: 3 });
  });

  it('caches overrides for 15 seconds', async () => {
    useStore();
    await getConfig();
    const calls = store.calls;
    await getConfig();
    expect(store.calls).toBe(calls);
  });

  it('keeps the last good overrides when the store goes down', async () => {
    useStore();
    await saveOverrides({ maxQuestions: 3 });
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(Date.now() + 60_000); // past the cache
      store.setDown(true);
      expect((await getConfig()).maxQuestions).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores a corrupted stored value', async () => {
    useStore();
    store.db.set('chat:config', '{not json');
    expect(await getConfig()).toEqual(DEFAULTS);
  });

  it('clearing overrides goes back to env + defaults', async () => {
    useStore();
    await saveOverrides({ maxQuestions: 3 });
    expect(await clearOverrides()).toBe(true);
    expect((await getConfig()).maxQuestions).toBe(DEFAULTS.maxQuestions);
  });
});
