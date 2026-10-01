import { formatNGN } from '../../lib/money';
import { orders, products, sellers } from '../../lib/demo';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin console</h1>
      <p className="sub">Moderation queues • settlements • disputes. Finance actions need MFA + human approval.</p>
      <div className="grid g3">
        <div className="card"><h3>Pending sellers</h3><div className="price">3 <small>awaiting Tier review</small></div></div>
        <div className="card"><h3>Canonical queue</h3><div className="price">5 <small>dedup candidates</small></div></div>
        <div className="card"><h3>Open disputes</h3><div className="price">2 <small>within SLA</small></div></div>
      </div>

      <h2 className="section">Seller Tier approval</h2>
      <table>
        <thead><tr><th>Seller</th><th>Market</th><th>Tier</th><th>Action</th></tr></thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.id}>
              <td><b>{s.name}</b></td><td>{s.market}</td>
              <td>{s.tier === 2 ? <span className="badge b-green">Tier 2 • Verified</span> : <span className="badge b-grey">Tier 1 • Basic</span>}</td>
              <td><button className="btn btn-outline">Review</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section">Canonical moderation queue</h2>
      <table>
        <thead><tr><th>Candidate</th><th>Match</th><th>Status</th></tr></thead>
        <tbody>
          {products.slice(0, 3).map((p) => (
            <tr key={p.id}><td>{p.name}</td><td>canonical • 96% match</td><td><span className="badge b-amber">pending</span></td></tr>
          ))}
        </tbody>
      </table>

      <h2 className="section">Settlements (per-seller split)</h2>
      <table>
        <thead><tr><th>Order</th><th>Seller</th><th>Amount</th><th>State</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{sellers.find((s) => s.id === o.sellerId)?.name}</td>
              <td><b>{formatNGN(o.totalKobo)}</b></td>
              <td><span className="badge b-amber">SETTLEMENT_PENDING</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section">Disputes</h2>
      <div className="card">
        <div className="quote-ver"><span className="who">DSP-009:</span> wrong item (Close-Up vs Colgate) — evidence 2 photos — settlement paused</div>
        <div className="quote-ver accepted"><span className="who">DSP-007:</span> late delivery — resolved, ₦800 delivery refunded</div>
      </div>
    </div>
  );
}
