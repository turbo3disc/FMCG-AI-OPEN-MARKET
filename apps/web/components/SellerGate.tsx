// Sub-admin gate — registration + login + approval states for the seller.
// Rule: nobody touches products without a registered, logged-in, approved account.
'use client';

import { useSyncExternalStore } from 'react';
import {
  canSell, getApplicantsServerSnapshot, getApplicantsSnapshot, logoutSeller,
  myApplicant, sellerSession, subscribeOnboarding,
} from '../lib/onboarding';

export default function SellerGate() {
  useSyncExternalStore(subscribeOnboarding, getApplicantsSnapshot, getApplicantsServerSnapshot);
  const me = myApplicant();
  const session = sellerSession();

  if (!me) {
    return (
      <div className="notice info" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span><b>Sellers register first.</b> Create your account to get a sub-admin dashboard and upload products.</span>
        <a href="/join" className="btn btn-primary">Create seller account</a>
        <a href="/login" className="btn btn-outline">Log in</a>
      </div>
    );
  }
  if (!session?.authed) {
    return (
      <div className="notice info" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>Application found for <b>{me.businessName}</b> — log in to continue.</span>
        <a href="/login" className="btn btn-primary">Log in</a>
      </div>
    );
  }
  if (me.status === 'pending') {
    return (
      <div className="notice warn">
        <b>Application under review.</b> {me.businessName} • {me.addressLine1}, {me.area}.
        We sent confirmation via <b>{me.notifyChannel}</b> — your <b>welcome onboard</b> message
        arrives on the same channel once Admin approves. Product upload unlocks after approval.
      </div>
    );
  }
  if (me.status === 'approved') {
    return (
      <div className="notice ok" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span><b>Welcome onboard, {me.businessName}!</b> Tier {me.tier} • {me.area}.
        Upload products below and press <b>Make live</b> — buyers see them instantly.</span>
        <button className="btn btn-outline" onClick={() => logoutSeller()}>Log out</button>
      </div>
    );
  }
  return (
    <div className="notice warn">
      <b>Application needs attention ({me.status}).</b> Check the message we sent via {me.notifyChannel},
      update your details and <a href="/join">re-apply</a>.
    </div>
  );
}

export function sellLocked(): boolean {
  return !canSell();
}
