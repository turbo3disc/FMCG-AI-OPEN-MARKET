import { ApiError } from '../../common/errors.js';

export function validateRfq(b: Record<string, unknown>): { sellerId?: string; canonicalProductId?: string; title: string; qty: number; unitType: string; targetPriceKobo?: number; expiresInHours: number } {
  const { sellerId, canonicalProductId, title, qty, unitType, targetPriceKobo, expiresInHours } = b as Record<string, string | number | undefined>;
  if (typeof title !== 'string' || !title) throw ApiError.badRequest('title required');
  if (!Number.isInteger(qty) || (qty as number) < 1) throw ApiError.badRequest('qty must be integer >= 1');
  const ut = (unitType as string) ?? 'carton';
  if (!['piece', 'pack', 'carton'].includes(ut)) throw ApiError.badRequest('invalid unitType');
  return { sellerId: sellerId as string | undefined, canonicalProductId: canonicalProductId as string | undefined, title, qty: qty as number, unitType: ut, targetPriceKobo: targetPriceKobo as number | undefined, expiresInHours: (expiresInHours as number | undefined) ?? 72 };
}

export function validateQuoteVersion(b: Record<string, unknown>): { priceKobo: number; qty?: number; note?: string } {
  const { priceKobo, qty, note } = b as Record<string, string | number | undefined>;
  if (!Number.isInteger(priceKobo) || (priceKobo as number) <= 0) throw ApiError.badRequest('priceKobo must be positive integer kobo');
  return { priceKobo: priceKobo as number, qty: qty as number | undefined, note: note as string | undefined };
}
