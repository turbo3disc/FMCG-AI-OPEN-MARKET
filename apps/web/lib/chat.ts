// Buyer ↔ seller chat store (browser-local for the pilot demo).
// Same shape maps onto a messages API later: threads per seller, both sides
// chat here; sellers open /messages?as=seller for their inbox.
'use client';

import { getApplicantsSnapshot } from './onboarding';
import { liveProducts, loadInventory } from './inventory';
import { sellers as demoSellers } from './demo';

export interface ChatMessage { id: string; from: 'buyer' | 'seller'; text: string; at: number; }
export interface Thread { sellerKey: string; messages: ChatMessage[]; lastReadBuyer: number; lastReadSeller: number; }

export interface SellerContact {
  key: string; name: string; market: string; phone: string; tier: number; live: boolean;
}

const TKEY = 'fmcg-chat-v1';
const EMPTY: Thread[] = [];
let cache: Thread[] | null = null;
const listeners = new Set<() => void>();

// Demo phones for seeded sellers (real sellers use their registered phone).
const DEMO_PHONES: Record<string, string> = {
  adeola: '+234801000001', balogun: '+234801000002', chidi: '+234801000003',
};

function read(): Thread[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const v = JSON.parse(window.localStorage.getItem(TKEY) ?? '[]') as Thread[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function getThreadsSnapshot(): Thread[] {
  if (cache) return cache;
  cache = read();
  return cache;
}
export function getThreadsServerSnapshot(): Thread[] { return EMPTY; }

export function subscribeChat(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { cache = null; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function persist(): void {
  window.localStorage.setItem(TKEY, JSON.stringify(cache ?? []));
  listeners.forEach((l) => l());
}

const uid = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function ensureThread(sellerKey: string): Thread {
  const list = getThreadsSnapshot();
  let t = list.find((x) => x.sellerKey === sellerKey);
  if (!t) {
    t = { sellerKey, messages: [], lastReadBuyer: 0, lastReadSeller: 0 };
    cache = [t, ...list];
    persist();
  }
  return t;
}

/** Seller directory: registered (live) sellers first, then demo sellers. */
export function sellerDirectory(): SellerContact[] {
  const out: SellerContact[] = [];
  try {
    for (const p of liveProducts(loadInventory())) {
      const key = `live:${p.sku}`;
      if (!out.some((s) => s.key === key)) {
        const mine = getApplicantsSnapshot().find((a) => a.businessName === p.sellerName);
        out.push({
          key, name: p.sellerName ?? 'Verified seller', market: p.sellerArea ?? 'Lagos',
          phone: mine?.phone ?? '+234800000000', tier: mine?.tier ?? 1, live: true,
        });
      }
    }
  } catch { /* server render: demo sellers only */ }
  for (const s of demoSellers) {
    out.push({ key: `demo:${s.id}`, name: s.name, market: s.market, phone: DEMO_PHONES[s.id] ?? '+234800000000', tier: s.tier, live: false });
  }
  return out;
}

export function sellerByKey(key: string): SellerContact | null {
  return sellerDirectory().find((s) => s.key === key) ?? null;
}

const SELLER_REPLIES = [
  'Hello! Yes, it is available. How many do you need?',
  'Good day! That price is for cash-and-carry. Delivery to your area is possible today.',
  'We have it in stock. Send your list and I will confirm total + delivery fee.',
  'Noted! I can reserve it for you till evening. Shall I pack it?',
];

export function sendMessage(sellerKey: string, from: 'buyer' | 'seller', text: string): void {
  const t = ensureThread(sellerKey);
  const clean = text.trim();
  if (!clean) return;
  t.messages = [...t.messages, { id: uid(), from, text: clean, at: Date.now() }];
  if (from === 'buyer') t.lastReadSeller = 0;
  else t.lastReadBuyer = 0;
  cache = getThreadsSnapshot().map((x) => (x.sellerKey === sellerKey ? t : x));
  persist();
  // Demo liveliness: the seller replies shortly when the buyer writes.
  if (from === 'buyer') {
    setTimeout(() => {
      const cur = getThreadsSnapshot().find((x) => x.sellerKey === sellerKey);
      if (!cur) return;
      const reply = SELLER_REPLIES[cur.messages.length % SELLER_REPLIES.length];
      cur.messages = [...cur.messages, { id: uid(), from: 'seller', text: reply, at: Date.now() }];
      cache = getThreadsSnapshot().map((x) => (x.sellerKey === sellerKey ? cur : x));
      persist();
    }, 1800);
  }
}

export function markRead(sellerKey: string, side: 'buyer' | 'seller'): void {
  const t = getThreadsSnapshot().find((x) => x.sellerKey === sellerKey);
  if (!t) return;
  if (side === 'buyer') t.lastReadBuyer = Date.now();
  else t.lastReadSeller = Date.now();
  cache = getThreadsSnapshot().map((x) => (x.sellerKey === sellerKey ? t : x));
  persist();
}

export function unreadCount(side: 'buyer' | 'seller'): number {
  return getThreadsSnapshot().reduce((n, t) => {
    const last = t.messages.length ? t.messages[t.messages.length - 1].at : 0;
    const read = side === 'buyer' ? t.lastReadBuyer : t.lastReadSeller;
    const mine = t.messages.length && t.messages[t.messages.length - 1].from !== side;
    return n + (mine && last > read ? 1 : 0);
  }, 0);
}

export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
