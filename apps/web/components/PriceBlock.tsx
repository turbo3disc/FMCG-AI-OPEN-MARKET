import { formatNGN, priceForQty } from '../lib/money';
import type { DemoProduct } from '../lib/demo';
import { bestOffer, sellerOf } from '../lib/demo';

export default function PriceBlock({ product, qty = 1 }: { product: DemoProduct; qty?: number }) {
  const offer = bestOffer(product);
  const unit = priceForQty(offer.priceKobo, offer.bulkBreaks, qty);
  return (
    <div>
      <div className="price">
        {formatNGN(unit)} <small>/ {product.unit}</small>
      </div>
      {offer.bulkBreaks.length > 0 && (
        <div className="breaks">
          Bulk: 1–{offer.bulkBreaks[0].minQty - 1} {product.unit}s {formatNGN(offer.priceKobo)}
          {offer.bulkBreaks.map((b) => ` • ${b.minQty}+ ${formatNGN(b.priceKobo)}`).join('')} • MOQ {offer.moq}
        </div>
      )}
      <div className="product meta" style={{ marginTop: 4 }}>
        {sellerOf(offer.sellerId).name} • {sellerOf(offer.sellerId).distanceKm} km
      </div>
    </div>
  );
}
