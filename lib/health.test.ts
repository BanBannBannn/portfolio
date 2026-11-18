import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAll, isUp } from './health';

const ok = (status: number) => new Response(null, { status });

afterEach(() => vi.unstubAllGlobals());

describe('isUp', () => {
  it('is up on a 2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(200)));
    expect(await isUp('https://a.test/')).toBe(true);
  });

  it('is down on a 4xx or 5xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(404)));
    expect(await isUp('https://a.test/')).toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(503)));
    expect(await isUp('https://a.test/')).toBe(false);
  });

  it('is down when the request throws (DNS, timeout)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));
    expect(await isUp('https://a.test/')).toBe(false);
  });

  it('retries once, so one dropped request is not enough to go offline', async () => {
    const f = vi.fn().mockRejectedValueOnce(new Error('blip')).mockResolvedValueOnce(ok(200));
    vi.stubGlobal('fetch', f);
    expect(await isUp('https://a.test/')).toBe(true);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('gives up after the retry', async () => {
    const f = vi.fn().mockResolvedValue(ok(500));
    vi.stubGlobal('fetch', f);
    expect(await isUp('https://a.test/')).toBe(false);
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe('checkAll', () => {
  it('maps each URL to its own result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => (url.includes('dead') ? ok(502) : ok(200))),
    );
    expect(await checkAll(['https://alive.test/', 'https://dead.test/'])).toEqual({
      'https://alive.test/': true,
      'https://dead.test/': false,
    });
  });
});
