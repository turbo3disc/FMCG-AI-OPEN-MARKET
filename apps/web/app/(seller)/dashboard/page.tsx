import OrderTracker from '../../../components/OrderTracker';
import QuoteCard from '../../../components/QuoteCard';
import { formatNGN } from '../../../lib/money';
import { orders, products, quotes, sellerOf } from '../../../lib/demo';

export default function SellerDashboardPage() {
  const mine = orders.filter((o) => o.sellerId === 'adeola');
  return (
    <div>
      <h1>Seller dashboard — Adeola Wholesale (Mile 12)</h1>
      <p className="sub">Inventory • orders • quotes inbox. Tier 2 • Verified.</p>
      <div className="grid g3">
        <div className="card"><h3>Today</h3><div className="price">₦182,500 <small>GMV</small></div><div className="sub">14 orders • 2 open quotes</div></div>
        <div className="card"><h3>Stock alerts</h3><div className="sub">Balogun Indomie: 18 cartons (low) • review bulk breaks</div></div>
        <div className="card"><h3>Settlement</h3><div className="sub">₦96,000 pending • settles after delivery confirm</div></div>
      </div>

      <h2 className="section">Inventory</h2>
      <table>
        <thead><tr><th>SKU</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Freshness</th></tr></thead>
        <tbody>
          {products.slice(0, 4).map((p) => {
            const o = p.offers[0];
            return (
              <tr key={p.id}>
                <td>{p.emoji} {p.name}</td>
                <td>{o.stock}</td><td>3</td><td><b>{o.stock - 3}</b></td>
                <td>updated {o.updatedMinAgo} min ago</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="section">Orders</h2>
      <div className="grid g2">
        {mine.map((o) => (
          <div key={o.id} className="card">
            <div className="kicker">{o.id} • {formatNGN(o.totalKobo)} • {o.paymentState}</div>
            <OrderTracker status={o.status} />
            <div className="btn-row"><button className="btn btn-primary">Mark preparing</button><button className="btn btn-outline">Message buyer</button></div>
          </div>
        ))}
      </div>

      <h2 className="section">Quotes inbox</h2>
      <div className="grid g2">
        {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
      </div>
      <p className="sub" style={{ marginTop: 8 }}>Seller: {sellerOf('adeola').name} • buyer view: <a href="/procurement">procurement →</a></p>
    </div>
  );
}
