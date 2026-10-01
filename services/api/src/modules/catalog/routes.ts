import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../common/auth.js';
import { ApiError } from '../../common/errors.js';
import * as s from './service.js';
import { validateCanonical, validateOffer } from './schemas.js';

const sellerIdOf = (req: { user?: { id: string; sellerId?: string } }): string => req.user!.sellerId ?? req.user!.id;

export async function catalogRoutes(app: FastifyInstance): Promise<void> {
  app.get('/canonical', async (req) => s.listCanonical((req.query as { q?: string } | undefined)?.q));
  app.post('/canonical', { preHandler: [requireRole('admin')] }, async (req) =>
    s.createCanonical(validateCanonical((req.body ?? {}) as Record<string, unknown>), (req as { user?: { id: string } }).user!.id),
  );
  app.get('/canonical/:id', async (req) => s.getCanonical((req.params as { id: string }).id));

  app.get('/offers', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as { user?: { id: string; role: string; sellerId?: string } }).user!;
    const status = (req.query as { status?: string } | undefined)?.status;
    return s.listOffers(u.role === 'admin' ? undefined : (u.sellerId ?? u.id), status);
  });
  app.post('/offers', { preHandler: [requireAuth] }, async (req) =>
    s.createOffer(sellerIdOf(req as never), validateOffer((req.body ?? {}) as Record<string, unknown>)),
  );
  app.put('/offers/:id', { preHandler: [requireAuth] }, async (req) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    return s.updateOffer(sellerIdOf(req as never), (req.params as { id: string }).id, validateOffer({ title: 'tmp', priceKobo: 100, ...body }));
  });
  app.post('/offers/:id/publish', { preHandler: [requireAuth] }, async (req) =>
    s.setOfferStatus(sellerIdOf(req as never), (req.params as { id: string }).id, 'published'),
  );
  app.post('/offers/:id/pause', { preHandler: [requireAuth] }, async (req) =>
    s.setOfferStatus(sellerIdOf(req as never), (req.params as { id: string }).id, 'paused'),
  );
  app.delete('/offers/:id', { preHandler: [requireAuth] }, async (req) =>
    s.deleteOffer(sellerIdOf(req as never), (req.params as { id: string }).id),
  );

  app.get('/moderation', { preHandler: [requireRole('admin')] }, async () => s.moderationQueue());
  app.post('/moderation/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    const body = (req.body ?? {}) as { decision: string; canonicalProductId?: string };
    if (!['approve', 'reject'].includes(body.decision)) throw ApiError.badRequest('decision must be approve|reject');
    return s.moderateOffer((req.params as { id: string }).id, body.decision as 'approve' | 'reject', body.canonicalProductId, (req as { user?: { id: string } }).user!.id);
  });

  app.post('/uploads/sign', { preHandler: [requireAuth] }, async (req) => {
    const filename = ((req.body ?? {}) as { filename?: string }).filename;
    if (!filename) throw ApiError.badRequest('filename required');
    return s.signedUploadUrl((req as { user?: { id: string } }).user!.id, filename);
  });
}
