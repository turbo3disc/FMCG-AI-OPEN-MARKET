// Typed fetch client for the Fastify API. Falls back to demo data on failure.
// Base URL defaults to http://localhost:3001/api (see next.config.js env).

const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:3001/api';

const DEV_TOKEN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEV_TOKEN) || 'dev-bearer-token';

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

export const api = {
  base: BASE,
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  // Typed module helpers (mirror docs/api-contracts)
  search: (q: string) => req<{ offers: unknown[] }>(`/search?q=${encodeURIComponent(q)}`),
  getProduct: (id: string) => req<{ product: unknown }>(`/catalog/products/${id}`),
  getCart: () => req<{ lines: unknown[] }>(`/cart`),
  checkout: (body: { idempotencyKey: string }) =>
    req<{ orderGroupId: string }>(`/orders/checkout`, body),
  getOrder: (id: string) => req<{ order: unknown }>(`/orders/${id}`),
  createRfq: (body: { title: string; lines: unknown[] }) =>
    req<{ rfqId: string }>(`/quotes/rfqs`, body),
  listQuotes: () => req<{ quotes: unknown[] }>(`/quotes`),
};
