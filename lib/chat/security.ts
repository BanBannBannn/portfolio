/**
 * Request checks and signatures shared by the chat routes.
 * Every signature uses one secret derived from ANTHROPIC_API_KEY, with a
 * different `purpose` per use so a signature for one thing never verifies
 * as another.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const DEVICE_COOKIE = 'chat_device';

export function hmac(purpose: string, data: string) {
  const key = createHmac('sha256', process.env.ANTHROPIC_API_KEY!).update('portfolio-chat').digest();
  return createHmac('sha256', key).update(`${purpose}\n${data}`).digest('base64url');
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function readDeviceCookie(req: Request) {
  return req.headers
    .get('cookie')
    ?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${DEVICE_COOKIE}=`))
    ?.slice(DEVICE_COOKIE.length + 1);
}

/** The visitor's device id if the request carries a valid signed cookie. */
export function existingDevice(req: Request): string | null {
  const raw = readDeviceCookie(req);
  if (!raw || raw.length >= 200) return null;
  const [id, mac] = raw.split('.');
  return id && mac && safeEqual(mac, hmac('device', id)) ? id : null;
}

/** Reads the signed device cookie, or issues a new device id. */
export function device(req: Request): { id: string; cookie?: string } {
  const id = existingDevice(req);
  if (id) return { id };

  const fresh = randomUUID();
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return {
    id: fresh,
    cookie: `${DEVICE_COOKIE}=${fresh}.${hmac('device', fresh)}; Path=/api/chat; Max-Age=${30 * 24 * 3600}; HttpOnly; SameSite=Strict${secure}`,
  };
}

/** On Vercel these headers are set by the platform edge, not by the client. */
export function clientIp(req: Request) {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // not a browser cross-site request; rate limits still apply
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false; // "null" (sandboxed iframes, file://) or garbage
  }
}

/**
 * Requiring JSON makes any cross-site browser request a CORS preflight, which
 * these routes never answer, so other sites cannot call them via a visitor.
 */
export function isJson(req: Request) {
  return !!req.headers.get('content-type')?.toLowerCase().startsWith('application/json');
}

export const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' };

export function json(status: number, data: Record<string, unknown>, headers?: Record<string, string>) {
  return Response.json(data, { status, headers: { ...SECURITY_HEADERS, ...headers } });
}
