// Outlet staff + step-up security for the POS.
// Roles:
//   owner     — the registered seller (seller-account password). Everything,
//               but Stock count / Damages / Returns need a fresh password
//               unlock (15 min) so nobody can interfere with inventory.
//   attendant — sales personnel (name + 4-digit PIN created by the owner).
//               Sell + receipts only. No stock, damages, returns, billing.
// Browser-local for the pilot demo (outlet devices are shared hardware).
'use client';

import { demoHash, myApplicant } from './onboarding';

export type OutletRole = 'owner' | 'attendant';

export interface Attendant { id: string; name: string; pinHash: string; createdAt: number; active: boolean; }
export interface OutletSession { role: OutletRole; name: string; at: number; }

const AKEY = 'fmcg-outlet-staff-v1';
const SKEY = 'fmcg-outlet-session-v1';
const UKEY = 'fmcg-outlet-unlock-v1';
const UNLOCK_MS = 15 * 60 * 1000; // sensitive tabs stay open 15 min after password

const EMPTY: Attendant[] = [];
let aCache: Attendant[] | null = null;
let sCache: OutletSession | null | undefined;
const listeners = new Set<() => void>();

function readStaff(): Attendant[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const v = JSON.parse(localStorage.getItem(AKEY) ?? '[]') as Attendant[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function getStaffSnapshot(): Attendant[] {
  if (aCache) return aCache;
  aCache = readStaff();
  return aCache;
}
export function getStaffServerSnapshot(): Attendant[] { return EMPTY; }

export function subscribeStaff(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { aCache = null; sCache = undefined; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function emit(): void { listeners.forEach((l) => l()); }
function persist(): void {
  window.localStorage.setItem(AKEY, JSON.stringify(aCache ?? []));
  emit();
}

const uid = () => `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Owner creates sales-personnel access (name + 4-digit PIN). */
export function addAttendant(name: string, pin: string): Attendant {
  if (!name.trim()) throw new Error('Attendant name required.');
  if (!/^[0-9]{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits.');
  const a: Attendant = { id: uid(), name: name.trim(), pinHash: demoHash(`pin:${pin}`), createdAt: Date.now(), active: true };
  aCache = [a, ...getStaffSnapshot()];
  persist();
  return a;
}

export function removeAttendant(id: string): void {
  aCache = getStaffSnapshot().filter((a) => a.id !== id);
  persist();
}

export function outletSession(): OutletSession | null {
  if (typeof window === 'undefined') return null;
  if (sCache !== undefined) return sCache;
  try {
    sCache = JSON.parse(localStorage.getItem(SKEY) ?? 'null') as OutletSession | null;
  } catch {
    sCache = null;
  }
  return sCache;
}

function setSession(s: OutletSession | null): void {
  sCache = s;
  if (s) window.localStorage.setItem(SKEY, JSON.stringify(s));
  else window.localStorage.removeItem(SKEY);
  emit();
}

/** Stable snapshot for useSyncExternalStore — new identity on login/logout. */
export function getOutletSessionSnapshot(): OutletSession | null {
  return outletSession();
}
export function getOutletSessionServerSnapshot(): OutletSession | null {
  return null;
}

/** Owner opens the till with the seller-account password. */
export function ownerLogin(password: string): OutletSession {
  const me = myApplicant();
  if (!me) throw new Error('No registered seller on this device.');
  if (me.passHash !== demoHash(password)) throw new Error('Wrong owner password.');
  const s: OutletSession = { role: 'owner', name: me.businessName, at: Date.now() };
  setSession(s);
  return s;
}

/** Sales personnel open the till with their 4-digit PIN. */
export function attendantLogin(pin: string): OutletSession {
  const hit = getStaffSnapshot().find((a) => a.active && a.pinHash === demoHash(`pin:${pin}`));
  if (!hit) throw new Error('Wrong PIN — ask the outlet admin.');
  const s: OutletSession = { role: 'attendant', name: hit.name, at: Date.now() };
  setSession(s);
  return s;
}

export function outletLogout(): void {
  setSession(null);
  window.localStorage.removeItem(UKEY);
}

/** Step-up: owner password unlocks Stock count / Damages / Returns for 15 min. */
export function unlockSensitive(password: string): void {
  const me = myApplicant();
  if (!me || me.passHash !== demoHash(password)) throw new Error('Wrong owner password.');
  window.localStorage.setItem(UKEY, String(Date.now() + UNLOCK_MS));
  emit();
}

export function sensitiveUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return Number(window.localStorage.getItem(UKEY) ?? 0) > Date.now();
}

export function lockSensitive(): void {
  window.localStorage.removeItem(UKEY);
  emit();
}
