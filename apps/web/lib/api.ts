// Typed fetch client for the Fastify API — mirrors services/api prefixes exactly.
// Falls back to demo data on failure (pages wrap calls in tryApi).
// Base URL defaults to http://localhost:3001/api (see next.config.js env).

const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:3001/api';

// Dev token accepted by services/api/src/common/auth.ts:
// 'dev' (default buyer) or 'dev:<userId>:<role>:<tier>[:<sellerId>]',
// e.g. 'dev:u1:admin:2'. NEVER ship a real app with this.
const DEV_TOKEN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEV_TOKEN) || 'dev';

export interface ApiError {
  message: string;
  status: number;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEV_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${path}: ${body || res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Try the live API, fall back to demo data when the backend is unreachable. */
export async function tryApi<T>(live: () => Promise<T>, demo: T): Promise<T> {
  try {
    return await live();
  } catch {
    return demo;
  }
}

const q = (params: Record<string, string | number | undefined>): string => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const api = {
  base: BASE,
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    req<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),
  patch: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => req<T>(path, { method: 'DELETE' }),

  // identity — POST /api/identity/*
  register: (body: { phone?: string; email?: string; password?: string; buyerType?: string }) =>
    req<{ user: unknown }>(`/identity/register`, { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body: { phone: string; code: string }) =>
    req<{ tokens: unknown }>(`/identity/otp/verify`, { method: 'POST', body: JSON.stringify(body) }),
  me: () => req<{ user: unknown }>(`/identity/me`),

  // search — GET /api/search/?q&lat&lng&radius_km&unit_type&min_qty
  // → { results, alternatives, count }
  search: (params: { q?: string; lat?: number; lng?: number; radius_km?: number; unit_type?: string; min_qty?: number }) =>
    req<{ results: unknown[]; alternatives: unknown[]; count: number }>(`/search/${q(params)}`),

  // catalog — /api/catalog/offers/*, /canonical/*
  offers: (sellerId?: string) =>
    req<unknown[]>(`/catalog/offers${q({ sellerId })}`),
  getOffer: (id: string) => req<{ offer: unknown }>(`/catalog/offers/${id}`),
  getCanonical: (id: string) => req<{ product: unknown }>(`/catalog/canonical/${id}`),

  // cart + orders — /api/cart-orders/*
  getCart: () => req<{ cart: unknown; items: unknown[] }>(`/cart-orders/cart`),
  addCartItem: (body: { offerId: string; qty: number }) =>
    req<unknown>(`/cart-orders/cart/items`, { method: 'POST', body: JSON.stringify(body) }),
  clearCart: () => req<{ cleared: boolean }>(`/cart-orders/cart`, { method: 'DELETE' }),
  // NOTE: idempotency key travels as a HEADER (backend reads Idempotency-Key).
  // → { group, order }
  checkout: (body: { addressId?: string }, idempotencyKey: string) =>
    req<{ group: unknown; order: unknown }>(`/cart-orders/checkout`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  listOrders: () => req<unknown[]>(`/cart-orders/orders`),
  getOrder: (id: string) => req<{ order: unknown; items: unknown[] }>(`/cart-orders/orders/${id}`),
  transitionOrder: (id: string, to: string) =>
    req<unknown>(`/cart-orders/orders/${id}/transition`, { method: 'POST', body: JSON.stringify({ to }) }),
  reorder: (id: string) =>
    req<unknown>(`/cart-orders/orders/${id}/reorder`, { method: 'POST', body: JSON.stringify({}) }),

  // quotes — /api/quotes/* (RFQ is singular)
  createRfq: (body: { sellerId?: string; canonicalProductId?: string; title: string; qty: number; unit_type?: string; targetPriceKobo?: number }) =>
    req<{ quote: unknown }>(`/quotes/rfq`, { method: 'POST', body: JSON.stringify(body) }),
  listQuotes: () => req<unknown[]>(`/quotes/`),
  respondQuote: (id: string, body: { priceKobo: number; qty?: number; note?: string }) =>
    req<unknown>(`/quotes/${id}/respond`, { method: 'POST', body: JSON.stringify(body) }),
  acceptQuote: (id: string) =>
    req<{ order: unknown; group: unknown; poRef: string }>(`/quotes/${id}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  declineQuote: (id: string) =>
    req<unknown>(`/quotes/${id}/decline`, { method: 'POST', body: JSON.stringify({}) }),

  // payments — /api/payments/*
  initPayment: (body: { orderId: string; method?: string }) =>
    req<unknown>(`/payments/initialize`, { method: 'POST', body: JSON.stringify(body) }),
  paymentStatus: (id: string) => req<unknown>(`/payments/${id}/status`),
  mySettlements: () => req<unknown[]>(`/payments/settlements/mine`),

  // logistics — /api/logistics/*
  listJobs: (driverId?: string) => req<unknown[]>(`/logistics/jobs${q({ driverId })}`),
  acceptJob: (id: string) =>
    req<unknown>(`/logistics/jobs/${id}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  pickupJob: (id: string) =>
    req<unknown>(`/logistics/jobs/${id}/pickup`, { method: 'POST', body: JSON.stringify({}) }),
  deliverJob: (id: string, body: { otp: string; photoUrl?: string; signature?: string }) =>
    req<unknown>(`/logistics/jobs/${id}/deliver`, { method: 'POST', body: JSON.stringify(body) }),
  collectCod: (id: string, body: { amountKobo: number; method: string }) =>
    req<unknown>(`/logistics/jobs/${id}/cod-collect`, { method: 'POST', body: JSON.stringify(body) }),

  // trust — /api/trust/*
  createReview: (body: { orderId: string; rating: number; reason?: string; text?: string }) =>
    req<unknown>(`/trust/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  openDispute: (body: { orderId: string; reason: string; detail?: string }) =>
    req<unknown>(`/trust/disputes`, { method: 'POST', body: JSON.stringify(body) }),
  addEvidence: (id: string, body: { kind: string; url?: string; note?: string }) =>
    req<unknown>(`/trust/disputes/${id}/evidence`, { method: 'POST', body: JSON.stringify(body) }),
};
