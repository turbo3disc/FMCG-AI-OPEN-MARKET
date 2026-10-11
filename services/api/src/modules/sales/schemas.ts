import { ApiError } from '../../common/errors.js';

export const PLANS = {
  monthly: { months: 1, amountKobo: 500000, label: 'Monthly' },
  quarterly: { months: 3, amountKobo: 1200000, label: 'Quarterly (save 20%)' },
  yearly: { months: 12, amountKobo: 4000000, label: 'Yearly (save 33%)' },
} as const;

export type Plan = keyof typeof PLANS;

export function validateSubscribe(b: Record<string, unknown>): { plan: Plan } {
  const { plan } = b;
  if (typeof plan !== 'string' || !(plan in PLANS)) throw ApiError.badRequest('plan must be monthly|quarterly|yearly');
  return { plan: plan as Plan };
}

export interface SaleItem {
  sku: string; name: string; unit: string; qty: number; priceKobo: number;
}

export function validateSale(b: Record<string, unknown>): { items: SaleItem[] } {
  const { items } = b;
  if (!Array.isArray(items) || !items.length) throw ApiError.badRequest('items required');
  for (const it of items as SaleItem[]) {
    if (typeof it.sku !== 'string' || !it.sku) throw ApiError.badRequest('item sku required');
    if (!Number.isInteger(it.qty) || it.qty <= 0) throw ApiError.badRequest('item qty must be positive integer');
    if (!Number.isInteger(it.priceKobo) || it.priceKobo < 0) throw ApiError.badRequest('item priceKobo must be integer >= 0');
  }
  return { items: items as SaleItem[] };
}

export function validateMove(b: Record<string, unknown>): {
  sku: string; deltaCartons: number; deltaRolls: number; deltaPacks: number; deltaPieces: number;
  reason: 'sale' | 'damage' | 'return' | 'restock' | 'correction'; note?: string;
} {
  const { sku, deltaCartons = 0, deltaRolls = 0, deltaPacks = 0, deltaPieces = 0, reason, note } = b as Record<string, number | string | undefined>;
  if (typeof sku !== 'string' || !sku) throw ApiError.badRequest('sku required');
  for (const [k, v] of Object.entries({ deltaCartons, deltaRolls, deltaPacks, deltaPieces })) {
    if (!Number.isInteger(v)) throw ApiError.badRequest(`${k} must be integer`);
  }
  if (!['sale', 'damage', 'return', 'restock', 'correction'].includes(reason as string)) {
    throw ApiError.badRequest('reason must be sale|damage|return|restock|correction');
  }
  return {
    sku: sku as string, deltaCartons: deltaCartons as number, deltaRolls: deltaRolls as number,
    deltaPacks: deltaPacks as number, deltaPieces: deltaPieces as number,
    reason: reason as 'sale' | 'damage' | 'return' | 'restock' | 'correction', note: note as string | undefined,
  };
}
