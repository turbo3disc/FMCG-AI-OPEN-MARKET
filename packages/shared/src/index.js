// @fmcg/shared — single source of truth for money, units, geo (ADR-0001).
// Money: integer kobo. Display: formatNGN. Quantities: integer per unit type.
export const formatNGN = (kobo) => '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
export const priceForQty = (baseKobo, breaks, qty) => {
    let best = baseKobo;
    for (const b of breaks)
        if (qty >= b.minQty && b.priceKobo < best)
            best = b.priceKobo;
    return best;
};
