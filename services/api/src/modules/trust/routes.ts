import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../common/auth.js';
import * as s from './service.js';
import { validateDispute, validateReview } from './schemas.js';

interface U { user?: { id: string } }

export async function trustRoutes(app: FastifyInstance): Promise<void> {
  app.post('/reviews', { preHandler: [requireAuth] }, async (req) =>
    s.createReview((req as unknown as U).user!.id, validateReview((req.body ?? {}) as Record<string, unknown>)),
  );
  app.get('/reviews/:sellerId', async (req) => s.listReviews((req.params as { sellerId: string }).sellerId));
  app.post('/reports', { preHandler: [requireAuth] }, async (req) => {
    const b = (req.body ?? {}) as { entity: string; entityId: string; reason: string };
    return s.createReport((req as unknown as U).user!.id, b.entity, b.entityId, b.reason);
  });
  app.post('/disputes', { preHandler: [requireAuth] }, async (req) =>
    s.openDispute((req as unknown as U).user!.id, validateDispute((req.body ?? {}) as Record<string, unknown>)),
  );
  app.get('/disputes', { preHandler: [requireAuth] }, async (req) =>
    s.listDisputes((req.query as { status?: string } | undefined)?.status),
  );
  app.post('/disputes/:id/evidence', { preHandler: [requireAuth] }, async (req) => {
    const b = (req.body ?? {}) as { url: string; note?: string };
    return s.addEvidence((req.params as { id: string }).id, (req as unknown as U).user!.id, b.url, b.note);
  });
  app.post('/disputes/:id/resolve', { preHandler: [requireRole('admin')] }, async (req) => {
    const b = (req.body ?? {}) as { ruling: 'buyer' | 'seller' | 'split'; resolution: string; refundKobo?: number };
    return s.resolveDispute((req.params as { id: string }).id, b.ruling, b.resolution, (req as unknown as U).user!.id, b.refundKobo ?? 0);
  });
}
