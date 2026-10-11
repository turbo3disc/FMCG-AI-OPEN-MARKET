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
  brand?: string;
  size?: string;
  sku?: string;
  priceKobo: number;
  bulkBreaks?: Array<{ minQty: number; priceKobo: number }>;
  moq?: number;
  unitType?: string;
  onHand?: number;
  cartons?: number;
  rolls?: number;
}

const UNIT_TYPES = ['piece', 'pack', 'carton', 'roll'];

export function validateOffer(b: Record<string, unknown>): OfferInput {
  const { canonicalProductId, title, brand, size, sku, priceKobo, bulkBreaks, moq, unitType, onHand, cartons, rolls } = b as Record<string, never>;
  if (typeof title !== 'string' || !title) throw ApiError.badRequest('title required');
  if (!Number.isInteger(priceKobo) || (priceKobo as number) <= 0) throw ApiError.badRequest('priceKobo must be positive integer kobo');
  if (unitType !== undefined && !(UNIT_TYPES as string[]).includes(unitType as string)) throw ApiError.badRequest('invalid unit_type');
  if (moq !== undefined && (!Number.isInteger(moq) || (moq as number) < 1)) throw ApiError.badRequest('moq must be integer >= 1');
  if (onHand !== undefined && (!Number.isInteger(onHand) || (onHand as number) < 0)) throw ApiError.badRequest('on_hand must be integer >= 0');
  if (cartons !== undefined && (!Number.isInteger(cartons) || (cartons as number) < 0)) throw ApiError.badRequest('cartons must be integer >= 0');
  if (rolls !== undefined && (!Number.isInteger(rolls) || (rolls as number) < 0)) throw ApiError.badRequest('rolls must be integer >= 0');
  if (brand !== undefined && typeof brand !== 'string') throw ApiError.badRequest('brand must be a string');
  if (size !== undefined && typeof size !== 'string') throw ApiError.badRequest('size must be a string');
  if (sku !== undefined && typeof sku !== 'string') throw ApiError.badRequest('sku must be a string');
  if (bulkBreaks !== undefined) {
    if (!Array.isArray(bulkBreaks)) throw ApiError.badRequest('bulk_breaks must be an array');
    for (const br of bulkBreaks as Array<{ minQty: number; priceKobo: number }>) {
      if (!Number.isInteger(br.minQty) || !Number.isInteger(br.priceKobo) || br.priceKobo <= 0) {
        throw ApiError.badRequest('each bulk break needs integer minQty + positive integer priceKobo');
      }
    }
  }
  return { canonicalProductId, title, brand, size, sku, priceKobo, bulkBreaks, moq, unitType, onHand, cartons, rolls } as OfferInput;
}
