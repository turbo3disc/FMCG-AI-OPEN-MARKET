import { ApiError } from '../../common/errors.js';

export const REVIEW_REASONS = ['expired', 'damaged', 'wrong-item', 'late', 'overpriced', 'great-quality', 'fast-delivery'] as const;

export function validateReview(b: Record<string, unknown>): { orderId: string; rating: number; reasons?: string[]; comment?: string } {
  const { orderId, rating, reasons, comment } = b;
  if (typeof orderId !== 'string' || !orderId) throw ApiError.badRequest('orderId required');
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) throw ApiError.badRequest('rating must be 1–5');
  if (reasons !== undefined) {
    if (!Array.isArray(reasons)) throw ApiError.badRequest('reasons must be an array');
    for (const r of reasons as string[]) if (!(REVIEW_REASONS as readonly string[]).includes(r)) throw ApiError.badRequest(`invalid reason: ${r}`);
  }
  return { orderId, rating: rating as number, reasons: reasons as string[] | undefined, comment: comment as string | undefined };
}

export function validateDispute(b: Record<string, unknown>): { orderId: string; reason: string; details?: string } {
  const { orderId, reason, details } = b;
  if (typeof orderId !== 'string' || !orderId) throw ApiError.badRequest('orderId required');
  if (typeof reason !== 'string' || !reason) throw ApiError.badRequest('reason required');
  return { orderId, reason, details: details as string | undefined };
}
