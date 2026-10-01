import { ApiError } from '../../common/errors.js';

export function validateCanonical(b: Record<string, unknown>): { name: string; brand?: string; category: string; sku: string; unitTypes: string[] } {
  const { name, brand, category, sku, unitTypes } = b;
  if (typeof name !== 'string' || !name) throw ApiError.badRequest('name required');
  if (typeof category !== 'string' || !category) throw ApiError.badRequest('category required');
  if (typeof sku !== 'string' || !sku) throw ApiError.badRequest('sku required');
  const ut = Array.isArray(unitTypes) && unitTypes.length ? unitTypes : ['piece'];
  for (const u of ut) if (!['piece', 'pack', 'carton'].includes(u as string)) throw ApiError.badRequest(`invalid unit type: ${u}`);
  return { name, brand: brand as string | undefined, category, sku, unitTypes: ut as string[] };
}

export interface OfferInput {
  canonicalProductId?: string;
  title: string;
  priceKobo: number;
  bulkBreaks?: Array<{ minQty: number; priceKobo: number }>;
  moq?: number;
  unitType?: string;
  onHand?: number;
}

export function validateOffer(b: Record<string, unknown>): OfferInput {
  const { canonicalProductId, title, priceKobo, bulkBreaks, moq, unitType, onHand } = b as Record<string, never>;
  if (typeof title !== 'string' || !title) throw ApiError.badRequest('title required');
  if (!Number.isInteger(priceKobo) || (priceKobo as number) <= 0) throw ApiError.badRequest('priceKobo must be positive integer kobo');
  if (unitType !== undefined && !['piece', 'pack', 'carton'].includes(unitType as string)) throw ApiError.badRequest('invalid unit_type');
  if (moq !== undefined && (!Number.isInteger(moq) || (moq as number) < 1)) throw ApiError.badRequest('moq must be integer >= 1');
  if (onHand !== undefined && (!Number.isInteger(onHand) || (onHand as number) < 0)) throw ApiError.badRequest('on_hand must be integer >= 0');
  if (bulkBreaks !== undefined) {
    if (!Array.isArray(bulkBreaks)) throw ApiError.badRequest('bulk_breaks must be an array');
    for (const br of bulkBreaks as Array<{ minQty: number; priceKobo: number }>) {
      if (!Number.isInteger(br.minQty) || !Number.isInteger(br.priceKobo) || br.priceKobo <= 0) {
        throw ApiError.badRequest('each bulk break needs integer minQty + positive integer priceKobo');
      }
    }
  }
  return { canonicalProductId, title, priceKobo, bulkBreaks, moq, unitType, onHand } as OfferInput;
}
