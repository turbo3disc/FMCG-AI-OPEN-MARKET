// Admin: seller applications queue — approve (sends welcome onboard via the
// seller's chosen channel) or reject, plus the notification trail.
'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  getApplicantsServerSnapshot, getApplicantsSnapshot, getNoticesServerSnapshot,
  getNoticesSnapshot, moderateApplicant, subscribeOnboarding, type Applicant,
} from '../lib/onboarding';

const badge = (s: Applicant['status']) =>
  s === 'approved' ? 'b-green' : s === 'pending' ? 'b-amber' : 'b-red';

export default function SellerModeration() {
  const applicants = useSyncExternalStore(subscribeOnboarding, getApplicantsSnapshot, getApplicantsServerSnapshot);
  const notices = useSyncExternalStore(subscribeOnboarding, getNoticesSnapshot, getNoticesServerSnapshot);
  const [tier, setTier] = useState<Record<string, 1 | 2>>({});
  const [flash, setFlash] = useState('');

  const pending = applicants.filter((a) => a.status === 'pending');
  const decided = applicants.filter((a) => a.status !== 'pending');

  function act(id: string, status: Applicant['status']) {
    const sent = moderateApplicant(id, status, status === 'approved' ? (tier[id] ?? 1) : undefined);
    setFlash(status === 'approved'
      ? `Approved — welcome onboard sent (${sent.map((n) => `${n.channel}→${n.to}`).join(', ') || 'no channel'}).`
      : `Rejected — seller notified with next steps.`);
    setTimeout(() => setFlash(''), 4000);
  }

  return (
    <div>
      <h2 className="section">Seller applications ({pending.length} pending)</h2>
      {flash && <div className="notice ok">{flash}</div>}
      {pending.length === 0 && (
        <div className="notice info">No pending applications. New sellers register at <a href="/join">/join</a>.</div>
      )}
      {pending.length > 0 && (
        <table>
          <thead><tr><th>Business</th><th>Contact + channel</th><th>Address + location</th><th>Tier</th><th>Action</th></tr></thead>
          <tbody>
            {pending.map((a) => (
              <tr key={a.id}>
                <td><b>{a.businessName}</b><div className="sub">{a.sellerType}</div></td>
                <td>{a.contactName}<div className="sub">{a.phone} • {a.email || 'no email'} • via {a.notifyChannel}</div></td>
                <td>{a.addressLine1}<div className="sub">{a.area}, {a.city} • {a.lat},{a.lng}</div></td>
                <td>
                  <select value={tier[a.id] ?? 1} onChange={(e) => setTier({ ...tier, [a.id]: Number(e.target.value) as 1 | 2 })} aria-label="Tier">
                    <option value={1}>Tier 1</option>
                    <option value={2}>Tier 2</option>
                  </select>
                </td>
                <td>
                  <div className="btn-row">
                    <button className="btn btn-primary" onClick={() => act(a.id, 'approved')}>Approve + welcome</button>
                    <button className="btn btn-outline" onClick={() => act(a.id, 'rejected')}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {decided.length > 0 && (
        <div>
          <h2 className="section">Decided sellers</h2>
          <table>
            <thead><tr><th>Business</th><th>Status</th><th>Tier</th></tr></thead>
            <tbody>
              {decided.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.businessName}</b><div className="sub">{a.phone}</div></td>
                  <td><span className={`badge ${badge(a.status)}`}>{a.status}</span></td>
                  <td>Tier {a.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section">Notification trail (email / SMS / WhatsApp)</h2>
      {notices.length === 0 && <p className="sub">No messages yet.</p>}
      {notices.length > 0 && (
        <table>
          <thead><tr><th>Channel</th><th>To</th><th>Message</th></tr></thead>
          <tbody>
            {notices.slice(0, 20).map((n) => (
              <tr key={n.id}>
                <td><span className="badge b-sky">{n.channel}</span></td>
                <td>{n.to}</td>
                <td style={{ fontSize: 13 }}>{n.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
