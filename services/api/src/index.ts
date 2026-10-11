// @fmcg/api — modular monolith entry (ADR-0004). Health first, modules mount here.
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerErrorHandler } from './common/errors.js';
import { identityRoutes } from './modules/identity/routes.js';
import { catalogRoutes } from './modules/catalog/routes.js';
import { searchRoutes } from './modules/search/routes.js';
import { cartOrderRoutes } from './modules/cart-orders/routes.js';
import { quoteRoutes } from './modules/quotes/routes.js';
import { paymentRoutes } from './modules/payments/routes.js';
import { logisticsRoutes } from './modules/logistics/routes.js';
import { trustRoutes } from './modules/trust/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { salesRoutes } from './modules/sales/routes.js';

const app = Fastify({ logger: true, trustProxy: true });
registerErrorHandler(app);

// CORS must be registered before routes so the public web frontend can call
// the API from a different domain (Vercel web + Render API split, no Netlify).
await app.register(cors, {
  origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((s) => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
});

// Capture the raw JSON body for HMAC webhook verification (Paystack signs exact bytes).
app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  (req as unknown as { rawBody?: string }).rawBody = body as string;
  try {
    done(null, JSON.parse(body as string));
  } catch (err) {
    done(err as Error, undefined);
  }
});

app.get('/health', async () => ({ ok: true, service: 'fmcg-api', version: '0.1.0' }));
app.get('/', async () => ({ ok: true, service: 'fmcg-api', docs: '/health' }));
app.get('/ready', async () => {
  try {
    const { pool } = await import('./db/pool.js');
    await pool.query('SELECT 1');
    return { ok: true, db: 'up' };
  } catch {
    return { ok: false, db: 'down' };
  }
});

await app.register(identityRoutes, { prefix: '/api/identity' });
await app.register(catalogRoutes, { prefix: '/api/catalog' });
await app.register(searchRoutes, { prefix: '/api/search' });
await app.register(cartOrderRoutes, { prefix: '/api/cart-orders' });
await app.register(quoteRoutes, { prefix: '/api/quotes' });
await app.register(paymentRoutes, { prefix: '/api/payments' });
await app.register(logisticsRoutes, { prefix: '/api/logistics' });
await app.register(trustRoutes, { prefix: '/api/trust' });
await app.register(adminRoutes, { prefix: '/api/admin' });
await app.register(salesRoutes, { prefix: '/api/pos' });

const port = Number(process.env.PORT ?? 3001);
try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
