import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../common/auth.js';
import * as s from './service.js';
import { validateModeration } from './schemas.js';

interface U { user?: { id: string } }

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Public: super-admin login with the default (or ADMIN_PASSWORD) password.
  // Returns a bearer token accepted by all requireRole('admin') endpoints.
  app.post('/login', async (req, reply) => {
    const { password } = (req.body ?? {}) as { password?: string };
    if (typeof password !== 'string' || !s.verifyAdminPassword(password)) {
      return reply.code(401).send({ error: 'wrong admin password', code: 'UNAUTHORIZED' });
    }
    return { accessToken: s.adminToken(), defaultPassword: s.isDefaultPassword() };
  });
  app.get('/users', { preHandler: [requireRole('admin')] }, async (req) =>
    s.listUsers((req.query as { status?: string } | undefined)?.status),
  );
  app.post('/users/:id/status', { preHandler: [requireRole('admin')] }, async (req) =>
    s.setUserStatus((req.params as { id: string }).id, ((req.body ?? {}) as { status: 'active' | 'suspended' }).status, (req as unknown as U).user!.id),
  );
  app.get('/sellers/pending', { preHandler: [requireRole('admin')] }, async () => s.pendingSellers());
  app.post('/sellers/:id/moderate', { preHandler: [requireRole('admin')] }, async (req) => {
    const body = (req.body ?? {}) as { status: string; tier?: number };
    const v = validateModeration(body);
    return s.moderateSeller((req.params as { id: string }).id, v.status as 'approved' | 'rejected' | 'suspended', body.tier, (req as unknown as U).user!.id);
  });
  app.get('/canonical/dedup', { preHandler: [requireRole('admin')] }, async () => s.dedupQueue());
  app.post('/canonical/merge', { preHandler: [requireRole('admin')] }, async (req) => {
    const b = (req.body ?? {}) as { keepId: string; dupeId: string };
    return s.mergeCanonical(b.keepId, b.dupeId, (req as unknown as U).user!.id);
  });
  app.get('/settlements', { preHandler: [requireRole('admin')] }, async () => s.settlementReview());
  app.get('/disputes/sla', { preHandler: [requireRole('admin')] }, async () => s.disputeSla());
  app.get('/analytics/summary', { preHandler: [requireRole('admin')] }, async () => s.analytics());
}
