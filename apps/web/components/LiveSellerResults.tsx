// Buyer-facing live results — products the seller pressed “Make live” on.
// Ranked nearby-first: closest seller to the buyer's area on top, outside the
// radius hidden (city-wide B2B radius 50 km shows all).
'use client';

import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  getInventoryServerSnapshot, getInventorySnapshot, stockLabel, subscribeInventory, totalUnits,
} from '../lib/inventory';
import { addToCart } from '../lib/cart';
import { distanceLabel, sellerDistanceKm } from '../lib/geo';
import { formatNGN } from '../lib/money';

function subscribe(cb: () => void): () => void {
  return subscribeInventory(cb);
}

export default function LiveSellerResults({ q, buyerArea, radiusKm }: { q: string; buyerArea: string; radiusKm: number }) {
  const router = useRouter();
  const [added, setAdded] = useState('');
  const items = useSyncExternalStore(subscribe, getInventorySnapshot, getInventoryServerSnapshot);
  const needle = q.trim().toLowerCase();
  const live = items
    .filter((p) => p.status === 'live')
    .filter(
      (p) =>
        !needle ||
        `${p.brand} ${p.name} ${p.size} ${p.sku}`.toLowerCase().includes(needle),
    )
    .map((p) => ({ p, km: sellerDistanceKm(buyerArea, p.sellerLat, p.sellerLng) }))
    .filter((r) => r.km <= radiusKm)
    .sort((a, b) => a.km - b.km);
  if (!live.length) return null;
  function cartIt(sku: string, name: string, seller: string, unit: string, unitKobo: number, image?: string) {
    const { replaced } = addToCart({ productId: sku, name, emoji: '📦', sellerId: `live:${seller}`, unit, qty: 1, unitKobo, image });
    setAdded(replaced ? `Cart switched to ${seller} (single-seller rule). Opening cart…` : `${name} added to cart. Opening cart…`);
    setTimeout(() => router.push('/cart'), 900);
  }
  return (
    <div>
      <h2 className="section">Fresh from sellers — near {buyerArea} ({live.length} live)</h2>
      {added && <div className="notice ok">{added}</div>}
      <table>
        <thead>
          <tr><th>Seller</th><th>Product</th><th>Distance</th><th>Stock</th><th>Price</th><th></th></tr>
        </thead>
        <tbody>
          {live.map(({ p, km }) => (
            <tr key={p.id}>
              <td><b>{p.sellerName ?? 'Verified seller'}</b> • {p.sellerArea ?? ''} <span className="badge b-green">● LIVE</span></td>
              <td>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {p.images?.[0]
                    ? <img className="thumb-sm" src={p.images[0]} alt={p.name} />
                    : <div className="thumb-sm-ph">📦</div>}
                  <div>
                    <a href={`/product/${p.sku}`}><b>{p.brand} {p.name}</b></a>
                    <div className="sub">{p.size} • SKU {p.sku} • per {p.sellBy} • MOQ {p.moq}</div>
                  </div>
                </div>
              </td>
              <td>{distanceLabel(km)}</td>
              <td>{stockLabel(p)} ({totalUnits(p)} units)</td>
              <td><b>{formatNGN(p.priceKobo)}</b></td>
              <td>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => cartIt(p.sku, `${p.brand} ${p.name}`, p.sellerName ?? 'seller', p.sellBy, p.priceKobo, p.images?.[0])}>Add</button>
                  <a className="btn btn-outline" href={`/product/${p.sku}`}>View</a>
                  <a className="btn btn-outline" href={`/messages?to=${encodeURIComponent(`live:${p.sku}`)}`}>Chat</a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
