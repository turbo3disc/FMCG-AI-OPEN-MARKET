import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import * as s from './service.js';
import { validateJob, validatePod } from './schemas.js';

interface U { user?: { id: string } }

export async function logisticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/partners', async () => s.listPartners());
  app.post('/partners', { preHandler: [requireAuth] }, async (req) =>
    s.createPartner(((req.body ?? {}) as { name: string }).name, (req as unknown as U).user!.id),
  );
  app.get('/drivers', async (req) => s.listDrivers((req.query as { partnerId?: string } | undefined)?.partnerId));
  app.post('/drivers', { preHandler: [requireAuth] }, async (req) => {
    const b = (req.body ?? {}) as { partnerId: string; name: string; phone: string };
    return s.createDriver(b.partnerId, b.name, b.phone);
  });

  app.get('/jobs', { preHandler: [requireAuth] }, async (req) => s.listJobs((req.query as { driverId?: string } | undefined)?.driverId));
  app.post('/jobs', { preHandler: [requireAuth] }, async (req) => {
    const v = validateJob((req.body ?? {}) as Record<string, unknown>);
    return s.assignJob(v.orderId, v.partnerId, v.driverId, (req as unknown as U).user!.id);
  });
  app.post('/jobs/:id/accept', { preHandler: [requireAuth] }, async (req) =>
    s.acceptJob((req.params as { id: string }).id, (req as unknown as U).user!.id),
  );
  app.post('/jobs/:id/pickup', { preHandler: [requireAuth] }, async (req) =>
    s.pickupJob((req.params as { id: string }).id, (req as unknown as U).user!.id),
  );
  app.post('/jobs/:id/deliver', { preHandler: [requireAuth] }, async (req) =>
    s.deliverJob((req.params as { id: string }).id, validatePod((req.body ?? {}) as Record<string, unknown>), (req as unknown as U).user!.id),
  );
  app.post('/jobs/:id/cod-collect', { preHandler: [requireAuth] }, async (req) =>
    s.collectCod((req.params as { id: string }).id, ((req.body ?? {}) as { amountKobo: number }).amountKobo, (req as unknown as U).user!.id),
  );
  app.post('/jobs/:id/cod-reconcile', { preHandler: [requireAuth] }, async (req) =>
    s.reconcileCod((req.params as { id: string }).id, (req as unknown as U).user!.id),
  );
  app.post('/jobs/:id/exception', { preHandler: [requireAuth] }, async (req) =>
    s.reportException((req.params as { id: string }).id, ((req.body ?? {}) as { note: string }).note, (req as unknown as U).user!.id),
  );
}
