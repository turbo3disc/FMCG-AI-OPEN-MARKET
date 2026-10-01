import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth.js';
import * as s from './service.js';
import { validateAddress, validateLogin, validateOtp, validateRegister } from './schemas.js';

interface Authed {
  user?: { id: string; role: string; sellerId?: string };
  body: Record<string, unknown>;
  params: { id: string };
  query: { status?: string };
}

export async function identityRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', async (req, reply) => {
    const out = await s.register(validateRegister((req.body ?? {}) as Record<string, unknown>));
    return reply.code(201).send(out);
  });
  app.post('/otp/verify', async (req) => {
    const { phone, code } = validateOtp((req.body ?? {}) as Record<string, unknown>);
    return s.verifyOtp(phone, code);
  });
  app.post('/login', async (req) => s.login(validateLogin((req.body ?? {}) as Record<string, unknown>)));
  app.post('/refresh', async (req) => s.refresh(((req.body ?? {}) as { refreshToken?: string }).refreshToken ?? ''));

  app.get('/me', { preHandler: [requireAuth] }, async (req) => s.getMe((req as unknown as Authed).user!.id));
  app.post('/profile/switch', { preHandler: [requireAuth] }, async (req) =>
    s.switchContext((req as unknown as Authed).user!.id, ((req.body ?? {}) as { context: 'buyer' | 'seller' }).context),
  );

  app.get('/addresses', { preHandler: [requireAuth] }, async (req) => s.listAddresses((req as unknown as Authed).user!.id));
  app.post('/addresses', { preHandler: [requireAuth] }, async (req) => {
    const r = req as unknown as Authed;
    return s.createAddress(r.user!.id, validateAddress(r.body));
  });
  app.put('/addresses/:id', { preHandler: [requireAuth] }, async (req) => {
    const r = req as unknown as Authed;
    return s.updateAddress(r.user!.id, r.params.id, r.body as { label: string; line1: string; city: string });
  });
  app.delete('/addresses/:id', { preHandler: [requireAuth] }, async (req) => {
    const r = req as unknown as Authed;
    return s.deleteAddress(r.user!.id, r.params.id);
  });
}
