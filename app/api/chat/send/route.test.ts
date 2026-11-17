/**
 * POST /api/chat/send against a stand-in for Resend's API. Drafts are made the
 * way the chat route makes them (signDraft, bound to a device cookie).
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Sent = { headers: http.IncomingHttpHeaders; body: Record<string, unknown> };
let sent: Sent[] = [];
let resendStatus = 200;
const resend = http.createServer((req, res) => {
  let raw = '';
  req.on('data', c => (raw += c));
  req.on('end', () => {
    if (resendStatus !== 200) {
      res.writeHead(resendStatus, { 'content-type': 'application/json' });
      return res.end('{"name":"validation_error","message":"nope"}');
    }
    sent.push({ headers: req.headers, body: JSON.parse(raw) });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: `email_${sent.length}` }));
  });
});

beforeAll(async () => {
  await new Promise<void>(r => resend.listen(0, '127.0.0.1', r));
});
afterAll(() => new Promise<void>(r => resend.close(() => r())));

let POST: (req: Request) => Promise<Response>;
let contact: typeof import('../../../../lib/chat/contact');
let security: typeof import('../../../../lib/chat/security');
let telemetry: typeof import('../../../../lib/chat/telemetry');

beforeEach(async () => {
  sent = [];
  resendStatus = 200;
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  vi.stubEnv('RESEND_API_KEY', 're_test');
  vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
  vi.stubEnv('RESEND_API_URL', `http://127.0.0.1:${(resend.address() as AddressInfo).port}/emails`);
  vi.resetModules();
  ({ POST } = await import('./route'));
  contact = await import('../../../../lib/chat/contact');
  security = await import('../../../../lib/chat/security');
  telemetry = await import('../../../../lib/chat/telemetry');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const draft = { name: 'Linh', email: 'linh@company.example', topic: 'job_opportunity' as const, message: 'We have a role for you.' };

let n = 0;
/** A device with its signed cookie, as the chat route would have issued it. */
function newDevice() {
  const id = `device-${n++}`;
  return { id, cookie: `chat_device=${id}.${security.hmac('device', id)}` };
}

function send(body: unknown, opts: { cookie?: string; ip?: string; origin?: string; contentType?: string } = {}) {
  const headers: Record<string, string> = {
    host: 'localhost',
    'content-type': opts.contentType ?? 'application/json',
    'x-real-ip': opts.ip ?? `10.9.${n >> 8}.${n++ & 255}`,
  };
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.origin) headers.origin = opts.origin;
  return POST(new Request('http://localhost/api/chat/send', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));
}

async function lastTrace() {
  await new Promise(r => setTimeout(r, 10));
  return (await telemetry.readDashboard(1)).traces[0];
}

describe('sending a confirmed draft', () => {
  it('sends to the fixed recipient, replying to the visitor', async () => {
    const dev = newDevice();
    const res = await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].body).toMatchObject({
      to: ['owner@example.com'],
      reply_to: 'linh@company.example',
      from: 'Portfolio chat <onboarding@resend.dev>',
      subject: '[Portfolio] Job opportunity from Linh',
    });
    expect(sent[0].headers.authorization).toBe('Bearer re_test');
    expect(sent[0].headers['idempotency-key']).toMatch(/^portfolio-/);
    expect(await lastTrace()).toMatchObject({ outcome: 'mail_sent', requestId: 'email_1', tools: ['send_mail'] });
  });

  it('is single use: a replay gets 409 and nothing is sent twice', async () => {
    const dev = newDevice();
    const token = contact.signDraft(draft, dev.id);
    expect((await send({ token }, { cookie: dev.cookie })).status).toBe(200);
    const again = await send({ token }, { cookie: dev.cookie });
    expect(again.status).toBe(409);
    expect(sent).toHaveLength(1);
  });

  it('a replay after the device limit is reached still says already_sent, not rate_limited', async () => {
    const dev = newDevice();
    const first = contact.signDraft(draft, dev.id);
    expect((await send({ token: first }, { cookie: dev.cookie })).status).toBe(200);
    expect((await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).status).toBe(200);
    expect((await send({ token: first }, { cookie: dev.cookie })).status).toBe(409);
    expect(sent).toHaveLength(2);
  });

  it('two simultaneous clicks send once', async () => {
    const dev = newDevice();
    const token = contact.signDraft(draft, dev.id);
    const results = await Promise.all([send({ token }, { cookie: dev.cookie }), send({ token }, { cookie: dev.cookie })]);
    expect(results.map(r => r.status).sort()).toEqual([200, 409]);
    expect(sent).toHaveLength(1);
  });
});

describe('access control (IDOR)', () => {
  it("refuses someone else's draft, even with a valid signature", async () => {
    const victim = newDevice();
    const attacker = newDevice();
    const token = contact.signDraft(draft, victim.id);
    const res = await send({ token }, { cookie: attacker.cookie });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'wrong_device' });
    expect(sent).toHaveLength(0);
  });

  it('refuses without a device cookie, or with a forged one', async () => {
    const victim = newDevice();
    const token = contact.signDraft(draft, victim.id);
    expect((await send({ token })).status).toBe(403);
    expect((await send({ token }, { cookie: `chat_device=${victim.id}.forged` })).status).toBe(403);
    expect(sent).toHaveLength(0);
  });

  it('refuses a tampered draft (changed email)', async () => {
    const dev = newDevice();
    const [body, mac] = contact.signDraft(draft, dev.id).split('.');
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    p.d.email = 'attacker@evil.example';
    const res = await send({ token: `${Buffer.from(JSON.stringify(p)).toString('base64url')}.${mac}` }, { cookie: dev.cookie });
    expect(res.status).toBe(400);
    expect(sent).toHaveLength(0);
  });

  it('ignores any recipient in the request body', async () => {
    const dev = newDevice();
    await send({ token: contact.signDraft(draft, dev.id), to: 'victim@x.example', cc: 'x@y.example' }, { cookie: dev.cookie });
    expect(sent[0].body.to).toEqual(['owner@example.com']);
    expect(sent[0].body).not.toHaveProperty('cc');
  });

  it('refuses an expired draft', async () => {
    const dev = newDevice();
    const res = await send({ token: contact.signDraft(draft, dev.id, Date.now() - 31 * 60_000) }, { cookie: dev.cookie });
    expect(await res.json()).toEqual({ error: 'expired' });
  });
});

describe('request checks', () => {
  it('rejects other origins and non-JSON bodies', async () => {
    const dev = newDevice();
    const token = contact.signDraft(draft, dev.id);
    expect((await send({ token }, { cookie: dev.cookie, origin: 'https://evil.example' })).status).toBe(403);
    expect((await send({ token }, { cookie: dev.cookie, contentType: 'text/plain' })).status).toBe(415);
    expect(sent).toHaveLength(0);
  });

  it('caps the body size and rejects junk', async () => {
    const dev = newDevice();
    expect((await send({ token: 'x'.repeat(10_000) }, { cookie: dev.cookie })).status).toBe(413);
    expect((await send('{nope', { cookie: dev.cookie })).status).toBe(400);
    expect((await send({ token: 123 }, { cookie: dev.cookie })).status).toBe(400);
  });

  it('is unavailable without mail settings', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const dev = newDevice();
    expect((await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).status).toBe(503);
  });

  it('is off when the admin turns the tool or the chat off', async () => {
    vi.stubEnv('CHAT_CONTACT_TOOL', 'false');
    const dev = newDevice();
    expect(await (await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).json()).toEqual({ error: 'paused' });
    vi.stubEnv('CHAT_CONTACT_TOOL', 'true');
    vi.stubEnv('CHAT_ENABLED', 'false');
    expect((await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).status).toBe(503);
    expect(sent).toHaveLength(0);
  });
});

describe('limits and failures', () => {
  it('2 messages per device per day', async () => {
    const dev = newDevice();
    for (let i = 0; i < 2; i++) expect((await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).status).toBe(200);
    const res = await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie });
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ error: 'rate_limited', scope: 'device' });
    expect(sent).toHaveLength(2);
  });

  it('3 messages per IP per day, whatever the device', async () => {
    const ip = '10.77.0.1';
    for (let i = 0; i < 3; i++) {
      const d = newDevice();
      expect((await send({ token: contact.signDraft(draft, d.id) }, { cookie: d.cookie, ip })).status).toBe(200);
    }
    const d = newDevice();
    expect((await send({ token: contact.signDraft(draft, d.id) }, { cookie: d.cookie, ip })).status).toBe(429);
  });

  it('the daily cap for the whole site comes from the config', async () => {
    vi.stubEnv('CHAT_MAIL_PER_DAY', '1');
    const a = newDevice();
    const b = newDevice();
    expect((await send({ token: contact.signDraft(draft, a.id) }, { cookie: a.cookie })).status).toBe(200);
    const res = await send({ token: contact.signDraft(draft, b.id) }, { cookie: b.cookie });
    expect(await res.json()).toMatchObject({ scope: 'all' });
  });

  it('a provider failure returns 502, uses no quota, and the same draft can be retried', async () => {
    const dev = newDevice();
    const token = contact.signDraft(draft, dev.id);
    resendStatus = 403;
    const res = await send({ token }, { cookie: dev.cookie });
    expect(res.status).toBe(502);
    expect(await lastTrace()).toMatchObject({ outcome: 'mail_failed', reason: 'provider_403' });
    // The provider's error body must not reach the visitor.
    resendStatus = 200;
    expect((await send({ token }, { cookie: dev.cookie })).status).toBe(200);
    expect((await send({ token: contact.signDraft(draft, dev.id) }, { cookie: dev.cookie })).status).toBe(200); // still 2 allowed
  });

  it('never puts the message in the logs', async () => {
    const dev = newDevice();
    await send({ token: contact.signDraft({ ...draft, message: 'very private text' }, dev.id) }, { cookie: dev.cookie });
    await lastTrace();
    const logged = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().join('\n');
    expect(logged).not.toContain('very private text');
    expect(logged).not.toContain('linh@company.example');
  });
});
