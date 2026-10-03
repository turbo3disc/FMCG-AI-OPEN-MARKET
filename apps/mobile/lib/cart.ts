// Single-seller AsyncStorage cart. Adding from a different seller resets the cart.
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartLine {
  productId: string;
  sellerId: string;
  qty: number;
}

export interface Cart {
  sellerId: string | null;
  lines: CartLine[];
}

const KEY = 'fmcg.cart.v1';

export const emptyCart: Cart = { sellerId: null, lines: [] };

export async function loadCart(): Promise<Cart> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyCart;
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.lines)) return emptyCart;
    return parsed;
  } catch {
    return emptyCart;
  }
}

export async function saveCart(cart: Cart): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(cart));
}

export async function clearCart(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Add a line; returns { reset: true } when a different seller cleared the cart. */
export async function addToCart(productId: string, sellerId: string, qty: number): Promise<{ reset: boolean; cart: Cart }> {
  const current = await loadCart();
  let cart: Cart;
  let reset = false;
  if (current.sellerId && current.sellerId !== sellerId) {
    cart = { sellerId, lines: [{ productId, sellerId, qty }] };
    reset = true;
  } else {
    const lines = [...current.lines];
    const i = lines.findIndex((l) => l.productId === productId && l.sellerId === sellerId);
    if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + qty };
    else lines.push({ productId, sellerId, qty });
    cart = { sellerId, lines };
  }
  await saveCart(cart);
  return { reset, cart };
}

export async function updateQty(productId: string, qty: number): Promise<Cart> {
  const current = await loadCart();
  const lines =
    qty <= 0
      ? current.lines.filter((l) => l.productId !== productId)
      : current.lines.map((l) => (l.productId === productId ? { ...l, qty } : l));
  const cart: Cart = { sellerId: lines.length ? current.sellerId : null, lines };
  await saveCart(cart);
  return cart;
}
