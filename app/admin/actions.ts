'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, checkLogin, isAdmin, newSession } from '../../lib/admin-auth';
import { clearOverrides, FIELDS, saveOverrides, type ChatConfig, type ConfigKey } from '../../lib/chat/config';
import { clearTraces } from '../../lib/chat/telemetry';

// Every action checks the session itself: a Server Action is a public POST
// endpoint, whatever the page around it renders.

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '').slice(0, 200);
  const result = await checkLogin(password);
  if (result !== 'ok') redirect(`/admin?e=${result}`);

  const { value, maxAge } = newSession();
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge,
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
  redirect('/admin');
}

export async function saveSettings(formData: FormData) {
  if (!(await isAdmin())) redirect('/admin');
  const next: Partial<Record<ConfigKey, unknown>> = {};
  for (const key of Object.keys(FIELDS) as ConfigKey[]) {
    // An unticked checkbox is simply missing from the form.
    next[key] = FIELDS[key].type === 'boolean' ? formData.get(key) === 'on' : formData.get(key);
  }
  const ok = await saveOverrides(next as Partial<ChatConfig>);
  redirect(`/admin?s=${ok ? 'saved' : 'failed'}#settings`);
}

export async function resetSettings() {
  if (!(await isAdmin())) redirect('/admin');
  const ok = await clearOverrides();
  redirect(`/admin?s=${ok ? 'reset' : 'failed'}#settings`);
}

export async function clearTraceList() {
  if (!(await isAdmin())) redirect('/admin');
  await clearTraces();
  redirect('/admin?s=cleared#traces');
}
