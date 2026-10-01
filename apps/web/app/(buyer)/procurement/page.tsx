'use client';

import { useState } from 'react';
import QuoteCard from '../../../components/QuoteCard';
import SellerCard from '../../../components/SellerCard';
import { formatNGN, priceForQty } from '../../../lib/money';
import { products, quotes, sellers } from '../../../lib/demo';

export default function ProcurementPage() {
  const [title, setTitle] = useState('Weekly restock — 20 cartons Indomie + 50 packs water');
  const [qty, setQty] = useState(20);
  const [sent, setSent] = useState(false);

  return (
    <div>
      <h1>Procurement (B2B)</h1>
      <p className="sub">Procurement lists • bulk search • RFQ composer • quotes inbox with counter-offers.</p>

      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>RFQ composer</h3>
          <label className="field" htmlFor="rfq">RFQ title</label>
          <input id="rfq" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="field" htmlFor="qty">Quantity (cartons)</label>
          <input id="qty" type="number" value={qty} min={1} onChange={(e) => setQty(Number(e.target.value))} />
          <div className="notice info">
            Supplier compare — Indomie carton × {qty}:{' '}
            {products[0].offers.map((o) => {
              const s = sellers.find((x) => x.id === o.sellerId)!;
              return `${s.name} ${formatNGN(priceForQty(o.priceKobo, o.bulkBreaks, qty))}`;
            }).join(' • ')}
          </div>
          <button className="btn btn-accent" onClick={() => setSent(true)}>Send RFQ to 3 suppliers</button>
          {sent && <div className="notice ok">RFQ sent — quotes land in the inbox below (demo).</div>}
        </div>
        <div>
          <h3>Supplier compare</h3>
          <div className="grid" style={{ gap: 12 }}>
            {sellers.map((s) => <SellerCard key={s.id} seller={s} />)}
          </div>
        </div>
      </div>

      <h2 className="section">Quotes inbox (versions / counter-offers)</h2>
      <div className="grid g2">
        {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
      </div>

      <h2 className="section">Procurement list</h2>
      <table>
        <thead><tr><th>Item</th><th>Par level</th><th>On hand</th><th>Reorder</th></tr></thead>
        <tbody>
          <tr><td>🍜 Indomie carton</td><td>20</td><td>6</td><td><span className="badge b-red">order now</span></td></tr>
          <tr><td>💧 Bottled water pack</td><td>50</td><td>30</td><td><span className="badge b-amber">order soon</span></td></tr>
          <tr><td>🍫 Milo 800g</td><td>24</td><td>22</td><td><span className="badge b-green">ok</span></td></tr>
        </tbody>
      </table>
    </div>
  );
}
