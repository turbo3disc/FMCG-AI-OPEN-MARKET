import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import * as s from './service.js';
import { validateQuoteVersion, validateRfq } from './schemas.js';

interface U { user?: { id: string; role: string } }

export async function quoteRoutes(app: FastifyInstance): Promise<void> {
  app.post('/rfq', { preHandler: [requireAuth] }, async (req) =>
    s.createRfq((req as unknown as U).user!.id, validateRfq((req.body ?? {}) as Record<string, unknown>)),
  );
  app.get('/', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    return s.listQuotes(u.id, u.role);
  });
  app.post('/:id/respond', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    const v = validateQuoteVersion((req.body ?? {}) as Record<string, unknown>);
    return s.respond((req.params as { id: string }).id, u.role === 'seller' ? 'seller' : 'buyer', v.priceKobo, v.qty, v.note, u.id);
  });
  app.post('/:id/accept', { preHandler: [requireAuth] }, async (req) =>
    s.accept((req.params as { id: string }).id, ((req.body ?? {}) as { versionId: string }).versionId, (req as unknown as U).user!.id),
  );
  app.post('/:id/decline', { preHandler: [requireAuth] }, async (req) =>
    s.decline((req.params as { id: string }).id, (req as unknown as U).user!.id),
  );
  app.post('/expire-run', async () => s.expireQuotes());
}
