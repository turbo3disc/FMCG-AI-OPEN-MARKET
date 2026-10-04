import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import { idempotent, idempotencyKey } from '../../common/idempotency.js';
import * as s from './service.js';
import { validateCartLine } from './schemas.js';

interface U { user?: { id: string; role: string } }

export async function cartOrderRoutes(app: FastifyInstance): Promise<void> {
  app.get('/cart', { preHandler: [requireAuth] }, async (req) => s.getCart((req as unknown as U).user!.id));
  app.post('/cart/items', { preHandler: [requireAuth] }, async (req) => {
    const { offerId, qty } = validateCartLine((req.body ?? {}) as Record<string, unknown>);
    return s.addToCart((req as unknown as U).user!.id, offerId, qty);
  });
  app.delete('/cart', { preHandler: [requireAuth] }, async (req) => s.clearCart((req as unknown as U).user!.id));

  app.post('/checkout', { preHandler: [requireAuth] }, async (req) => {
    const key = idempotencyKey(req, 'checkout');
    const uid = (req as unknown as U).user!.id;
    const addressId = ((req.body ?? {}) as { addressId?: string }).addressId;
    const out = await idempotent(key, async () => ({ status: 201, body: await s.checkout(uid, addressId) }));
    return out.body;
  });

  app.get('/orders', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    return s.listOrders(u.id, u.role);
  });
  app.get('/orders/:id', { preHandler: [requireAuth] }, async (req) =>
    s.getOrder((req.params as { id: string }).id, (req as unknown as U).user!.id),
  );
  app.post('/orders/:id/transition', { preHandler: [requireAuth] }, async (req) =>
    s.transitionOrder((req.params as { id: string }).id, ((req.body ?? {}) as { to: string }).to, (req as unknown as U).user!.id),
  );
  app.post('/orders/:id/reorder', { preHandler: [requireAuth] }, async (req) =>
    s.reorder((req as unknown as U).user!.id, (req.params as { id: string }).id),
  );
}
