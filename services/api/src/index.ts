// @fmcg/api — modular monolith entry (ADR-0004). Health first, modules mount here.
import Fastify from 'fastify';
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

const app = Fastify({ logger: true });
registerErrorHandler(app);

app.get('/health', async () => ({ ok: true, service: 'fmcg-api', version: '0.1.0' }));

await app.register(identityRoutes, { prefix: '/api/identity' });
await app.register(catalogRoutes, { prefix: '/api/catalog' });
await app.register(searchRoutes, { prefix: '/api/search' });
await app.register(cartOrderRoutes, { prefix: '/api/cart-orders' });
await app.register(quoteRoutes, { prefix: '/api/quotes' });
await app.register(paymentRoutes, { prefix: '/api/payments' });
await app.register(logisticsRoutes, { prefix: '/api/logistics' });
await app.register(trustRoutes, { prefix: '/api/trust' });
await app.register(adminRoutes, { prefix: '/api/admin' });

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: '0.0.0.0' });
