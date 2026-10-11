import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import { resolveSeller } from '../catalog/service.js';
import * as s from './service.js';
import { validateMove, validateSale, validateSubscribe } from './schemas.js';

interface U { user?: { id: string } }

export async function salesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/subscriptions/mine', { preHandler: [requireAuth] }, async (req) =>
    s.mySubscription((req as unknown as U).user!.id),
  );
  app.post('/subscriptions/subscribe', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    return s.subscribe(u.id, validateSubscribe((req.body ?? {}) as Record<string, unknown>).plan, u.id);
  });

  app.post('/sales', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    const sid = await resolveSeller(u.id);
    return s.recordSale(sid, validateSale((req.body ?? {}) as Record<string, unknown>).items);
  });
  app.get('/sales', { preHandler: [requireAuth] }, async (req) =>
    s.listSales(await resolveSeller((req as unknown as U).user!.id)),
  );

  app.post('/stock/moves', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    return s.recordMove(await resolveSeller(u.id), validateMove((req.body ?? {}) as Record<string, unknown>));
  });
  app.get('/stock/moves', { preHandler: [requireAuth] }, async (req) =>
    s.listMoves(await resolveSeller((req as unknown as U).user!.id), (req.query as { reason?: string }).reason),
  );
}
