// Local money/unit helpers (mirrors @fmcg/shared; kept inside the API so the
// service compiles standalone — see ADR-0001. Money in integer kobo).
export type UnitType = 'piece' | 'pack' | 'carton';
export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery'
  | 'delivered' | 'completed' | 'cancelled' | 'disputed' | 'refunded';
export type PaymentState =
  | 'PENDING' | 'PROTECTED' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED_PENDING_CONFIRMATION' | 'SETTLEMENT_PENDING'
  | 'SETTLED' | 'DISPUTED' | 'REFUNDED'
  | 'COD_PENDING_COLLECTION' | 'COD_RECONCILED';

export const formatNGN = (kobo: number): string =>
  '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });

export interface PriceBreak { minQty: number; priceKobo: number; }
export const priceForQty = (baseKobo: number, breaks: PriceBreak[], qty: number): number => {
  let best = baseKobo;
  for (const b of breaks) if (qty >= b.minQty && b.priceKobo < best) best = b.priceKobo;
  return best;
};
