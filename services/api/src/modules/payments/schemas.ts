import { ApiError } from '../../common/errors.js';
import type { PaymentState } from '../../common/money.js';

export const PAYMENT_STATES: readonly PaymentState[] = [
  'PENDING', 'PROTECTED', 'OUT_FOR_DELIVERY', 'DELIVERED_PENDING_CONFIRMATION',
  'SETTLEMENT_PENDING', 'SETTLED', 'DISPUTED', 'REFUNDED',
  'COD_PENDING_COLLECTION', 'COD_RECONCILED',
] as const;

export function validateInitialize(b: Record<string, unknown>): { orderGroupId: string; method: 'card' | 'transfer' | 'cod'; provider?: string } {
  const { orderGroupId, method, provider } = b;
  if (typeof orderGroupId !== 'string' || !orderGroupId) throw ApiError.badRequest('orderGroupId required');
  if (!['card', 'transfer', 'cod'].includes(method as string)) throw ApiError.badRequest('method must be card|transfer|cod');
  return { orderGroupId, method: method as 'card' | 'transfer' | 'cod', provider: (provider as string | undefined) ?? 'fake' };
}
