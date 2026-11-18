/**
 * The admin page has one user and one secret: ADMIN_PASSWORD. Without it the
 * page does not exist (404). A session is a signed expiry time in an HttpOnly
 * cookie; changing the password signs everyone out.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { createRateLimiter } from './rate-limit';

export const ADMIN_COOKIE = 'admin_session';
const SESSION_SEC = 7 * 24 * 3600;

const perIp = createRateLimiter(5, 15 * 60_000);
const overall = createRateLimiter(30, 60 * 60_000);

export function adminEnabled() {
  return (process.env.ADMIN_PASSWORD ?? '').length > 0;
}

export function weakPassword() {
  return (process.env.ADMIN_PASSWORD ?? '').length < 12;
}

function sign(data: string) {
  const key = createHmac('sha256', process.env.ADMIN_PASSWORD ?? '').update('portfolio-admin-session').digest();
  return createHmac('sha256', key).update(data).digest('base64url');
}

/** Compares digests, so the comparison takes the same time whatever the lengths. */
function sameSecret(a: string, b: string) {
  const h = (s: string) => createHmac('sha256', 'admin-compare').update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

export function newSession(now = Date.now()) {
  const exp = String(now + SESSION_SEC * 1000);
  return { value: `${exp}.${sign(exp)}`, maxAge: SESSION_SEC };
}

export function validSession(value: string | undefined, now = Date.now()) {
  if (!adminEnabled() || !value || value.length > 200) return false;
  const [exp, mac] = value.split('.');
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < now) return false;
  return sameSecret(mac, sign(exp));
}

export async function isAdmin() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export type LoginResult = 'ok' | 'wrong' | 'throttled' | 'disabled';

/** Checks the password, with brute-force limits per IP and overall. */
export async function checkLogin(password: string): Promise<LoginResult> {
  if (!adminEnabled()) return 'disabled';
  const h = await headers();
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!perIp.check(ip).ok || !overall.check('all').ok) return 'throttled';
  if (sameSecret(password, process.env.ADMIN_PASSWORD!)) return 'ok';
  // Only failures count, so the owner is never locked out by their own logins.
  perIp.record(ip);
  overall.record('all');
  return 'wrong';
}
