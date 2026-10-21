// Seller inventory store — manual product entry (brand, name, size, SKU,
// cartons, rolls, packs, pieces) with draft → live publishing.
// Persists in the browser (localStorage); the same shape maps 1:1 onto the
// live API (POST /api/catalog/offers → POST /offers/:id/publish) once a
// seller login token is configured — see docs/DEPLOY.md.
'use client';

export type OfferStatus = 'draft' | 'live' | 'paused';

export interface SellerProduct {
  id: string;
  brand: string;
  name: string;
  size: string;
  sku: string;
  category: string;
  sellBy: 'carton' | 'pack' | 'roll' | 'piece';
  cartons: number;
  rolls: number;
  packs: number;
  pieces: number;
  priceKobo: number; // per sell-by unit
  moq: number;
  status: OfferStatus;
  createdAt: number;
  images: string[]; // product photos (cover first) — carton/pack shots
  sellerName?: string;
  sellerArea?: string;
  sellerLat?: string;
  sellerLng?: string;
}

const KEY = 'fmcg-seller-inventory-v1';
const EMPTY: SellerProduct[] = [];

let cache: SellerProduct[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): SellerProduct[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SellerProduct[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Stable snapshot for useSyncExternalStore (never a fresh array per call). */
export function getInventorySnapshot(): SellerProduct[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

/** Server snapshot — stable empty reference (no infinite loop). */
export function getInventoryServerSnapshot(): SellerProduct[] {
  return EMPTY;
}

export function subscribeInventory(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => { cache = null; listeners.forEach((l) => l()); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

function save(items: SellerProduct[]): void {
  cache = items;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

const uid = () =>
  `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Auto-SKU from brand + size, e.g. "Indomie", "40×70g" → "IND-40X70G". */
export function suggestSku(brand: string, size: string, category: string): string {
  const b = (brand.replace(/[^a-z0-9]/gi, '').slice(0, 3) || 'GEN').toUpperCase();
  const s = (size.replace(/[^a-z0-9]/gi, '').slice(0, 6) || category.slice(0, 3)).toUpperCase();
  const r = Math.floor(100 + Math.random() * 900);
  return `${b}-${s}-${r}`;
}

export function loadInventory(): SellerProduct[] {
  return getInventorySnapshot().slice();
}

export function skuTaken(items: SellerProduct[], sku: string, exceptId?: string): boolean {
  const s = sku.trim().toLowerCase();
  return items.some((p) => p.sku.trim().toLowerCase() === s && p.id !== exceptId);
}

export function upsertProduct(p: SellerProduct): SellerProduct[] {
  const items = loadInventory();
  const i = items.findIndex((x) => x.id === p.id);
  const next = i >= 0 ? items.map((x) => (x.id === p.id ? p : x)) : [p, ...items];
  save(next);
  return next;
}

export function newProduct(): SellerProduct {
  return {
    id: uid(), brand: '', name: '', size: '', sku: '', category: 'Groceries',
    sellBy: 'carton', cartons: 0, rolls: 0, packs: 0, pieces: 0,
    priceKobo: 0, moq: 1, status: 'draft', createdAt: Date.now(), images: [],
  };
}

export function setStatus(id: string, status: OfferStatus): SellerProduct[] {
  const next = loadInventory().map((p) => (p.id === id ? { ...p, status } : p));
  save(next);
  return next;
}

/** Bulk command — make every product live (or pause all) for buyers at once. */
export function setAllStatus(status: OfferStatus): SellerProduct[] {
  const next = loadInventory().map((p) => ({ ...p, status }));
  save(next);
  return next;
}

export function removeProduct(id: string): SellerProduct[] {
  const next = loadInventory().filter((p) => p.id !== id);
  save(next);
  return next;
}

export const liveProducts = (items: SellerProduct[]): SellerProduct[] =>
  items.filter((p) => p.status === 'live');

export function stockLabel(p: SellerProduct): string {
  const bits: string[] = [];
  if (p.cartons > 0) bits.push(`${p.cartons} carton${p.cartons === 1 ? '' : 's'}`);
  if (p.rolls > 0) bits.push(`${p.rolls} roll${p.rolls === 1 ? '' : 's'}`);
  if (p.packs > 0) bits.push(`${p.packs} pack${p.packs === 1 ? '' : 's'}`);
  if (p.pieces > 0) bits.push(`${p.pieces} pc${p.pieces === 1 ? '' : 's'}`);
  return bits.length ? bits.join(' • ') : 'Out of stock';
}

export function totalUnits(p: SellerProduct): number {
  return p.cartons + p.rolls + p.packs + p.pieces;
}

export const KNOWN_BRANDS = [
  'Indomie', 'Dangote', 'Golden Penny', 'Kings', 'Mama Pride', 'Peak',
  'Milo', 'Coca-Cola', 'Chivita', 'Nestle', 'Close-Up', 'Morning Fresh',
  'Omo', 'Dettol', 'Ayoola', 'Golden Morn', 'Three Crowns', 'Sunlight', 'Pears',
];

export function useInventory(): SellerProduct[] {
  // Non-hook helper for client components: load + subscribe to changes.
  // Implemented with useSyncExternalStore in components that need reactivity.
  return loadInventory();
}
