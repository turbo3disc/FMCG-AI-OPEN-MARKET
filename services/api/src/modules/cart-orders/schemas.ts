import { ApiError } from '../../common/errors.js';
import type { OrderStatus } from '../../../../../packages/shared/src/index.js';

export function validateCartLine(b: Record<string, unknown>): { offerId: string; qty: number } {
  const { offerId, qty } = b;
  if (typeof offerId !== 'string' || !offerId) throw ApiError.badRequest('offerId required');
  if (!Number.isInteger(qty) || (qty as number) < 1) throw ApiError.badRequest('qty must be integer >= 1');
  return { offerId, qty: qty as number };
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['completed', 'disputed'],
  completed: [],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
  refunded: [],
};

export function assertTransition(from: string, to: string): void {
  if (!((TRANSITIONS[from as OrderStatus] ?? []) as string[]).includes(to)) throw ApiError.badRequest(`illegal transition ${from} -> ${to}`, 'ORDER_TRANSITION');
}
