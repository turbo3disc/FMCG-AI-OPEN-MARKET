// FMCG Open Market POS subscription — monthly / quarterly / yearly.
// Paid add-on that unlocks the robotic inventory + outlet POS.
'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  activatePlan, getSubServerSnapshot, getSubSnapshot, PLANS, subscribeBilling,
  subscription, type Plan,
} from '../../../lib/billing';
import { formatNGN } from '../../../lib/money';

export default function BillingPage() {
  useSyncExternalStore(subscribeBilling, getSubSnapshot, getSubServerSnapshot);
  const [done, setDone] = useState('');
  const sub = subscription();

  function pay(plan: Plan) {
    const s = activatePlan(plan);
    setDone(`${PLANS[plan].label} activated — POS unlocked till ${new Date(s.endsAt).toLocaleDateString()}. Receipt sent to your phone + email.`);
  }

  return (
    <div>
      <a href="/dashboard">← dashboard</a>
      <h1 style={{ marginTop: 8 }}>POS subscription</h1>
      <p className="sub">The robotic inventory + outlet POS is a paid add-on under FMCG Open Market. New sellers start with a free 14-day trial.</p>

      <div className={`notice ${sub.status === 'expired' ? 'warn' : 'ok'}`} style={{ marginTop: 12 }}>
        Status: <b>{sub.status === 'trial' ? `Free trial — ${sub.daysLeft} days left` : sub.status === 'active' ? `Active (${sub.sub?.plan}) — ${sub.daysLeft} days left` : 'Expired — renew below'}</b>
      </div>
      {done && <div className="notice ok">{done}</div>}

      <div className="grid g3" style={{ marginTop: 12 }}>
        {(Object.keys(PLANS) as Plan[]).map((plan) => (
          <div key={plan} className="card">
            <div className="kicker">{PLANS[plan].label}</div>
            <div className="price">{formatNGN(PLANS[plan].amountKobo)} <small>/ {plan === 'monthly' ? 'month' : plan === 'quarterly' ? '3 months' : 'year'}</small></div>
            <p className="sub">{PLANS[plan].blurb}</p>
            <div className="sub">✓ Outlet sales + receipts ✓ Stock-taking ✓ Damages & returns ✓ Offline mode ✓ Cloud sync</div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => pay(plan)}>Subscribe — {PLANS[plan].label}</button>
            </div>
          </div>
        ))}
      </div>
      <p className="sub" style={{ marginTop: 12 }}>Demo checkout — Paystack/transfer activation lands here; the plan activates immediately and syncs to <span className="kicker">POST /api/pos/subscriptions/subscribe</span>.</p>
    </div>
  );
}
