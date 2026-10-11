// FMCG Open Market POS subscription — paid add-on for the robotic inventory.
// Plans: monthly / quarterly / yearly. New sellers get a 14-day trial.
// Browser-local for the pilot demo; mirrors GET|POST /api/pos/subscriptions/*.
'use client';

export type Plan = 'monthly' | 'quarterly' | 'yearly';
export type SubStatus = 'trial' | 'active' | 'expired' | 'none';

export const PLANS: Record<Plan, { label: string; months: number; amountKobo: number; blurb: string }> = {
  monthly: { label: 'Monthly', months: 1, amountKobo: 500000, blurb: 'Flexible month-to-month. Cancel anytime.' },
  quarterly: { label: 'Quarterly', months: 3, amountKobo: 1200000, blurb: 'Save 20% vs monthly.' },
  yearly: { label: 'Yearly', months: 12, amountKobo: 4000000, blurb: 'Best value — save 33%.' },
};

export interface Subscription { plan: Plan | 'trial'; status: SubStatus; startedAt: number; endsAt: number; }

const KEY = 'fmcg-pos-subscription-v1';
const TRIAL_DAYS = 14;
let cache: Subscription | null | undefined;
const listeners = new Set<() => void>();

function read(): Subscription | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Subscription | null;
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

export function getSubSnapshot(): Subscription | null {
  if (cache !== undefined) return cache;
  cache = read();
  return cache;
}
export function getSubServerSnapshot(): Subscription | null { return null; }

export function subscribeBilling(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { cache = undefined; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function save(s: Subscription | null): void {
  cache = s;
  if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
  else window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

/** Trial starts on first POS visit; subscription state resolves live status. */
export function subscription(): { status: SubStatus; sub: Subscription | null; daysLeft: number } {
  if (typeof window === 'undefined') {
    return { status: 'trial', sub: null, daysLeft: TRIAL_DAYS };
  }
  let sub = getSubSnapshot();
  if (!sub) {
    sub = { plan: 'trial', status: 'trial', startedAt: Date.now(), endsAt: Date.now() + TRIAL_DAYS * 86400000 };
    save(sub);
  }
  if (sub.endsAt < Date.now()) {
    const expired = { ...sub, status: 'expired' as SubStatus };
    if (sub.status !== 'expired') save(expired);
    return { status: 'expired', sub: expired, daysLeft: 0 };
  }
  return { status: sub.status, sub, daysLeft: Math.ceil((sub.endsAt - Date.now()) / 86400000) };
}

/** Mock checkout (Paystack/transfer lands here) — activates immediately. */
export function activatePlan(plan: Plan): Subscription {
  const months = PLANS[plan].months;
  const sub: Subscription = {
    plan, status: 'active',
    startedAt: Date.now(), endsAt: Date.now() + months * 30 * 86400000,
  };
  save(sub);
  return sub;
}

export function posUnlocked(): boolean {
  return subscription().status !== 'expired' && subscription().status !== 'none';
}
