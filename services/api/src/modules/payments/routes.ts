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
  // PSP webhook: provider-signed, no auth. Accepts Paystack native events
  // (charge.success → paid) and the normalized {providerRef,type} shape.
  app.post('/webhook', async (req) => {
    const headers = req.headers as Record<string, string | undefined>;
    const raw = (req as { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});
    const body = (req.body ?? {}) as Record<string, unknown>;
    if (typeof body.event === 'string' && body.data !== null && typeof body.data === 'object') {
      const { mapPaystackEvent } = await import('./paystack.js');
      const type = mapPaystackEvent(body.event);
      const ref = (body.data as { reference?: unknown }).reference;
      if (!type || typeof ref !== 'string') return { ignored: true };
      return s.webhook(raw, headers['x-paystack-signature'] ?? '', { providerRef: ref, type });
    }
    const norm = body as { providerRef: string; type: string; amountKobo?: number };
    return s.webhook(raw, headers['x-signature'] ?? '', norm);
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
