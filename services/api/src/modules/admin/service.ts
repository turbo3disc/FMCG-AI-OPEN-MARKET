import { pool } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { notify, welcomeSeller } from '../../common/notify.js';
import { ApiError } from '../../common/errors.js';

// Super-admin access. Default password is for first-time setup ONLY — set
// ADMIN_PASSWORD in production (see docs/DEPLOY.md) and rotate the default.
export const DEFAULT_ADMIN_PASSWORD = 'SuperAdmin@2026';

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  return password === expected;
}

export function adminToken(adminId = 'super-admin'): string {
  return Buffer.from(`dev:${adminId}:admin:2:${Date.now()}`).toString('base64url');
}

export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export const listUsers = async (status?: string) =>
  (await pool.query(status ? `SELECT id, phone, email, status, created_at FROM users WHERE status = $1 LIMIT 200` : `SELECT id, phone, email, status, created_at FROM users LIMIT 200`, status ? [status] : [])).rows;

export async function setUserStatus(userId: string, status: 'active' | 'suspended', actorId: string) {
  const r = await pool.query(`UPDATE users SET status = $2 WHERE id = $1 RETURNING id, phone, email, status`, [userId, status]);
  if (!r.rows.length) throw ApiError.notFound('user not found');
  await writeAudit(pool, { actorId, action: `user.${status}`, entity: 'users', entityId: userId });
  return r.rows[0];
}

export const pendingSellers = async () =>
  (await pool.query(`SELECT s.*, u.phone, u.email FROM seller_profiles s JOIN users u ON u.id = s.user_id WHERE s.verification_status = 'pending' ORDER BY s.created_at LIMIT 100`, [])).rows;

export async function moderateSeller(sellerId: string, status: 'approved' | 'rejected' | 'suspended', tier: number | undefined, actorId: string) {
  const r = await pool.query(
    `UPDATE seller_profiles AS s SET verification_status = $2, verification_tier = COALESCE($3, verification_tier) WHERE s.id = $1
     RETURNING s.*, (SELECT phone FROM users u WHERE u.id = s.user_id) AS phone`,
    [sellerId, status, tier ?? null],
  ).catch(async () => pool.query(
    // Older schema without onboarding columns: fall back to plain update.
    `UPDATE seller_profiles SET verification_status = $2, verification_tier = COALESCE($3, verification_tier) WHERE id = $1 RETURNING *`,
    [sellerId, status, tier ?? null],
  ));
  if (!r.rows.length) throw ApiError.notFound('seller not found');
  const seller = r.rows[0] as { id: string; business_name: string; phone?: string | null; email?: string | null };
  await writeAudit(pool, { actorId, action: `seller.${status}`, entity: 'seller_profiles', entityId: sellerId, meta: { tier } });
  // Welcome onboard (approved) or explain next steps (rejected) — email/WhatsApp/SMS.
  let notifications: Array<{ channel: string; status: string }> = [];
  if (status === 'approved') {
    notifications = await welcomeSeller({ business_name: seller.business_name, phone: seller.phone, email: seller.email });
  } else if (status === 'rejected') {
    const to = seller.phone ?? seller.email;
    if (to && seller.phone) {
      const n = await notify('whatsapp', seller.phone, 'seller.rejected', { business: seller.business_name });
      notifications = [{ channel: 'whatsapp', status: n.status }];
    } else if (to) {
      const n = await notify('email', to, 'seller.rejected', { business: seller.business_name });
      notifications = [{ channel: 'email', status: n.status }];
    }
  }
  return { seller, notifications };
}

// Canonical dedup queue: pending/duplicate canonical rows + offers missing canonical link.
export async function dedupQueue() {
  const canon = (await pool.query(`SELECT * FROM canonical_products WHERE status IN ('pending','duplicate') ORDER BY created_at LIMIT 100`, [])).rows;
  const orphans = (await pool.query(`SELECT id, title, seller_id, created_at FROM seller_offers WHERE canonical_product_id IS NULL AND status <> 'archived' LIMIT 100`, [])).rows;
  return { canonical: canon, unmappedOffers: orphans };
}

export async function mergeCanonical(keepId: string, dupeId: string, actorId: string) {
  if (keepId === dupeId) throw ApiError.badRequest('cannot merge a product into itself');
  await pool.query(`UPDATE seller_offers SET canonical_product_id = $1 WHERE canonical_product_id = $2`, [keepId, dupeId]);
  await pool.query(`UPDATE canonical_products SET status = 'duplicate' WHERE id = $2`, [keepId, dupeId]);
  await writeAudit(pool, { actorId, action: 'canonical.merge', entity: 'canonical_products', entityId: keepId, meta: { dupeId } });
  return { kept: keepId, markedDuplicate: dupeId };
}

export const settlementReview = async () =>
  (await pool.query(`SELECT st.*, s.business_name FROM settlements st JOIN seller_profiles s ON s.id = st.seller_id WHERE st.status IN ('pending','paused') ORDER BY st.created_at LIMIT 100`, [])).rows;

export const disputeSla = async () =>
  (await pool.query(`SELECT *, (sla_due_at < now()) AS breached FROM disputes WHERE status IN ('open','awaiting_evidence','under_review') ORDER BY sla_due_at LIMIT 100`, [])).rows;

export async function analytics() {
  const gmv = await pool.query(`SELECT COALESCE(SUM(total_kobo),0) AS gmv_kobo, COUNT(*) AS groups FROM order_groups`, []);
  const orders = await pool.query(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`, []);
  const disputes = await pool.query(`SELECT status, COUNT(*) AS n FROM disputes GROUP BY status`, []);
  const payments = await pool.query(`SELECT state, COUNT(*) AS n, COALESCE(SUM(amount_kobo),0) AS kobo FROM payment_transactions GROUP BY state`, []);
  return { gmv: gmv.rows[0], ordersByStatus: orders.rows, disputesByStatus: disputes.rows, paymentsByState: payments.rows };
}
