/**
 * POST /api/chat/send { token }: sends a draft the visitor confirmed.
 * The token comes from the chat route; see lib/chat/contact.ts for why this is safe.
 */
import { randomUUID } from 'node:crypto';
import { after } from 'next/server';
import { getConfig } from '../../../../lib/chat/config';
import {
  checkSendLimits, claimNonce, mailConfig, nonceUsed, recordSend, releaseNonce, sendMail, verifyDraft,
} from '../../../../lib/chat/contact';
import { clientIp, existingDevice, isJson, json, sameOrigin } from '../../../../lib/chat/security';
import { pseudonym, recordTrace, type Trace } from '../../../../lib/chat/telemetry';

const MAX_BODY_BYTES = 8_192;

function schedule(task: () => Promise<void>) {
  const run = () => task().catch(() => console.error('[contact] telemetry failed'));
  try {
    after(run);
  } catch {
    void run();
  }
}

export async function POST(req: Request) {
  const started = performance.now();
  const trace: Trace = { id: randomUUID(), at: new Date().toISOString(), outcome: 'rejected', status: 0, durationMs: 0, tools: ['send_mail'] };
  const done = (res: Response, outcome: Trace['outcome'], reason?: string) => {
    Object.assign(trace, { outcome, status: res.status, reason, durationMs: Math.round(performance.now() - started) });
    schedule(() => recordTrace(trace));
    return res;
  };

  if (!sameOrigin(req)) return done(json(403, { error: 'forbidden' }), 'rejected', 'mail_forbidden');
  if (!isJson(req)) return done(json(415, { error: 'unsupported_media_type' }), 'rejected', 'mail_media_type');
  if (!process.env.ANTHROPIC_API_KEY || !mailConfig()) return json(503, { error: 'not_configured' });

  const config = await getConfig();
  if (!config.enabled || !config.contactTool) return done(json(503, { error: 'paused' }), 'paused', 'mail_disabled');

  const deviceId = existingDevice(req);
  const ip = clientIp(req);
  if (deviceId) trace.device = pseudonym('device', deviceId);
  trace.ip = pseudonym('ip', ip);

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return done(json(413, { error: 'too_large' }), 'rejected', 'mail_too_large');
  const text = await req.text().catch(() => '');
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return done(json(413, { error: 'too_large' }), 'rejected', 'mail_too_large');
  let body: { token?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return done(json(400, { error: 'bad_request' }), 'rejected', 'mail_bad_request');
  }

  // Signature, expiry and owner. A draft from another device is refused even with a valid signature.
  const check = verifyDraft(body?.token, deviceId);
  if (!check.ok) return done(json(check.status, { error: check.error }), 'rejected', `mail_${check.error}`);

  // An already-sent draft says so (a double click is not "over the limit").
  if (await nonceUsed(check.nonce)) return done(json(409, { error: 'already_sent' }), 'rejected', 'mail_already_sent');

  const limit = await checkSendLimits(deviceId!, ip, config.mailPerDay);
  if (!limit.ok) {
    return done(
      json(429, { error: 'rate_limited', scope: limit.scope, retryAfter: limit.retryAfter }, { 'Retry-After': String(limit.retryAfter) }),
      'rate_limited',
      `mail_${limit.scope}`,
    );
  }

  // Single use: the first request to claim the draft sends it; repeats get 409.
  if (!(await claimNonce(check.nonce))) return done(json(409, { error: 'already_sent' }), 'rejected', 'mail_already_sent');

  const sent = await sendMail(check.draft, { device: trace.device ?? 'unknown', nonce: check.nonce });
  if (!sent.ok) {
    await releaseNonce(check.nonce); // nothing went out, so let the visitor try again
    return done(json(502, { error: 'send_failed' }), 'mail_failed', `provider_${sent.status}`);
  }
  await recordSend(deviceId!, ip);
  trace.requestId = sent.id;
  if (config.logContent) trace.q = `[message to Bân] ${check.draft.message}`;
  return done(json(200, { sent: true }), 'mail_sent');
}
