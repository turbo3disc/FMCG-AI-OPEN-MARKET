'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LAGOS_AREAS, applyAsSeller, type Applicant, type NotifyChannel,
} from '../../../lib/onboarding';

export default function SellerJoinPage() {
  const router = useRouter();
  const [f, setF] = useState({
    contactName: '', phone: '+234', email: '', password: '', password2: '', notifyChannel: 'whatsapp' as NotifyChannel,
    businessName: '', sellerType: 'wholesaler' as Applicant['sellerType'],
    addressLine1: '', city: 'Lagos', area: LAGOS_AREAS[0].area,
    lat: LAGOS_AREAS[0].lat, lng: LAGOS_AREAS[0].lng,
  });
  const [error, setError] = useState('');
  const [ack, setAck] = useState('');

  const set = (k: keyof typeof f, v: string) => {
    if (k === 'area') {
      const hit = LAGOS_AREAS.find((a) => a.area === v);
      setF((p) => ({ ...p, area: v, lat: hit?.lat ?? p.lat, lng: hit?.lng ?? p.lng }));
    } else setF((p) => ({ ...p, [k]: v }));
  };

  function submit() {
    setError('');
    if (!f.contactName.trim()) return setError('Your full name is required.');
    if (!/^\+?[0-9]{7,15}$/.test(f.phone.trim())) return setError('Enter a valid phone number (e.g. +2348012345678).');
    if (f.notifyChannel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      return setError('Enter a valid email — you chose email updates.');
    if (!f.businessName.trim()) return setError('Business / shop name is required.');
    if (!f.addressLine1.trim()) return setError('Shop address is required.');
    if (f.password.length < 8) return setError('Account password must be 8+ characters.');
    if (f.password !== f.password2) return setError('Passwords do not match.');
    try {
      const { ack: notice } = applyAsSeller({
        contactName: f.contactName.trim(), phone: f.phone.trim(), email: f.email.trim(),
        notifyChannel: f.notifyChannel, businessName: f.businessName.trim(), sellerType: f.sellerType,
        addressLine1: f.addressLine1.trim(), city: f.city.trim(), area: f.area, lat: f.lat, lng: f.lng,
        password: f.password,
      });
      setAck(`Application received! Confirmation sent via ${notice.channel} to ${notice.to}. Redirecting to your dashboard…`);
      setTimeout(() => router.push('/dashboard'), 1600);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const chan = (id: NotifyChannel, title: string, hint: string) => (
    <label className="card" style={{ cursor: 'pointer', borderColor: f.notifyChannel === id ? 'var(--primary)' : undefined }}>
      <input type="radio" name="channel" style={{ width: 'auto' }} checked={f.notifyChannel === id}
        onChange={() => set('notifyChannel', id)} /> <b>{title}</b>
      <div className="sub">{hint}</div>
    </label>
  );

  return (
    <div>
      <a href="/">← home</a>
      <h1 style={{ marginTop: 8 }}>Sell on FMCG Open Market</h1>
      <p className="sub">Register your shop in 3 steps. Admin reviews, then you get a welcome message and your own sub-admin dashboard.</p>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 1 · How do we reach you?</div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="cname">Your full name *</label>
            <input id="cname" placeholder="e.g. Adaeze Okafor" value={f.contactName} onChange={(e) => set('contactName', e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="phone">Phone (WhatsApp/SMS) *</label>
            <input id="phone" placeholder="+2348012345678" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
        </div>
        <label className="field" htmlFor="email">Email {f.notifyChannel === 'email' ? '*' : '(for receipts + welcome mail)'}</label>
        <input id="email" placeholder="you@shop.ng" value={f.email} onChange={(e) => set('email', e.target.value)} />
        <div className="form-row">
          <div>
            <label className="field" htmlFor="password">Account password *</label>
            <input id="password" type="password" placeholder="8+ characters" value={f.password} onChange={(e) => set('password', e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="password2">Repeat password *</label>
            <input id="password2" type="password" placeholder="Repeat it" value={f.password2} onChange={(e) => set('password2', e.target.value)} />
          </div>
        </div>
        <div className="sub">This is your seller account login — you will use phone + password to open your sub-admin dashboard.</div>
        <label className="field">Send my updates by</label>
        <div className="grid g3">
          {chan('whatsapp', 'WhatsApp', 'Fast + free. Recommended.')}
          {chan('sms', 'SMS', 'Works on any phone.')}
          {chan('email', 'Email', 'Detailed letters.')}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 2 · Your business</div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="biz">Business / shop name *</label>
            <input id="biz" placeholder="e.g. Adeola Wholesale" value={f.businessName} onChange={(e) => set('businessName', e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="stype">I am a</label>
            <select id="stype" value={f.sellerType} onChange={(e) => set('sellerType', e.target.value)}>
              <option value="wholesaler">Wholesaler (bulk)</option>
              <option value="distributor">Distributor (brands)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, maxWidth: 680 }}>
        <div className="kicker">Step 3 · Shop address + location</div>
        <label className="field" htmlFor="addr">Shop address *</label>
        <input id="addr" placeholder="e.g. Shop 14, Mile 12 Market" value={f.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
        <div className="form-row">
          <div>
            <label className="field" htmlFor="area">Market area</label>
            <select id="area" value={f.area} onChange={(e) => set('area', e.target.value)}>
              {LAGOS_AREAS.map((a) => <option key={a.area} value={a.area}>{a.area}</option>)}
            </select>
          </div>
          <div>
            <label className="field" htmlFor="city">City</label>
            <input id="city" value={f.city} onChange={(e) => set('city', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label className="field" htmlFor="lat">Latitude</label>
            <input id="lat" value={f.lat} onChange={(e) => set('lat', e.target.value)} />
          </div>
          <div>
            <label className="field" htmlFor="lng">Longitude</label>
            <input id="lng" value={f.lng} onChange={(e) => set('lng', e.target.value)} />
          </div>
        </div>
        <div className="sub">Area picker fills coordinates for buyer proximity ranking. Pin-drop map lands next milestone.</div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={submit}>Submit application</button>
        </div>
        {error && <div className="notice warn">{error}</div>}
        {ack && <div className="notice ok">{ack}</div>}
      </div>
    </div>
  );
}
