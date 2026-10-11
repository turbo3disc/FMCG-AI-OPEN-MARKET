// Seller inventory table — manual products with one-tap Make live / Pause.
'use client';

import { useSyncExternalStore } from 'react';
import {
  getInventoryServerSnapshot, getInventorySnapshot, removeProduct, setStatus,
  stockLabel, subscribeInventory, type SellerProduct,
} from '../lib/inventory';
import {
  canSell, getApplicantsServerSnapshot as onboardServer, getApplicantsSnapshot as onboardSnap,
  subscribeOnboarding,
} from '../lib/onboarding';
import { formatNGN } from '../lib/money';

function subscribe(cb: () => void): () => void {
  return subscribeInventory(cb);
}

const badge = (s: SellerProduct['status']) =>
  s === 'live' ? 'b-green' : s === 'paused' ? 'b-amber' : 'b-grey';

const label = (s: SellerProduct['status']) =>
  s === 'live' ? '● LIVE' : s === 'paused' ? '❚❚ Paused' : '○ Draft';

export default function InventoryTable() {
  const items = useSyncExternalStore(subscribe, getInventorySnapshot, getInventoryServerSnapshot);
  useSyncExternalStore(subscribeOnboarding, onboardSnap, onboardServer);
  const locked = !canSell();
  const live = items.filter((p) => p.status === 'live').length;

  return (
    <div>
      {locked && (
        <div className="notice warn">
          <b>Product upload is locked.</b> Only logged-in, approved sellers can add or publish products.{' '}
          <a href="/join">Create account</a> • <a href="/login">Log in</a>
        </div>
      )}
      <div className="btn-row" style={{ marginBottom: 12 }}>
        {locked
          ? <span className="btn btn-outline" aria-disabled="true">+ Add product (locked)</span>
          : <a href="/products/new" className="btn btn-primary">+ Add product</a>}
        <span className="sub" style={{ alignSelf: 'center' }}>
          {items.length} product{items.length === 1 ? '' : 's'} • {live} live for buyers
        </span>
      </div>
      {items.length === 0 && (
        <div className="notice info">
          No manual products yet. Press <b>+ Add product</b> and enter brand, name, size and
          stock — then <b>Make live</b> so buyers can see it in Search.
        </div>
      )}
      {items.length > 0 && (
        <table>
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Stock</th><th>Price</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td><b>{p.brand} {p.name}</b><div className="sub">{p.size} • {p.category} • per {p.sellBy} • MOQ {p.moq}</div></td>
                <td>{p.sku}</td>
                <td>{stockLabel(p)}</td>
                <td><b>{formatNGN(p.priceKobo)}</b></td>
                <td><span className={`badge ${badge(p.status)}`}>{label(p.status)}</span></td>
                <td>
                  {locked ? (
                    <span className="sub">Locked</span>
                  ) : (
                  <div className="btn-row">
                    {p.status !== 'live'
                      ? <button className="btn btn-primary" onClick={() => setStatus(p.id, 'live')}>Make live</button>
                      : <button className="btn btn-outline" onClick={() => setStatus(p.id, 'paused')}>Pause</button>}
                    {p.status === 'paused' && <button className="btn btn-outline" onClick={() => setStatus(p.id, 'draft')}>To draft</button>}
                    <button className="btn btn-outline" onClick={() => { if (confirm(`Delete ${p.name}?`)) removeProduct(p.id); }}>✕</button>
                  </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
