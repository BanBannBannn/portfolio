/**
 * "Leave Bân a message" from the chat.
 *
 * The model never sends email. It can only call `draft_message_to_ban`, which
 * validates the input and returns a draft. The server signs that draft into a
 * token bound to the visitor's device cookie, the chat shows it with a Send
 * button, and only the visitor's click (POST /api/chat/send) sends it. So:
 *
 * - a prompt injection can at most produce a draft the visitor sees and declines;
 * - the recipient is fixed server-side (CONTACT_TO_EMAIL), never chosen by the model;
 * - a draft can't be sent from another device, altered, sent twice, or sent late;
 * - sending is rate limited per device, per IP and per day overall.
 *
 * Mail goes through Resend's free tier (3,000/month, 100/day).
 */
import type Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';
import { createRateLimiter } from '../rate-limit';
import { hmac, safeEqual } from './security';
import { hasStore, pipeline } from './store';

export const TOOL_NAME = 'draft_message_to_ban';

export const TOPICS = {
  job_opportunity: 'Job opportunity',
  project_question: 'Question about a project',
  collaboration: 'Collaboration',
  other: 'Other',
} as const;
export type Topic = keyof typeof TOPICS;

export const LIMITS = { name: 80, email: 254, message: 1_000 } as const;
const DRAFT_TTL_MS = 30 * 60_000;
const MAX_TOKEN_CHARS = 4_096;

export const CONTACT_TOOL: Anthropic.Tool = {
  name: TOOL_NAME,
  description:
    "Prepare a message from the visitor to Bân. It does NOT send anything: the draft is shown to the visitor, " +
    'who reviews it and presses Send themselves. Use it only when the visitor asks to contact Bân, leave a message, ' +
    'or wants Bân to get back to them, and only after they have given their email address. ' +
    "Write the message from the visitor's point of view using only what the visitor said; do not add claims, offers or details they did not give.",
  // Small input: let the API buffer and validate it rather than streaming partial JSON.
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      visitor_name: {
        type: 'string',
        description: `The visitor's name as they gave it, or an empty string if they did not. Max ${LIMITS.name} characters.`,
      },
      visitor_email: {
        type: 'string',
        description: 'The email address the visitor gave for Bân to reply to. Never guess or invent one.',
      },
      topic: { type: 'string', enum: Object.keys(TOPICS) },
      message: {
        type: 'string',
        description: `The message to Bân, in the visitor's words and language. Max ${LIMITS.message} characters.`,
      },
    },
    required: ['visitor_name', 'visitor_email', 'topic', 'message'],
    additionalProperties: false,
  },
};

export const TOOL_PROMPT = `
Leaving Bân a message:
- You have a tool, ${TOOL_NAME}, that prepares (does not send) a message to Bân. The visitor sees the draft and presses Send themselves.
- Offer it when a visitor wants to contact Bân, discuss a role, or get a reply. You need their email address first; ask for it if they have not given it. Their name is optional.
- Put only what the visitor said into the draft. Never add your own claims, never invent an email address, never draft on someone else's behalf.
- After drafting, tell the visitor in one short sentence to check the draft below and press Send, or tell you what to change.
- Never say a message was sent: only the visitor's click sends it.`;

export type Draft = { name: string; email: string; topic: Topic; message: string };

// ---- validation ---------------------------------------------------------------------

/** Removes control characters (incl. CR/LF, so nothing can become a mail header) and trims. */
function oneLine(s: string) {
  return s.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();
}
/** Keeps line breaks and tabs, drops other control characters. */
function multiLine(s: string) {
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function validateDraft(input: unknown): { ok: true; draft: Draft } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Input must be an object.' };
  const i = input as Record<string, unknown>;
  const allowed = new Set(['visitor_name', 'visitor_email', 'topic', 'message']);
  const extra = Object.keys(i).filter(k => !allowed.has(k));
  if (extra.length) return { ok: false, error: `Unknown field(s): ${extra.join(', ')}. The recipient is always Bân.` };
  for (const k of allowed) if (typeof i[k] !== 'string') return { ok: false, error: `${k} must be a string.` };

  const name = oneLine(i.visitor_name as string);
  const email = oneLine(i.visitor_email as string).toLowerCase();
  const message = multiLine(i.message as string);
  const topic = i.topic as string;

  if (name.length > LIMITS.name) return { ok: false, error: `visitor_name is longer than ${LIMITS.name} characters.` };
  if (!email) return { ok: false, error: 'visitor_email is missing: ask the visitor for their email address.' };
  if (email.length > LIMITS.email || email.split('@')[0].length > 64 || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'visitor_email is not a valid email address: ask the visitor to check it.' };
  }
  if (!Object.hasOwn(TOPICS, topic)) return { ok: false, error: `topic must be one of ${Object.keys(TOPICS).join(', ')}.` };
  if (message.length < 2) return { ok: false, error: 'message is empty: ask the visitor what they want to say.' };
  if (message.length > LIMITS.message) {
    return { ok: false, error: `message is longer than ${LIMITS.message} characters: shorten it or ask the visitor to.` };
  }
  return { ok: true, draft: { name, email, topic: topic as Topic, message } };
}

// ---- draft tokens --------------------------------------------------------------------

type Payload = { d: Draft; dev: string; exp: number; n: string };

/** A self-contained, signed draft bound to one device. Nothing is stored until it is sent. */
export function signDraft(draft: Draft, deviceId: string, now = Date.now()) {
  const payload: Payload = { d: draft, dev: deviceId, exp: now + DRAFT_TTL_MS, n: randomUUID() };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac('draft', body)}`;
}

export type DraftCheck =
  | { ok: true; draft: Draft; nonce: string }
  | { ok: false; status: 400 | 403; error: 'bad_token' | 'expired' | 'wrong_device' };

export function verifyDraft(token: unknown, deviceId: string | null, now = Date.now()): DraftCheck {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_CHARS) return { ok: false, status: 400, error: 'bad_token' };
  const [body, mac, ...rest] = token.split('.');
  if (!body || !mac || rest.length || !safeEqual(mac, hmac('draft', body))) return { ok: false, status: 400, error: 'bad_token' };

  let p: Payload;
  try {
    p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, status: 400, error: 'bad_token' };
  }
  // Signed by us, but re-validate anyway: defence in depth.
  const v = validateDraft({ visitor_name: p?.d?.name, visitor_email: p?.d?.email, topic: p?.d?.topic, message: p?.d?.message });
  if (!v.ok || typeof p.n !== 'string' || typeof p.exp !== 'number') return { ok: false, status: 400, error: 'bad_token' };
  if (p.exp < now) return { ok: false, status: 400, error: 'expired' };
  if (!deviceId || typeof p.dev !== 'string' || !safeEqual(p.dev, deviceId)) return { ok: false, status: 403, error: 'wrong_device' };
  return { ok: true, draft: v.draft, nonce: p.n };
}

// ---- configuration -------------------------------------------------------------------

export function mailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return null;
  return {
    apiKey,
    to,
    from: process.env.CONTACT_FROM_EMAIL || 'Portfolio chat <onboarding@resend.dev>',
    endpoint: process.env.RESEND_API_URL || 'https://api.resend.com/emails',
  };
}

// ---- single use + limits ----------------------------------------------------------------

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const perDevice = createRateLimiter(2, DAY);
const perIp = createRateLimiter(3, DAY);
const perInstance = createRateLimiter(20, DAY);
const usedLocally = new Map<string, number>(); // nonce -> expiry, when there is no shared store

/** Whether a draft was already sent (or is being sent). Claiming is still what guarantees single use. */
export async function nonceUsed(nonce: string): Promise<boolean> {
  const exp = usedLocally.get(nonce);
  if (exp && exp > Date.now()) return true;
  if (!hasStore()) return false;
  const r = await pipeline([['GET', `chat:sent:${nonce}`]]);
  return !!r && r[0] !== null;
}

/** Claims a draft so it can only be sent once. Returns false if it was already sent (or is being sent). */
export async function claimNonce(nonce: string): Promise<boolean> {
  const now = Date.now();
  for (const [k, exp] of usedLocally) if (exp < now) usedLocally.delete(k);
  if (usedLocally.has(nonce)) return false;
  if (hasStore()) {
    const r = await pipeline([['SET', `chat:sent:${nonce}`, '1', 'NX', 'PX', DRAFT_TTL_MS + HOUR]]);
    if (r && r[0] !== 'OK') return false;
  }
  usedLocally.set(nonce, now + DRAFT_TTL_MS + HOUR);
  return true;
}

/** Releases a claim after the mail provider failed, so the visitor can retry. */
export async function releaseNonce(nonce: string) {
  usedLocally.delete(nonce);
  if (hasStore()) await pipeline([['DEL', `chat:sent:${nonce}`]]);
}

export type SendLimit = { ok: true } | { ok: false; scope: 'device' | 'ip' | 'all'; retryAfter: number };

/** Checks the send limits without counting; `recordSend` counts a successful send. */
export async function checkSendLimits(deviceId: string, ip: string, perDay: number): Promise<SendLimit> {
  for (const [scope, limiter, key, max] of [
    ['device', perDevice, deviceId, undefined],
    ['ip', perIp, ip, undefined],
    ['all', perInstance, 'all', perDay],
  ] as const) {
    const r = limiter.check(key, max);
    if (!r.ok) return { ok: false, scope, retryAfter: r.retryAfterSec };
  }
  if (hasStore()) {
    const r = await pipeline([['GET', `chat:mail:${new Date().toISOString().slice(0, 10)}`]]);
    if (r && Number(r[0] ?? 0) >= perDay) return { ok: false, scope: 'all', retryAfter: secondsToUtcMidnight() };
  }
  return { ok: true };
}

export async function recordSend(deviceId: string, ip: string) {
  perDevice.record(deviceId);
  perIp.record(ip);
  perInstance.record('all');
  if (hasStore()) {
    const key = `chat:mail:${new Date().toISOString().slice(0, 10)}`;
    await pipeline([['INCR', key], ['EXPIRE', key, 2 * 24 * 3600]]);
  }
}

function secondsToUtcMidnight() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

// ---- sending ---------------------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function renderMail(d: Draft, meta: { device: string; sentAt: Date }) {
  const who = d.name || d.email;
  const when = meta.sentAt.toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'medium', timeStyle: 'short' });
  const subject = oneLine(`[Portfolio] ${TOPICS[d.topic]} from ${who}`).slice(0, 150);
  const text = [
    `${TOPICS[d.topic]} from ${who} <${d.email}>`,
    '',
    d.message,
    '',
    '—',
    `Sent ${when} (ICT) from the AI chat on your portfolio. The visitor reviewed this draft and pressed Send.`,
    `Reply to this email to answer them. Visitor id: ${meta.device}`,
  ].join('\n');
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#fbfbfa;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#34343a">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e3e3e0;border-radius:12px;padding:24px">
<p style="margin:0;font-size:13px;color:#64646b">${esc(TOPICS[d.topic])}</p>
<p style="margin:4px 0 16px;font-size:16px;font-weight:600;color:#111113">${esc(d.name || 'A visitor')} &lt;<a href="mailto:${esc(d.email)}" style="color:#1f5fd1">${esc(d.email)}</a>&gt;</p>
<div style="white-space:pre-wrap;font-size:15px;line-height:1.6;color:#111113">${esc(d.message)}</div>
<p style="margin:20px 0 0;padding-top:12px;border-top:1px solid #e3e3e0;font-size:12px;color:#64646b">Sent ${esc(when)} (ICT) from the AI chat on your portfolio. The visitor reviewed this draft and pressed Send. Reply to this email to answer them. Visitor id: ${esc(meta.device)}</p>
</div></body></html>`;
  return { subject, text, html };
}

export async function sendMail(d: Draft, meta: { device: string; nonce: string }): Promise<{ ok: true; id?: string } | { ok: false; status: number }> {
  const cfg = mailConfig();
  if (!cfg) return { ok: false, status: 503 };
  const { subject, text, html } = renderMail(d, { device: meta.device, sentAt: new Date() });
  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
        // Resend drops a repeat of the same key, so a retried request can't send twice.
        'Idempotency-Key': `portfolio-${meta.nonce}`,
      },
      body: JSON.stringify({ from: cfg.from, to: [cfg.to], reply_to: d.email, subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Log status only: the body can echo addresses back.
      console.error('[contact] mail provider returned', res.status);
      return { ok: false, status: res.status };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: body.id };
  } catch {
    console.error('[contact] mail provider unreachable');
    return { ok: false, status: 0 };
  }
}

/** Test hook. */
export function resetContactState() {
  usedLocally.clear();
}
