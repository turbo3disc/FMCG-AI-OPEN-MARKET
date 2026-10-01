import type { FastifyInstance } from 'fastify';
import { searchOffers } from './service.js';
import { validateSearch } from './schemas.js';

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  // Guest-browse allowed: no auth (PRD ACC guest policy).
  app.get('/', async (req) => searchOffers(validateSearch((req.query ?? {}) as Record<string, string | undefined>)));
}
