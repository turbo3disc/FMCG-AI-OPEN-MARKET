import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import * as s from './service.js';
import { validateInitialize } from './schemas.js';

interface U { user?: { id: string; sellerId?: string } }

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.post('/initialize', { preHandler: [requireAuth] }, async (req) => {
    const v = validateInitialize((req.body ?? {}) as Record<string, unknown>);
    return s.initialize(v.orderGroupId, v.method, (req as unknown as U).user!.id);
  });
  // PSP webhook: raw body + x-signature header. No auth (provider-signed).
  app.post('/webhook', async (req) => {
    const body = (req.body ?? {}) as { providerRef: string; type: string; amountKobo?: number };
    return s.webhook(JSON.stringify(body), (req.headers as Record<string, string | undefined>)['x-signature'] ?? '', body);
  });
  app.get('/:id/status', { preHandler: [requireAuth] }, async (req) => s.status((req.params as { id: string }).id));
  app.post('/:id/refund', { preHandler: [requireAuth] }, async (req) =>
    s.refundRequest((req.params as { id: string }).id, (req as unknown as U).user!.id, (((req.body ?? {}) as { reason?: string }).reason ?? 'buyer request')),
  );
  app.get('/settlements/mine', { preHandler: [requireAuth] }, async (req) => {
    const u = (req as unknown as U).user!;
    return s.settlementsForSeller(u.sellerId ?? u.id);
  });
}
