// Nearby sellers strip — every seller close to the buyer with goods,
// price-from, and one-tap Chat / Call / WhatsApp connect.
'use client';

import { useSyncExternalStore } from 'react';
import {
  getInventoryServerSnapshot, getInventorySnapshot, liveProducts, subscribeInventory,
} from '../lib/inventory';
import { distanceLabel, kmBetween, marketCoords, areaCoords } from '../lib/geo';
import { products as demoProducts, sellers as demoSellers } from '../lib/demo';
import { formatNGN } from '../lib/money';
import { sellerDirectory, waLink } from '../lib/chat';

export default function NearbySellers({ buyerArea, radiusKm, q }: { buyerArea: string; radiusKm: number; q: string }) {
  const items = useSyncExternalStore(subscribeInventory, getInventorySnapshot, getInventoryServerSnapshot);
  const needle = q.trim().toLowerCase();
  const buyer = areaCoords(buyerArea);
  const dir = sellerDirectory();

  const live = liveProducts(items)
    .filter((p) => !needle || `${p.brand} ${p.name}`.toLowerCase().includes(needle))
    .reduce<Array<{ name: string; area: string; lat: number; lng: number; n: number; minKobo: number; key: string; image?: string; top: string; sku: string }>>((acc, p) => {
      const name = p.sellerName ?? 'Verified seller';
      let row = acc.find((r) => r.name === name);
      if (!row) {
        const c = { lat: Number(p.sellerLat), lng: Number(p.sellerLng) };
        row = { name, area: p.sellerArea ?? 'Lagos', lat: c.lat, lng: c.lng, n: 0, minKobo: p.priceKobo, key: `live:${p.sku}`, image: p.images?.[0], top: `${p.brand} ${p.name}`, sku: p.sku };
        acc.push(row);
      }
      row.n += 1;
      row.minKobo = Math.min(row.minKobo, p.priceKobo);
      return acc;
    }, []);

  const seeded = demoSellers.map((s) => {
    const c = marketCoords(s.market);
    const offers = demoProducts.flatMap((p) => p.offers.filter((o) => o.sellerId === s.id));
    const mine = !needle ? offers : offers.filter((o) => {
      const prod = demoProducts.find((p) => p.offers.includes(o));
      return prod && `${prod.brand} ${prod.name}`.toLowerCase().includes(needle);
    });
    const topProd = demoProducts.find((p) => p.offers.some((o) => o.sellerId === s.id));
    return {
      name: s.name, area: s.market, lat: c.lat, lng: c.lng, n: mine.length,
      minKobo: mine.length ? Math.min(...mine.map((o) => o.priceKobo)) : 0,
      key: `demo:${s.id}`, tier: s.tier, top: topProd ? `${topProd.brand} ${topProd.name}` : '', sku: topProd?.id ?? '',
      image: undefined as string | undefined,
    };
  });

  const all = [...live, ...seeded]
    .map((r) => ({ ...r, km: kmBetween(buyer.lat, buyer.lng, r.lat || buyer.lat, r.lng || buyer.lng) }))
    .filter((r) => r.km <= radiusKm && r.n > 0)
    .sort((a, b) => a.km - b.km)
    .slice(0, 6);

  if (!all.length) return null;
  return (
    <div>
      <h2 className="section">Nearby sellers ({all.length})</h2>
      <p className="sub">Closest to {buyerArea} first — chat, call, or cart straight from the shelf.</p>
      <div className="grid g3">
        {all.map((s) => {
          const contact = dir.find((d) => d.key === s.key) ?? dir.find((d) => d.name === s.name);
          const phone = contact?.phone ?? '+234800000000';
          const chatKey = contact?.key ?? s.key;
          return (
            <div key={s.key} className="card">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {s.image
                  ? <img className="thumb-sm" src={s.image} alt={s.top} />
                  : <div className="thumb-sm-ph">🏪</div>}
                <div>
                  <h3 style={{ marginBottom: 2 }}>{s.name}</h3>
                  <div className="sub">{s.area} • {distanceLabel(s.km)}</div>
                </div>
              </div>
              <div className="price" style={{ marginTop: 8 }}>{s.n} product{s.n === 1 ? '' : 's'} <small>from {formatNGN(s.minKobo)}</small></div>
              {s.top && <div className="sub">{s.top}</div>}
              <div className="btn-row" style={{ marginTop: 10 }}>
                <a className="btn btn-primary" href={`/messages?to=${encodeURIComponent(chatKey)}`}>Chat</a>
                <a className="btn btn-outline" href={`tel:${phone}`}>Call</a>
                <a className="btn btn-outline" href={waLink(phone, `Hello ${s.name}! I found you on FMCG Open Market.`)} target="_blank" rel="noreferrer">WhatsApp</a>
                {s.sku && <a className="btn btn-outline" href={`/product/${s.sku}`}>See stock</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
