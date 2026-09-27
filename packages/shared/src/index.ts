// @fmcg/shared — single source of truth for money, units, geo (ADR-0001).
// Money: integer kobo. Display: formatNGN. Quantities: integer per unit type.

export type UnitType = 'piece' | 'pack' | 'carton';
export type BuyerType = 'shopper' | 'household' | 'retail_shop';
export type PaymentState =
  | 'PENDING' | 'PROTECTED' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED_PENDING_CONFIRMATION' | 'SETTLEMENT_PENDING'
  | 'SETTLED' | 'DISPUTED' | 'REFUNDED'
  | 'COD_PENDING_COLLECTION' | 'COD_RECONCILED';
export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery'
  | 'delivered' | 'completed' | 'cancelled' | 'disputed' | 'refunded';

export const formatNGN = (kobo: number): string =>
  '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });

export interface PriceBreak { minQty: number; priceKobo: number; }
export const priceForQty = (baseKobo: number, breaks: PriceBreak[], qty: number): number => {
  let best = baseKobo;
  for (const b of breaks) if (qty >= b.minQty && b.priceKobo < best) best = b.priceKobo;
  return best;
};
