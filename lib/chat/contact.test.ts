import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startFakeUpstash } from '../../test/fake-upstash';
import {
  CONTACT_TOOL, LIMITS, checkSendLimits, claimNonce, recordSend, releaseNonce, renderMail, resetContactState,
  signDraft, validateDraft, verifyDraft, type Draft,
} from './contact';

let store: Awaited<ReturnType<typeof startFakeUpstash>>;
beforeAll(async () => { store = await startFakeUpstash(); });
afterAll(() => store.close());
beforeEach(() => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
  store.reset();
  resetContactState();
});
afterEach(() => vi.unstubAllEnvs());

const input = (over: Record<string, unknown> = {}) => ({
  visitor_name: 'Linh Tran',
  visitor_email: 'linh@company.example',
  topic: 'job_opportunity',
  message: 'Hi Bân, we have a backend role in HCMC. Free for a call next week?',
  ...over,
});
const draft: Draft = { name: 'Linh Tran', email: 'linh@company.example', topic: 'job_opportunity', message: 'Hello' };

describe('tool definition', () => {
  it('has no field for the recipient: the model cannot choose who gets the mail', () => {
    const props = Object.keys((CONTACT_TOOL.function.parameters as { properties: object }).properties);
    expect(props.sort()).toEqual(['message', 'topic', 'visitor_email', 'visitor_name']);
    expect(CONTACT_TOOL.function.parameters).toMatchObject({ additionalProperties: false });
    expect(CONTACT_TOOL.type).toBe('function');
  });
});

describe('validateDraft', () => {
  it('accepts a normal draft and normalises it', () => {
    const v = validateDraft(input({ visitor_email: '  Linh@Company.Example ', message: 'line 1\r\nline 2\n\n\n\nline 3' }));
    expect(v).toEqual({ ok: true, draft: { name: 'Linh Tran', email: 'linh@company.example', topic: 'job_opportunity', message: 'line 1\nline 2\n\nline 3' } });
  });

  it.each([
    ['an extra "to" field (prompt injection)', input({ to: 'attacker@evil.example' }), /Unknown field.*to/],
    ['a cc field', input({ cc: 'x@y.example' }), /Unknown field/],
    ['a missing email', input({ visitor_email: '' }), /missing/],
    ['an invented-looking non-email', input({ visitor_email: 'not an email' }), /not a valid email/],
    ['header injection in the email', input({ visitor_email: 'a@b.example\r\nBcc: victim@x.example' }), /not a valid email/],
    ['an email with a display name', input({ visitor_email: 'Bob <bob@x.example>' }), /not a valid email/],
    ['a 255-character email', input({ visitor_email: `${'a'.repeat(50)}@${'b'.repeat(60)}.${'c'.repeat(60)}.${'d'.repeat(60)}.${'e'.repeat(21)}` }), /not a valid email/],
    ['a local part over 64 characters', input({ visitor_email: `${'a'.repeat(65)}@x.example` }), /not a valid email/],
    ['an unknown topic', input({ topic: 'phishing' }), /topic must be/],
    ['an empty message', input({ message: '   ' }), /empty/],
    ['an over-long message', input({ message: 'x'.repeat(LIMITS.message + 1) }), /longer than/],
    ['an over-long name', input({ visitor_name: 'n'.repeat(LIMITS.name + 1) }), /longer than/],
    ['a non-string field', input({ message: ['array'] }), /must be a string/],
    ['a non-object', 'send it', /object/],
    ['an array', [input()], /object/],
  ])('rejects %s', (_, value, error) => {
    const v = validateDraft(value);
    expect(v.ok).toBe(false);
    expect(!v.ok && v.error).toMatch(error);
  });

  it('flattens line breaks in the name so it can never become a mail header', () => {
    const v = validateDraft(input({ visitor_name: 'Eve\r\nBcc: victim@x.example' }));
    expect(v.ok && v.draft.name).toBe('Eve Bcc: victim@x.example');
  });

  it('drops control characters from the message but keeps line breaks', () => {
    const v = validateDraft(input({ message: 'a\u0000b\u001ec\u001dd\ne' }));
    expect(v.ok && v.draft.message).toBe('abcd\ne');
  });
});

describe('draft tokens', () => {
  it('verify on the same device', () => {
    const t = signDraft(draft, 'device-a');
    const v = verifyDraft(t, 'device-a');
    expect(v.ok && v.draft).toEqual(draft);
  });

  it('IDOR: a valid token is refused from another device, or with no device', () => {
    const t = signDraft(draft, 'device-a');
    expect(verifyDraft(t, 'device-b')).toEqual({ ok: false, status: 403, error: 'wrong_device' });
    expect(verifyDraft(t, null)).toEqual({ ok: false, status: 403, error: 'wrong_device' });
  });

  it('refuses any change to the draft, including the device it is bound to', () => {
    const t = signDraft(draft, 'device-a');
    const [body, mac] = t.split('.');
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    for (const change of [
      { ...p, d: { ...p.d, email: 'attacker@evil.example' } },
      { ...p, d: { ...p.d, message: 'Different text' } },
      { ...p, dev: 'device-b' },
      { ...p, exp: p.exp + 1e9 },
    ]) {
      const forged = `${Buffer.from(JSON.stringify(change)).toString('base64url')}.${mac}`;
      expect(verifyDraft(forged, change.dev).ok).toBe(false);
    }
  });

  it('expires after 30 minutes', () => {
    const t = signDraft(draft, 'device-a', Date.now() - 31 * 60_000);
    expect(verifyDraft(t, 'device-a')).toEqual({ ok: false, status: 400, error: 'expired' });
  });

  it.each([undefined, 42, '', 'abc', 'a.b.c', `${'x'.repeat(5000)}.y`])('rejects malformed token %#', t => {
    expect(verifyDraft(t, 'device-a').ok).toBe(false);
  });

  it('a token signed with another key does not verify', () => {
    const t = signDraft(draft, 'device-a');
    vi.stubEnv('OPENROUTER_API_KEY', 'rotated-key');
    expect(verifyDraft(t, 'device-a').ok).toBe(false);
  });
});

describe('single use', () => {
  it('a draft can be claimed once (in memory)', async () => {
    expect(await claimNonce('n1')).toBe(true);
    expect(await claimNonce('n1')).toBe(false);
    await releaseNonce('n1');
    expect(await claimNonce('n1')).toBe(true);
  });

  it('a draft can be claimed once across instances (shared store)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', store.url);
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', store.token);
    expect(await claimNonce('n2')).toBe(true);
    resetContactState(); // another instance: no local memory of n2
    expect(await claimNonce('n2')).toBe(false);
  });
});

describe('send limits', () => {
  it('2 per device and 3 per IP per day', async () => {
    await recordSend('d1', 'ip1');
    await recordSend('d1', 'ip1');
    expect(await checkSendLimits('d1', 'ip1', 20)).toMatchObject({ ok: false, scope: 'device' });
    expect(await checkSendLimits('d2', 'ip1', 20)).toEqual({ ok: true });
    await recordSend('d2', 'ip1');
    expect(await checkSendLimits('d3', 'ip1', 20)).toMatchObject({ ok: false, scope: 'ip' });
  });

  it('a daily cap for the whole site, shared through the store', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', store.url);
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', store.token);
    store.db.set(`chat:mail:${new Date().toISOString().slice(0, 10)}`, '5');
    expect(await checkSendLimits('fresh', 'fresh-ip', 5)).toMatchObject({ ok: false, scope: 'all' });
    expect(await checkSendLimits('fresh', 'fresh-ip', 6)).toEqual({ ok: true });
  });
});

describe('renderMail', () => {
  it('escapes HTML and keeps the subject on one line', () => {
    const m = renderMail(
      { name: '<b>Eve</b>', email: 'eve@x.example', topic: 'other', message: '<script>alert(1)</script><img src=x onerror=alert(1)>' },
      { device: 'abc', sentAt: new Date('2026-01-01T00:00:00Z') },
    );
    expect(m.html).not.toMatch(/<script|<img|<b>Eve/);
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.subject).toBe('[Portfolio] Other from <b>Eve</b>');
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.text).toContain('<script>alert(1)</script>'); // plain text is not HTML
  });
});
