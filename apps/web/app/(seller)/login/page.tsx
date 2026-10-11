'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSeller } from '../../../lib/onboarding';

export default function SellerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+234');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    try {
      const me = loginSeller(phone, password);
      if (me.status === 'approved') router.push('/dashboard');
      else router.push('/dashboard'); // gate explains pending/rejected state
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <a href="/">← home</a>
      <h1 style={{ marginTop: 8 }}>Seller login</h1>
      <p className="sub">Phone + account password you created at registration. Upload unlocks after Admin approval.</p>
      <div className="card" style={{ marginTop: 12, maxWidth: 480 }}>
        <label className="field" htmlFor="phone">Phone</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label className="field" htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
        <div style={{ marginTop: 16 }} className="btn-row">
          <button className="btn btn-primary" onClick={submit}>Log in</button>
          <a className="btn btn-outline" href="/join">Create account</a>
        </div>
        {error && <div className="notice warn">{error}</div>}
      </div>
    </div>
  );
}
