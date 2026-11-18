import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const headerValues = new Map<string, string>();
vi.mock('next/headers', () => ({
  headers: async () => ({ get: (k: string) => headerValues.get(k) ?? null }),
  cookies: async () => ({ get: () => undefined }),
}));

let auth: typeof import('./admin-auth');
beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple');
  headerValues.clear();
  headerValues.set('x-real-ip', '203.0.113.7');
  auth = await import('./admin-auth');
});
afterEach(() => vi.unstubAllEnvs());

describe('sessions', () => {
  it('accepts a fresh session and rejects tampering', () => {
    const { value } = auth.newSession();
    expect(auth.validSession(value)).toBe(true);
    const [exp, mac] = value.split('.');
    expect(auth.validSession(`${Number(exp) + 1}.${mac}`)).toBe(false);   // extended expiry
    expect(auth.validSession(`${exp}.${mac.slice(0, -2)}xx`)).toBe(false); // forged mac
    expect(auth.validSession(undefined)).toBe(false);
    expect(auth.validSession('garbage')).toBe(false);
  });

  it('expires after 7 days', () => {
    const { value } = auth.newSession(Date.now() - 8 * 24 * 3600_000);
    expect(auth.validSession(value)).toBe(false);
  });

  it('is invalidated by changing the password', () => {
    const { value } = auth.newSession();
    vi.stubEnv('ADMIN_PASSWORD', 'a different long password');
    expect(auth.validSession(value)).toBe(false);
  });

  it('is never valid when no password is set', () => {
    const { value } = auth.newSession();
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(auth.adminEnabled()).toBe(false);
    expect(auth.validSession(value)).toBe(false);
  });
});

describe('login', () => {
  it('checks the password', async () => {
    expect(await auth.checkLogin('correct horse battery staple')).toBe('ok');
    expect(await auth.checkLogin('wrong')).toBe('wrong');
  });

  it('locks an IP out after 5 wrong passwords, even for the right one', async () => {
    for (let i = 0; i < 5; i++) expect(await auth.checkLogin('nope')).toBe('wrong');
    expect(await auth.checkLogin('correct horse battery staple')).toBe('throttled');

    headerValues.set('x-real-ip', '198.51.100.1'); // a different IP is unaffected
    expect(await auth.checkLogin('correct horse battery staple')).toBe('ok');
  });

  it('successful logins do not count toward the lockout', async () => {
    for (let i = 0; i < 10; i++) expect(await auth.checkLogin('correct horse battery staple')).toBe('ok');
  });

  it('flags short passwords', () => {
    expect(auth.weakPassword()).toBe(false);
    vi.stubEnv('ADMIN_PASSWORD', 'short');
    expect(auth.weakPassword()).toBe(true);
  });
});
