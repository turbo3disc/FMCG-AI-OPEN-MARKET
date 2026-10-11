// Seller onboarding store — registration (profile + address + location),
// approval status, and the notification trail (email / SMS / WhatsApp).
// Shape mirrors the live API (POST /api/identity/sellers/apply,
// GET /api/admin/sellers/pending, POST /:id/moderate) so the UI switches to
// live data once seller/admin login is configured — see docs/DEPLOY.md.
'use client';

export type ApplicantStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type NotifyChannel = 'whatsapp' | 'sms' | 'email';

export interface Applicant {
  id: string;
  contactName: string;
  phone: string;
  email: string;
  passHash: string; // demo-grade local hash (real auth = API password login)
  notifyChannel: NotifyChannel;
  businessName: string;
  sellerType: 'wholesaler' | 'distributor';
  addressLine1: string;
  city: string;
  area: string;
  lat: string;
  lng: string;
  tier: 1 | 2;
  status: ApplicantStatus;
  createdAt: number;
}

export interface Notice {
  id: string;
  channel: NotifyChannel;
  to: string;
  template: 'seller.application_received' | 'seller.welcome' | 'seller.rejected';
  body: string;
  at: number;
}

const AKEY = 'fmcg-seller-applicants-v1';
const NKEY = 'fmcg-seller-notices-v1';
const SKEY = 'fmcg-seller-session-v1';
const EMPTY_AP: Applicant[] = [];
const EMPTY_N: Notice[] = [];

let aCache: Applicant[] | null = null;
let nCache: Notice[] | null = null;
const listeners = new Set<() => void>();

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(key) ?? '[]') as T[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function getApplicantsSnapshot(): Applicant[] {
  if (aCache) return aCache;
  aCache = read<Applicant>(AKEY);
  return aCache;
}
export function getApplicantsServerSnapshot(): Applicant[] { return EMPTY_AP; }
export function getNoticesSnapshot(): Notice[] {
  if (nCache) return nCache;
  nCache = read<Notice>(NKEY);
  return nCache;
}
export function getNoticesServerSnapshot(): Notice[] { return EMPTY_N; }

export function subscribeOnboarding(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { aCache = null; nCache = null; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function emit(): void {
  listeners.forEach((l) => l());
}

function persist(): void {
  window.localStorage.setItem(AKEY, JSON.stringify(aCache ?? []));
  window.localStorage.setItem(NKEY, JSON.stringify(nCache ?? []));
  emit();
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const BODIES: Record<Notice['template'], (b: string) => string> = {
  'seller.application_received': (b) =>
    `FMCG Open Market: hi ${b}! Your seller application was received and is under review. We will message you here once approved.`,
  'seller.welcome': (b) =>
    `FMCG Open Market: congrats ${b} — you are approved! Welcome onboard. Open your sub-admin dashboard to upload products and go live for buyers.`,
  'seller.rejected': (b) =>
    `FMCG Open Market: hello ${b}, your seller application needs more detail. Update your profile and re-apply, or reply to this message.`,
};

function send(channel: NotifyChannel, to: string, template: Notice['template'], business: string): Notice {
  const n: Notice = { id: uid('msg'), channel, to, template, body: BODIES[template](business), at: Date.now() };
  nCache = [n, ...(nCache ?? getNoticesSnapshot())];
  return n;
}

export function applyAsSeller(input: Omit<Applicant, 'id' | 'status' | 'createdAt' | 'tier' | 'passHash'> & { password: string }): { applicant: Applicant; ack: Notice } {
  const list = getApplicantsSnapshot();
  const dup = list.find((a) => a.phone === input.phone && a.status !== 'rejected');
  if (dup) throw new Error('This phone already has an application under review.');
  const { password, ...rest } = input;
  const applicant: Applicant = { ...rest, passHash: demoHash(password), id: uid('seller'), tier: 1, status: 'pending', createdAt: Date.now() };
  aCache = [applicant, ...list];
  const to = input.notifyChannel === 'email' ? input.email : input.phone;
  const ack = send(input.notifyChannel, to, 'seller.application_received', input.businessName);
  persist();
  window.localStorage.setItem(SKEY, JSON.stringify({ applicantId: applicant.id, authed: false }));
  return { applicant, ack };
}

/** Demo-grade non-crypto hash for the offline demo login (API uses sha256). */
export function demoHash(s: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export interface SellerSession { applicantId: string; authed: boolean; }

export function sellerSession(): SellerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(window.localStorage.getItem(SKEY) ?? 'null') as SellerSession | string | null;
    if (!v) return null;
    if (typeof v === 'string') return { applicantId: v, authed: false }; // legacy shape
    return v;
  } catch {
    return null;
  }
}

/** Seller login: phone + account password created at registration. */
export function loginSeller(phone: string, password: string): Applicant {
  const hit = getApplicantsSnapshot().find((a) => a.phone === phone.trim());
  if (!hit || hit.passHash !== demoHash(password)) throw new Error('Wrong phone or password.');
  window.localStorage.setItem(SKEY, JSON.stringify({ applicantId: hit.id, authed: true }));
  emit();
  return hit;
}

export function logoutSeller(): void {
  window.localStorage.removeItem(SKEY);
  emit();
}

export function moderateApplicant(id: string, status: ApplicantStatus, tier?: 1 | 2): Notice[] {
  const sent: Notice[] = [];
  aCache = getApplicantsSnapshot().map((a) => {
    if (a.id !== id) return a;
    const next = { ...a, status, tier: tier ?? a.tier };
    if (status === 'approved') {
      sent.push(send(a.notifyChannel, a.notifyChannel === 'email' ? a.email : a.phone, 'seller.welcome', a.businessName));
      if (a.email && a.notifyChannel !== 'email') sent.push(send('email', a.email, 'seller.welcome', a.businessName));
    } else if (status === 'rejected') {
      sent.push(send(a.notifyChannel, a.notifyChannel === 'email' ? a.email : a.phone, 'seller.rejected', a.businessName));
    }
    return next;
  });
  persist();
  return sent;
}

export function myApplicantId(): string | null {
  return sellerSession()?.applicantId ?? null;
}

/** Registration gate: only a logged-in, admin-approved seller may upload products. */
export function canSell(): boolean {
  const s = sellerSession();
  if (!s?.authed) return false;
  const me = getApplicantsSnapshot().find((a) => a.id === s.applicantId);
  return !!me && me.status === 'approved';
}

export function myApplicant(): Applicant | null {
  const id = myApplicantId();
  if (!id) return null;
  return getApplicantsSnapshot().find((a) => a.id === id) ?? null;
}

export { LAGOS_AREAS } from './geo';