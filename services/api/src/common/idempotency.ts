// In-memory idempotency key store (Redis in prod). Keyed per endpoint+key.
import type { FastifyRequest } from 'fastify';
import { ApiError } from './errors.js';

const store = new Map<string, { status: number; body: unknown; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

export function idempotencyKey(req: FastifyRequest, scope: string): string {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || !key) throw ApiError.badRequest('Idempotency-Key header required', 'IDEMPOTENCY_KEY');
  return `${scope}:${req.user?.id ?? 'anon'}:${key}`;
}

export function idempotent<T>(key: string, fn: () => Promise<{ status: number; body: T }>): Promise<{ status: number; body: T; replayed: boolean }> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return Promise.resolve({ status: hit.status, body: hit.body as T, replayed: true });
  }
  return fn().then((res) => {
    store.set(key, { ...res, at: Date.now() });
    return { ...res, replayed: false };
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) if (now - v.at > TTL_MS) store.delete(k);
}, 60 * 60 * 1000).unref?.();
