'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, DEFAULT_ADMIN_PASSWORD } from '../../../lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await adminLogin(password);
      router.push('/admin');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <a href="/">← home</a>
      <h1 style={{ marginTop: 8 }}>Super Admin login</h1>
      <p className="sub">Platform control room — seller approvals, canonical queue, settlements, disputes.</p>
      <div className="card" style={{ marginTop: 12, maxWidth: 440 }}>
        <label className="field" htmlFor="admin-password">Admin password</label>
        <input id="admin-password" type="password" placeholder="••••••••" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={busy} onClick={submit}>
            {busy ? 'Checking…' : 'Unlock admin console'}
          </button>
        </div>
        {error && <div className="notice warn">{error}</div>}
        <p className="sub" style={{ marginTop: 12 }}>
          First-time setup password: <b>{DEFAULT_ADMIN_PASSWORD}</b> — change it via the{' '}
          <span className="kicker">ADMIN_PASSWORD</span> server setting before going live (see docs/DEPLOY.md).
        </p>
      </div>
    </div>
  );
}
