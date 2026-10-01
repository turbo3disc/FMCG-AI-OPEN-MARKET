import type { DemoProduct } from '../lib/demo';
import { bestOffer } from '../lib/demo';
import PriceBlock from './PriceBlock';
import StockBadge from './StockBadge';
import DistanceChip from './DistanceChip';
import { sellerOf } from '../lib/demo';

export default function ProductCard({ product }: { product: DemoProduct }) {
  const offer = bestOffer(product);
  const seller = sellerOf(offer.sellerId);
  return (
    <div className="card">
      <div className="product">
        <div className="img">{product.emoji}</div>
        <div style={{ flex: 1 }}>
          <a href={`/product/${product.id}`} className="name">
            {product.name}
          </a>
          <div className="meta">
            Canonical product • {product.offers.length} nearby sellers
          </div>
          <PriceBlock product={product} />
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StockBadge stock={offer.stock} unit={product.unit} updatedMinAgo={offer.updatedMinAgo} />
            <DistanceChip km={seller.distanceKm} />
          </div>
        </div>
      </div>
    </div>
  );
}
