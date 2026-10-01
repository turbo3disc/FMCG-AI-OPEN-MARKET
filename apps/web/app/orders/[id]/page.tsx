'use client';

import { useState } from 'react';
import OrderTracker from '../../../components/OrderTracker';
import OTPInput from '../../../components/OTPInput';
import { formatNGN } from '../../../lib/money';
import { orders, sellerOf, productById } from '../../../lib/demo';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = orders.find((o) => o.id === params.id) ?? orders[0];
  const [otpOk, setOtpOk] = useState(false);
  return (
    <div>
      <a href="/orders">← all orders</a>
      <h1 style={{ marginTop: 8 }}>{order.id}</h1>
      <p className="sub">{sellerOf(order.sellerId).name} • Payment: <b>{order.paymentState}</b></p>
      <div className="card">
        <OrderTracker status={order.status} />
      </div>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Items</h3>
          {order.items.map((it, i) => (
            <div key={i} style={{ fontSize: 14 }}>
              {productById(it.productId)?.emoji} {productById(it.productId)?.name} × {it.qty} —{' '}
              <b>{formatNGN(it.unitKobo * it.qty)}</b>
            </div>
          ))}
          <div className="totals" style={{ marginTop: 8 }}>
            <div>Delivery: <b>{formatNGN(order.deliveryFeeKobo)}</b></div>
            <div className="grand">Total: {formatNGN(order.totalKobo)}</div>
          </div>
        </div>
        <div className="card">
          <h3>Delivery OTP (buyer reads, rider enters)</h3>
          <p className="sub">Demo code: <b>{order.otp}</b></p>
          <OTPInput onDone={(code) => setOtpOk(code === order.otp)} />
          {otpOk && <div className="notice ok">OTP verified — proof of delivery recorded.</div>}
        </div>
      </div>
    </div>
  );
}
