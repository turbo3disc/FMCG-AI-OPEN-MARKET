// Dev auth stub (ADR-0007). Real JWT + OTP + Tier gates land later.
// Accepts: `Bearer dev` (default buyer) or the base64url token issued by
// identity (`dev:<userId>:<role>:<tier>:<ts>`), or plain `dev:<userId>:<role>:<tier>`.
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from './errors.js';

export interface AuthUser {
  id: string;
  role: 'buyer' | 'seller' | 'admin' | 'driver';
  tier: number;
  sellerId?: string;
  context?: 'buyer' | 'seller';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

function splitToken(token: string): string[] {
  if (token === 'dev' || token === 'dev-token' || token.startsWith('dev:')) return token.split(':');
  // Identity service issues base64url("dev:<userId>:<role>:<tier>:<ts>") — decode it.
  try {
    const dec = Buffer.from(token, 'base64url').toString('utf8');
    if (dec.startsWith('dev:')) return dec.split(':');
  } catch {
    /* not base64 — fall through to unauthorized */
  }
  return [token];
}

function parseDevToken(header: string | undefined): AuthUser {
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized('missing bearer token');
  const token = header.slice(7).trim();
  if (token === 'dev' || token === 'dev-token') {
    return { id: 'dev-buyer-1', role: 'buyer', tier: 1, context: 'buyer' };
  }
  const parts = splitToken(token);
  if (parts[0] !== 'dev' || parts.length < 2) throw ApiError.unauthorized('invalid dev token');
  const [, id, role = 'buyer', tier = '1'] = parts;
  if (!id || !['buyer', 'seller', 'admin', 'driver'].includes(role)) {
    throw ApiError.unauthorized('invalid dev role');
  }
  return {
    id,
    role: role as AuthUser['role'],
    tier: Number(tier) || 1,
    context: role === 'seller' ? 'seller' : 'buyer',
  };
}

export async function requireAuth(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  req.user = parseDevToken(req.headers.authorization);
}

export function requireRole(...roles: AuthUser['role'][]): (req: FastifyRequest) => Promise<void> {
  return async (req: FastifyRequest) => {
    if (!req.user) req.user = parseDevToken(req.headers.authorization);
    if (!roles.includes(req.user.role)) throw ApiError.forbidden(`requires role: ${roles.join('|')}`);
  };
}

export function requireTier(min: number): (req: FastifyRequest) => Promise<void> {
  return async (req: FastifyRequest) => {
    if (!req.user) req.user = parseDevToken(req.headers.authorization);
    if (req.user.tier < min) throw ApiError.forbidden(`requires verification tier ${min}+`);
  };
}
