'use client';
// Single-seller cart in localStorage. Key: one seller per cart (MVP rule).

export interface CartLine {
  productId: string;
  name: string;
  emoji: string;
  sellerId: string;
  unit: string;
  qty: number;
  unitKobo: number;
  image?: string; // product photo (cover)
}

const KEY = 'fmcg-cart-v1';

export function loadCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]): void {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function addToCart(line: CartLine): { lines: CartLine[]; replaced: boolean } {
  const cur = loadCart();
  let replaced = false;
  let next = cur;
  if (cur.length > 0 && cur[0].sellerId !== line.sellerId) {
    next = []; // single-seller rule: switching seller clears the cart
    replaced = true;
  }
  const i = next.findIndex((l) => l.productId === line.productId && l.unit === line.unit);
  if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + line.qty };
  else next = [...next, line];
  saveCart(next);
  return { lines: next, replaced };
}

export function setQty(productId: string, qty: number): CartLine[] {
  const next = loadCart()
    .map((l) => (l.productId === productId ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  saveCart(next);
  return next;
}

export function clearCart(): void {
  localStorage.removeItem(KEY);
}
