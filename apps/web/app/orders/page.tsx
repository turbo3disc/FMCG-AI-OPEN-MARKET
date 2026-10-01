import OrderTracker from '../../components/OrderTracker';
import { formatNGN } from '../../lib/money';
import { orders, sellerOf, productById } from '../../lib/demo';

export default function OrdersPage() {
  return (
    <div>
      <h1>Orders</h1>
      <p className="sub">Order lifecycle ≠ payment state — both shown on every order.</p>
      <div className="grid g2" style={{ marginTop: 12 }}>
        {orders.map((o) => (
          <a key={o.id} href={`/orders/${o.id}`} className="card">
            <div className="kicker">{o.id} • {sellerOf(o.sellerId).name}</div>
            <div style={{ fontSize: 14 }}>
              {o.items.map((it, i) => (
                <div key={i}>{productById(it.productId)?.name} × {it.qty}</div>
              ))}
            </div>
            <OrderTracker status={o.status} />
            <div style={{ fontSize: 13 }}>
              Payment: <b>{o.paymentState}</b> • Total: <b>{formatNGN(o.totalKobo)}</b>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
