'use client';

import type { CartLine } from '../lib/cart';
import { formatNGN } from '../lib/money';

export default function CartLine({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className="img" style={{ fontSize: 28, width: 56, height: 56, borderRadius: 8, background: 'linear-gradient(135deg,#DFF0E4,#F3E9CF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{line.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{line.name}</div>
        <div className="product meta">
          {line.unit} • {formatNGN(line.unitKobo)} each
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => onQty(line.qty - 1)} aria-label="Decrease">−</button>
          <b>{line.qty}</b>
          <button className="btn btn-outline" onClick={() => onQty(line.qty + 1)} aria-label="Increase">+</button>
          <button className="btn btn-danger" onClick={onRemove}>Remove</button>
        </div>
      </div>
      <div className="price">{formatNGN(line.unitKobo * line.qty)}</div>
    </div>
  );
}
