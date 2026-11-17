import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('allows up to the limit, then rejects', () => {
    const rl = createRateLimiter(3, 60_000);
    for (let i = 0; i < 3; i++) {
      expect(rl.check('a')).toEqual({ ok: true });
      rl.record('a');
    }
    expect(rl.check('a').ok).toBe(false);
  });

  it('only counts what is recorded: check alone never uses quota', () => {
    const rl = createRateLimiter(1, 60_000);
    for (let i = 0; i < 10; i++) expect(rl.check('a').ok).toBe(true);
    rl.record('a');
    expect(rl.check('a').ok).toBe(false);
  });

  it('keeps keys independent', () => {
    const rl = createRateLimiter(1, 60_000);
    rl.record('a');
    expect(rl.check('a').ok).toBe(false);
    expect(rl.check('b').ok).toBe(true);
  });

  it('slides the window: the oldest hit expires first', () => {
    const rl = createRateLimiter(2, 10_000);
    rl.record('a');                 // t = 0
    vi.advanceTimersByTime(6_000);
    rl.record('a');                 // t = 6s
    expect(rl.check('a').ok).toBe(false);

    vi.advanceTimersByTime(4_000);  // t = 10s: first hit is out of the window
    expect(rl.check('a').ok).toBe(true);
    rl.record('a');
    expect(rl.check('a').ok).toBe(false);
  });

  it('reports when the next request will be allowed, rounded up to a whole second', () => {
    const rl = createRateLimiter(1, 60 * 60_000);
    rl.record('a');
    vi.advanceTimersByTime(30 * 60_000 + 500);
    expect(rl.check('a')).toEqual({ ok: false, retryAfterSec: 1800 });
  });

  it('never reports a wait below one second', () => {
    const rl = createRateLimiter(1, 1_000);
    rl.record('a');
    vi.advanceTimersByTime(999);
    expect(rl.check('a')).toEqual({ ok: false, retryAfterSec: 1 });
  });

  it('drops expired keys once the map gets large', () => {
    const rl = createRateLimiter(1, 1_000);
    for (let i = 0; i < 10_001; i++) rl.record(`old-${i}`);
    vi.advanceTimersByTime(2_000);
    rl.record('new'); // triggers the sweep
    // Expired keys are gone, so they are allowed again; the fresh one is not.
    expect(rl.check('old-0').ok).toBe(true);
    expect(rl.check('new').ok).toBe(false);
  });
});
