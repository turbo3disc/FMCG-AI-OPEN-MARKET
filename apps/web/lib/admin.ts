// Super-admin session — locks /admin behind the admin password.
// Tries the live API (POST /api/admin/login) first, falls back to the
// documented default password offline so the pilot demo always works.
'use client';

export const DEFAULT_ADMIN_PASSWORD = 'SuperAdmin@2026';

const KEY = 'fmcg-admin-session-v1';
let cache: { token: string; at: number } | null | undefined;
const listeners = new Set<() => void>();

export function getAdminSnapshot(): { token: string; at: number } | null {
  if (cache !== undefined) return cache;
  if (typeof window === 'undefined') return null;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { token: string; at: number } | null;
  } catch {
    cache = null;
  }
  return cache;
}
export function getAdminServerSnapshot(): null { return null; }

export function subscribeAdmin(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { cache = undefined; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function save(s: { token: string; at: number } | null): void {
  cache = s;
  if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
  else window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function adminLoggedIn(): boolean {
  return !!getAdminSnapshot();
}

export function adminLogout(): void {
  save(null);
}

/** Super-admin login. Returns whether the default password is still in use. */
export async function adminLogin(password: string): Promise<{ defaultPassword: boolean }> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const r = await fetch(`${base}/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      const j = (await r.json()) as { accessToken: string; defaultPassword: boolean };
      save({ token: j.accessToken, at: Date.now() });
      return { defaultPassword: j.defaultPassword };
    }
  } catch { /* offline — fall through to local check */ }
  if (password === DEFAULT_ADMIN_PASSWORD) {
    save({ token: 'local-admin', at: Date.now() });
    return { defaultPassword: true };
  }
  throw new Error('Wrong admin password.');
}
