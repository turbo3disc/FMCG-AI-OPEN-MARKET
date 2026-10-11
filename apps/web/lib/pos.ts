// Robotic inventory / POS store — offline-first.
// Every sale, stock count, damage and return is recorded locally instantly
// (works with zero network) and queued for sync to /api/pos when online.
'use client';

export type MoveReason = 'sale' | 'damage' | 'return' | 'restock' | 'correction';
export type UnitKind = 'cartons' | 'rolls' | 'packs' | 'pieces';

export interface PosLine { sku: string; name: string; unit: string; qty: number; priceKobo: number; }
export interface PosSale {
  id: string; items: PosLine[]; totalKobo: number; at: number;
  synced: boolean; receiptNo: string;
}
export interface StockMove {
  id: string; sku: string; name: string;
  dCartons: number; dRolls: number; dPacks: number; dPieces: number;
  reason: MoveReason; note: string; at: number; synced: boolean;
}

const SKEY = 'fmcg-pos-sales-v1';
const MKEY = 'fmcg-pos-moves-v1';
const EMPTY_S: PosSale[] = [];
const EMPTY_M: StockMove[] = [];

let sCache: PosSale[] | null = null;
let mCache: StockMove[] | null = null;
const listeners = new Set<() => void>();

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function getSalesSnapshot(): PosSale[] {
  if (sCache) return sCache;
  sCache = read<PosSale>(SKEY);
  return sCache;
}
export function getSalesServerSnapshot(): PosSale[] { return EMPTY_S; }
export function getMovesSnapshot(): StockMove[] {
  if (mCache) return mCache;
  mCache = read<StockMove>(MKEY);
  return mCache;
}
export function getMovesServerSnapshot(): StockMove[] { return EMPTY_M; }

export function subscribePos(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { sCache = null; mCache = null; listeners.forEach((l) => l()); };
  const onNet = () => listeners.forEach((l) => l());
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
    window.addEventListener('online', onNet);
    window.addEventListener('offline', onNet);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('online', onNet);
      window.removeEventListener('offline', onNet);
    }
  };
}

function persist(): void {
  window.localStorage.setItem(SKEY, JSON.stringify(sCache ?? []));
  window.localStorage.setItem(MKEY, JSON.stringify(mCache ?? []));
  listeners.forEach((l) => l());
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function onlineNow(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function recordSale(items: PosLine[]): PosSale {
  const totalKobo = items.reduce((n, it) => n + it.qty * it.priceKobo, 0);
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = getSalesSnapshot().length + 1;
  const sale: PosSale = {
    id: uid('sale'), items, totalKobo, at: Date.now(), synced: false,
    receiptNo: `R-${day}-${String(count).padStart(3, '0')}`,
  };
  sCache = [sale, ...(sCache ?? getSalesSnapshot())];
  persist();
  void syncOutbox();
  return sale;
}

export function recordMove(m: Omit<StockMove, 'id' | 'at' | 'synced'>): StockMove {
  const move: StockMove = { ...m, id: uid('mv'), at: Date.now(), synced: false };
  mCache = [move, ...(mCache ?? getMovesSnapshot())];
  persist();
  void syncOutbox();
  return move;
}

/** Push unsynced records to the live API when online (best-effort). */
export async function syncOutbox(): Promise<{ pushed: number }> {
  if (!onlineNow()) return { pushed: 0 };
  let pushed = 0;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN ?? 'dev';
    const sales = getSalesSnapshot().filter((s) => !s.synced);
    const moves = getMovesSnapshot().filter((m) => !m.synced);
    for (const s of sales) {
      const r = await fetch(`${base}/pos/sales`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: s.items }),
      });
      if (r.ok) { s.synced = true; pushed++; }
    }
    for (const m of moves) {
      const r = await fetch(`${base}/pos/stock/moves`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sku: m.sku, deltaCartons: m.dCartons, deltaRolls: m.dRolls,
          deltaPacks: m.dPacks, deltaPieces: m.dPieces, reason: m.reason, note: m.note,
        }),
      });
      if (r.ok) { m.synced = true; pushed++; }
    }
    if (pushed) persist();
  } catch { /* stay offline — records are safe locally */ }
  return { pushed };
}

export function pendingCount(): number {
  return getSalesSnapshot().filter((s) => !s.synced).length
    + getMovesSnapshot().filter((m) => !m.synced).length;
}

/** Live balance per SKU from the seller's catalogue + all local moves. */
export function balanceFor(sku: string, base: { cartons: number; rolls: number; packs: number; pieces: number }): Record<UnitKind, number> {
  const bal = { ...base };
  for (const m of getMovesSnapshot()) {
    if (m.sku !== sku) continue;
    const sign = m.reason === 'return' || m.reason === 'restock' ? 1 : m.reason === 'correction' ? 1 : -1;
    // sale/damage subtract; return/restock add; correction stores absolute via note? keep signed deltas
    bal.cartons += m.reason === 'correction' ? m.dCartons : sign * Math.abs(m.dCartons);
    bal.rolls += m.reason === 'correction' ? m.dRolls : sign * Math.abs(m.dRolls);
    bal.packs += m.reason === 'correction' ? m.dPacks : sign * Math.abs(m.dPacks);
    bal.pieces += m.reason === 'correction' ? m.dPieces : sign * Math.abs(m.dPieces);
  }
  return bal;
}

export function totalsToday(): { salesKobo: number; n: number; damages: number; returns: number } {
  const day = new Date().toDateString();
  const sales = getSalesSnapshot().filter((s) => new Date(s.at).toDateString() === day);
  const moves = getMovesSnapshot().filter((m) => new Date(m.at).toDateString() === day);
  return {
    salesKobo: sales.reduce((n, s) => n + s.totalKobo, 0),
    n: sales.length,
    damages: moves.filter((m) => m.reason === 'damage').length,
    returns: moves.filter((m) => m.reason === 'return').length,
  };
}
