import { redirect } from 'next/navigation';

// Canonical admin URL is /admin (see app/admin/page.tsx). This grouped route
// exists to satisfy the Phase 5 file plan without colliding with app/page.tsx.
export default function AdminGroupAlias() {
  redirect('/admin');
}
