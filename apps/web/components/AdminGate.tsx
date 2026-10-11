// Gate for /admin — redirects to /admin/login without a super-admin session.
'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminLogout, getAdminServerSnapshot, getAdminSnapshot, subscribeAdmin,
} from '../lib/admin';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeAdmin, getAdminSnapshot, getAdminServerSnapshot);

  useEffect(() => {
    if (session === null && typeof window !== 'undefined') router.replace('/admin/login');
  }, [session, router]);

  if (!session) {
    return (
      <div>
        <h1>Admin console</h1>
        <div className="notice warn">Super Admin only — <a href="/admin/login">log in</a>.</div>
      </div>
    );
  }
  return (
    <>
      <div className="btn-row" style={{ marginBottom: 8 }}>
        <span className="badge b-red">● Super Admin</span>
        <button className="btn btn-outline" onClick={() => { adminLogout(); router.replace('/admin/login'); }}>Log out</button>
      </div>
      {children}
    </>
  );
}
