// Local money helpers — copied from apps/web/lib/money.ts (ADR-0001).
// Money: integer kobo. Display: formatNGN. Quantities: integer per unit type.

export type UnitType = 'piece' | 'pack' | 'carton';

export interface PriceBreak {
  minQty: number;
  priceKobo: number;
}

export const formatNGN = (kobo: number): string =>
  '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });

export const priceForQty = (baseKobo: number, breaks: PriceBreak[], qty: number): number => {
  let best = baseKobo;
  for (const b of breaks) if (qty >= b.minQty && b.priceKobo < best) best = b.priceKobo;
  return best;
};

export const totalsForQty = (baseKobo: number, breaks: PriceBreak[], qty: number) => {
  const unit = priceForQty(baseKobo, breaks, qty);
  const gross = baseKobo * qty;
  const net = unit * qty;
  return { unitKobo: unit, grossKobo: gross, netKobo: net, discountKobo: gross - net };
};
