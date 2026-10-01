'use client';

import { useEffect, useState } from 'react';
import CartLine from '../../components/CartLine';
import { loadCart, setQty, clearCart, type CartLine as Line } from '../../lib/cart';
import { formatNGN } from '../../lib/money';

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => setLines(loadCart()), []);
  const total = lines.reduce((s, l) => s + l.qty * l.unitKobo, 0);

  if (lines.length === 0)
    return (
      <div>
        <h1>Cart</h1>
        <div className="notice info">Your cart is empty. <a href="/search">Find stock near you →</a></div>
      </div>
    );

  return (
    <div>
      <h1>Cart</h1>
      <p className="sub">Single-seller cart (MVP rule) • MOQ + delivery-zone validated at checkout.</p>
      <div className="grid" style={{ gap: 12, marginTop: 12 }}>
        {lines.map((l) => (
          <CartLine
            key={l.productId + l.unit}
            line={l}
            onQty={(q) => setLines(setQty(l.productId, q))}
            onRemove={() => setLines(setQty(l.productId, 0))}
          />
        ))}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="totals">
          <div>Subtotal: <b>{formatNGN(total)}</b></div>
        </div>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <a className="btn btn-primary" href="/checkout">Proceed to checkout</a>
          <button className="btn btn-outline" onClick={() => { clearCart(); setLines([]); }}>Clear cart</button>
        </div>
      </div>
    </div>
  );
}
