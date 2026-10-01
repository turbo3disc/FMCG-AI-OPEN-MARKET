'use client';

import { useEffect, useState } from 'react';
import { loadCart, clearCart, type CartLine as Line } from '../../lib/cart';
import { formatNGN, totalsForQty } from '../../lib/money';
import { productById, sellerOf } from '../../lib/demo';

export default function CheckoutPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [method, setMethod] = useState<'protected' | 'cod'>('protected');
  const [paid, setPaid] = useState(false);
  useEffect(() => setLines(loadCart()), []);

  const seller = lines.length ? sellerOf(lines[0].sellerId) : null;
  const fee = seller?.deliveryFeeKobo ?? 0;

  let subtotal = 0;
  let bulkDiscount = 0;
  for (const l of lines) {
    const p = productById(l.productId);
    const breaks = p?.offers.find((o) => o.sellerId === l.sellerId)?.bulkBreaks ?? [];
    const base = p?.basePriceKobo ?? l.unitKobo;
    const t = totalsForQty(base, breaks, l.qty);
    subtotal += t.grossKobo;
    bulkDiscount += t.discountKobo;
  }
  const total = subtotal - bulkDiscount + fee;

  if (paid)
    return (
      <div>
        <h1>Payment confirmed</h1>
        <div className="notice ok">Order placed • stock reserved • track it in <a href="/orders">Orders</a>.</div>
      </div>
    );

  return (
    <div>
      <h1>Checkout</h1>
      <p className="sub">Item price + bulk discount + delivery fee + protection/COD terms — always visible before pay.</p>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Order summary</h3>
          <div className="totals">
            <div>Items: <b>{formatNGN(subtotal)}</b></div>
            <div>Bulk discount: <b>−{formatNGN(bulkDiscount)}</b></div>
            <div>Delivery ({seller?.market ?? '—'} zone): <b>{formatNGN(fee)}</b></div>
            <div className="grand">Total: {formatNGN(total)}</div>
          </div>
          <label className="field" htmlFor="method">Payment method</label>
          <select id="method" value={method} onChange={(e) => setMethod(e.target.value as never)}>
            <option value="protected">Protected payment (Paystack/Flutterwave)</option>
            <option value="cod">Cash on delivery {seller && !seller.codEligible ? '(not eligible for this seller)' : ''}</option>
          </select>
          <div className="notice info" style={{ marginTop: 12 }}>
            {method === 'protected'
              ? 'Protected: money is held and settles to the seller after delivery confirm. Dispute pauses settlement.'
              : 'COD: caps + Tier-2 gating apply. Rider collects cash and reconciles; OTP + POD required.'}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={lines.length === 0}
            onClick={() => { setPaid(true); clearCart(); }}
          >
            {lines.length ? `Pay ${formatNGN(total)} securely` : 'Cart is empty'}
          </button>
        </div>
        <div className="card">
          <h3>Protection & COD terms</h3>
          <ul style={{ fontSize: 14, paddingLeft: 18 }}>
            <li>Stock is reserved at checkout; oversell-safe (available = on_hand − reserved).</li>
            <li>Payment confirmed only via PSP webhook — never by app flags.</li>
            <li>Delivery OTP + photo/signature (POD) close the job.</li>
            <li>Confirm within the window or auto-complete; disputes pause settlement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
