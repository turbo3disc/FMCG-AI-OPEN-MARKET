'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import ProductGallery from '../../../components/ProductGallery';
import PriceBlock from '../../../components/PriceBlock';
import StockBadge from '../../../components/StockBadge';
import DistanceChip from '../../../components/DistanceChip';
import SellerCard from '../../../components/SellerCard';
import { getInventoryServerSnapshot, getInventorySnapshot, subscribeInventory } from '../../../lib/inventory';
import { productById, sellerOf } from '../../../lib/demo';
import { addToCart } from '../../../lib/cart';
import { formatNGN } from '../../../lib/money';
import { distanceLabel, sellerDistanceKm } from '../../../lib/geo';

export default function ProductPage({ params }: { params: { id: string } }) {
  const items = useSyncExternalStore(subscribeInventory, getInventorySnapshot, getInventoryServerSnapshot);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  const live = useMemo(
    () => items.find((p) => p.id === params.id || p.sku === params.id),
    [items, params.id],
  );
  const demo = productById(params.id);

  if (live) {
    const km = sellerDistanceKm('Mile 12 / Ketu', live.sellerLat, live.sellerLng);
    return (
      <div>
        <a href="/search">← back to search</a>
        <div className="grid g2" style={{ marginTop: 12, alignItems: 'start' }}>
          <div className="card">
            <ProductGallery images={live.images ?? []} title={`${live.brand} ${live.name}`} emoji="📦" badge="● LIVE" />
            <div style={{ marginTop: 14 }}>
              <h1 style={{ fontSize: 22 }}>{live.brand} {live.name}</h1>
              <div className="sub">{live.size} • SKU {live.sku} • {live.category} • per {live.sellBy} • MOQ {live.moq}</div>
              <div className="price" style={{ marginTop: 6 }}>{formatNGN(live.priceKobo)} <small>/ {live.sellBy}</small></div>
              <div className="sub">{live.sellerName} • {live.sellerArea} • {distanceLabel(km)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <label htmlFor="qty-live">Qty:</label>
                <input id="qty-live" type="number" min={1} value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} style={{ maxWidth: 90 }} />
                <button className="btn btn-primary" onClick={() => {
                  const { replaced } = addToCart({
                    productId: live.sku, name: `${live.brand} ${live.name}`, emoji: '📦',
                    sellerId: `live:${live.sellerName}`, unit: live.sellBy, qty, unitKobo: live.priceKobo,
                    image: live.images?.[0],
                  });
                  setMsg(replaced ? 'Cart cleared (single-seller rule) — added from this seller.' : 'Added to cart.');
                }}>Add to cart</button>
                <a className="btn btn-outline" href={`/messages?to=${encodeURIComponent(`live:${live.sku}`)}`}>Chat with seller</a>
              </div>
              {msg && <div className="notice ok">{msg}</div>}
            </div>
          </div>
          <div>
            <h2 className="section" style={{ marginTop: 0 }}>Other sellers with this product</h2>
            {items.filter((p) => p.sku === live.sku && p.id !== live.id).length === 0 && (
              <p className="sub">No other seller listed this SKU yet.</p>
            )}
            <table>
              <thead><tr><th>Seller</th><th>Distance</th><th>Stock</th><th>Price</th></tr></thead>
              <tbody>
                {items.filter((p) => p.sku === live.sku && p.id !== live.id).map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.sellerName}</b> • {p.sellerArea}</td>
                    <td><DistanceChip km={sellerDistanceKm('Mile 12 / Ketu', p.sellerLat, p.sellerLng)} /></td>
                    <td><StockBadge stock={p.cartons + p.rolls + p.packs + p.pieces} unit={p.sellBy} updatedMinAgo={1} /></td>
                    <td><b>{formatNGN(p.priceKobo)}</b> • MOQ {p.moq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <SellerCard seller={sellerOf('adeola')} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!demo) return <div className="notice warn">Product not found — it may have been unpublished.</div>;

  return (
    <div>
      <a href="/search">← back to search</a>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="product">
            <div className="img" style={{ fontSize: 48, width: 120, height: 120 }}>{demo.emoji}</div>
            <div>
              <h1 style={{ fontSize: 20 }}>{demo.name}</h1>
              <div className="sub">{demo.brand} • {demo.category} • canonical product</div>
              <PriceBlock product={demo} qty={qty} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
            <label htmlFor="qty">Qty ({demo.unit}s):</label>
            <input
              id="qty" type="number" min={1} value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ maxWidth: 100 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const best = [...demo.offers].sort((a, b) => a.priceKobo - b.priceKobo)[0];
                const { replaced } = addToCart({
                  productId: demo.id, name: demo.name, emoji: demo.emoji,
                  sellerId: best.sellerId, unit: demo.unit, qty, unitKobo: best.priceKobo,
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
              {demo.offers.map((o, i) => {
                const s = sellerOf(o.sellerId);
                return (
                  <tr key={i}>
                    <td><b>{s.name}</b> • {s.market}</td>
                    <td><DistanceChip km={s.distanceKm} /></td>
                    <td><StockBadge stock={o.stock} unit={demo.unit} updatedMinAgo={o.updatedMinAgo} /></td>
                    <td><b>{formatNGN(o.priceKobo)}</b> • MOQ {o.moq}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <SellerCard seller={sellerOf(demo.offers[0].sellerId)} />
          </div>
        </div>
      </div>
    </div>
  );
}
