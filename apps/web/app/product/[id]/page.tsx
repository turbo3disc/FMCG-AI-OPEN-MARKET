'use client';

import { useState } from 'react';
import PriceBlock from '../../../components/PriceBlock';
import StockBadge from '../../../components/StockBadge';
import SellerCard from '../../../components/SellerCard';
import DistanceChip from '../../../components/DistanceChip';
import { productById, sellerOf } from '../../../lib/demo';
import { addToCart } from '../../../lib/cart';
import { formatNGN } from '../../../lib/money';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = productById(params.id);
  const [qty, setQty] = useState(2);
  const [msg, setMsg] = useState('');
  if (!product) return <div className="notice warn">Product not found in demo data.</div>;

  return (
    <div>
      <a href="/search">← back to search</a>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="product">
            <div className="img" style={{ fontSize: 48, width: 120, height: 120 }}>{product.emoji}</div>
            <div>
              <h1 style={{ fontSize: 20 }}>{product.name}</h1>
              <div className="sub">{product.brand} • {product.category} • canonical product</div>
              <PriceBlock product={product} qty={qty} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
            <label htmlFor="qty">Qty ({product.unit}s):</label>
            <input
              id="qty" type="number" min={1} value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ maxWidth: 100 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const best = [...product.offers].sort((a, b) => a.priceKobo - b.priceKobo)[0];
                const { replaced } = addToCart({
                  productId: product.id, name: product.name, emoji: product.emoji,
                  sellerId: best.sellerId, unit: product.unit, qty, unitKobo: best.priceKobo,
                });
                setMsg(replaced ? 'Cart cleared (single-seller rule) — added from new seller.' : 'Added to cart.');
              }}
            >
              Add to cart
            </button>
            <a className="btn btn-accent" href="/procurement">Request quote</a>
          </div>
          {msg && <div className="notice ok">{msg}</div>}
        </div>
        <div>
          <h2 className="section" style={{ marginTop: 0 }}>Nearby sellers table</h2>
          <table>
            <thead><tr><th>Seller</th><th>Distance</th><th>Stock</th><th>Price</th></tr></thead>
            <tbody>
              {product.offers.map((o, i) => {
                const s = sellerOf(o.sellerId);
                return (
                  <tr key={i}>
                    <td><b>{s.name}</b> • {s.market}</td>
                    <td><DistanceChip km={s.distanceKm} /></td>
                    <td><StockBadge stock={o.stock} unit={product.unit} updatedMinAgo={o.updatedMinAgo} /></td>
                    <td><b>{formatNGN(o.priceKobo)}</b> • MOQ {o.moq}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <SellerCard seller={sellerOf(product.offers[0].sellerId)} />
          </div>
        </div>
      </div>
    </div>
  );
}
