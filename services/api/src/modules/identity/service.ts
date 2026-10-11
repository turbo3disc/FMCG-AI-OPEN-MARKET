import crypto from 'node:crypto';
import { pool, withTx, type TxClient } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { notify } from '../../common/notify.js';
import { ApiError } from '../../common/errors.js';
import type { SellerApplication } from './schemas.js';

export const DEV_OTP = '123456';

const devToken = (userId: string, role = 'buyer', tier = 1): string =>
  Buffer.from(`dev:${userId}:${role}:${tier}:${Date.now()}`).toString('base64url');

const hash = (pw: string): string => crypto.createHash('sha256').update(`fmcg:${pw}`).digest('hex');

export async function register(input: { phone?: string; email?: string; password?: string; buyerType: string; displayName?: string }) {
  return withTx(async (tx: TxClient) => {
    const dup = await tx.query(`SELECT id FROM users WHERE phone = $1 OR email = $2`, [input.phone ?? null, input.email ?? null]);
    if (dup.rows.length) throw ApiError.conflict('phone or email already registered');
    const u = await tx.query(
      `INSERT INTO users (phone, email, password_hash) VALUES ($1,$2,$3) RETURNING id, phone, email, status`,
      [input.phone ?? null, input.email ?? null, input.password ? hash(input.password) : null],
    );
    const user = u.rows[0] as { id: string };
    await tx.query(`INSERT INTO buyer_profiles (user_id, buyer_type, display_name) VALUES ($1,$2,$3)`, [
      user.id, input.buyerType, input.displayName ?? null,
    ]);
    await writeAudit(tx, { actorId: user.id, action: 'user.register', entity: 'users', entityId: user.id });
    return { user: u.rows[0], accessToken: devToken(user.id), refreshToken: devToken(user.id) };
  });
}

export async function verifyOtp(phone: string, code: string) {
  if (code !== DEV_OTP && process.env.NODE_ENV === 'production') throw ApiError.unauthorized('invalid otp');
  if (code !== DEV_OTP) throw ApiError.unauthorized('invalid otp (dev code is 123456)');
  const r = await pool.query(`SELECT id, phone, email, status FROM users WHERE phone = $1`, [phone]);
  if (!r.rows.length) throw ApiError.notFound('no user for phone');
  return { user: r.rows[0], accessToken: devToken((r.rows[0] as { id: string }).id), refreshToken: devToken((r.rows[0] as { id: string }).id) };
}

export async function login(input: { phone?: string; email?: string; password: string }) {
  const r = await pool.query(`SELECT id, phone, email, status, password_hash FROM users WHERE phone = $1 OR email = $2`, [
    input.phone ?? null, input.email ?? null,
  ]);
  const user = r.rows[0] as { id: string; status: string; password_hash: string | null } | undefined;
  if (!user) throw ApiError.unauthorized('invalid credentials');
  if (user.status !== 'active') throw ApiError.forbidden('account suspended');
  if (!user.password_hash || user.password_hash !== hash(input.password)) throw ApiError.unauthorized('invalid credentials');
  return { user: { id: user.id }, accessToken: devToken(user.id), refreshToken: devToken(user.id) };
}

export async function refresh(token: string) {
  if (!token) throw ApiError.unauthorized('refresh token required');
  // Dev stub: refresh tokens are opaque dev tokens; re-issue.
  return { accessToken: devToken('refreshed'), refreshToken: devToken('refreshed') };
}

export async function getMe(userId: string) {
  const r = await pool.query(
    `SELECT u.id, u.phone, u.email, u.status,
      (SELECT row_to_json(b) FROM buyer_profiles b WHERE b.user_id = u.id ORDER BY b.created_at LIMIT 1) AS buyer,
      (SELECT row_to_json(s) FROM seller_profiles s WHERE s.user_id = u.id ORDER BY s.created_at LIMIT 1) AS seller
     FROM users u WHERE u.id = $1`,
    [userId],
  );
  if (!r.rows.length) throw ApiError.notFound('user not found');
  return r.rows[0];
}

export async function switchContext(userId: string, context: 'buyer' | 'seller') {
  const r = await pool.query(
    context === 'seller'
      ? `SELECT id, business_name, verification_tier FROM seller_profiles WHERE user_id = $1`
      : `SELECT id, buyer_type, display_name FROM buyer_profiles WHERE user_id = $1`,
    [userId],
  );
  if (!r.rows.length) throw ApiError.notFound(`no ${context} profile`);
  return { context, profile: r.rows[0] };
}

export const listAddresses = async (userId: string) =>
  (await pool.query(`SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC`, [userId])).rows;

export const createAddress = async (userId: string, a: { label: string; line1: string; city: string; lat?: number; lng?: number }) =>
  (await pool.query(
    `INSERT INTO addresses (user_id, label, line1, city, lat, lng) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [userId, a.label, a.line1, a.city, a.lat ?? null, a.lng ?? null],
  )).rows[0];

export const updateAddress = async (userId: string, id: string, a: Partial<{ label: string; line1: string; city: string }>) => {
  const r = await pool.query(`UPDATE addresses SET label = COALESCE($3,label), line1 = COALESCE($4,line1), city = COALESCE($5,city) WHERE id = $1 AND user_id = $2 RETURNING *`, [
    id, userId, a.label ?? null, a.line1 ?? null, a.city ?? null,
  ]);
  if (!r.rows.length) throw ApiError.notFound('address not found');
  return r.rows[0];
};

export const deleteAddress = async (userId: string, id: string) => {
  const r = await pool.query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
  if (!r.rows.length) throw ApiError.notFound('address not found');
  return { deleted: id };
};

// --- Seller onboarding: public application → pending → admin approval ---
export async function applySeller(a: SellerApplication) {
  const out = await withTx(async (tx: TxClient) => {
    let userId: string | undefined;
    const existing = await tx.query(`SELECT id FROM users WHERE phone = $1 OR email = $2`, [a.phone ?? null, a.email ?? null]);
    if (existing.rows.length) {
      userId = (existing.rows[0] as { id: string }).id;
      if (a.password) {
        await tx.query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [userId, hash(a.password)]);
      }
      const dup = await tx.query(`SELECT id, verification_status FROM seller_profiles WHERE user_id = $1`, [userId]);
      if (dup.rows.length) {
        const st = (dup.rows[0] as { verification_status: string }).verification_status;
        if (st === 'pending') throw ApiError.conflict('application already under review');
        if (st === 'approved') throw ApiError.conflict('seller already approved — open your dashboard');
      }
    } else {
      const u = await tx.query(`INSERT INTO users (phone, email, password_hash) VALUES ($1,$2,$3) RETURNING id`,
        [a.phone ?? null, a.email ?? null, a.password ? hash(a.password) : null]);
      userId = (u.rows[0] as { id: string }).id;
    }
    const sp = await tx.query(
      `INSERT INTO seller_profiles (user_id, seller_type, business_name, contact_name, email, address_line1, city, lat, lng, verification_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
      [userId, a.sellerType, a.businessName, a.contactName, a.email ?? null, a.addressLine1, a.city, a.lat ?? null, a.lng ?? null],
    );
    const profile = sp.rows[0];
    await tx.query(`INSERT INTO addresses (user_id, label, line1, city, lat, lng) VALUES ($1,'shop',$2,$3,$4,$5)`,
      [userId, a.addressLine1, a.city, a.lat ?? null, a.lng ?? null]);
    await writeAudit(tx, { actorId: userId!, action: 'seller.apply', entity: 'seller_profiles', entityId: (profile as { id: string }).id });
    return profile;
  });
  // Acknowledge on the seller's chosen channel (never blocks the response).
  const to = a.notifyChannel === 'email' ? a.email! : a.phone!;
  const ack = await notify(a.notifyChannel, to, 'seller.application_received', { business: a.businessName }).catch(() => ({ id: 'failed', status: 'failed' }));
  return { profile: out, ack };
}

export const sellerStatus = async (phone?: string, email?: string) => {
  if (!phone && !email) throw ApiError.badRequest('phone or email required');
  const r = await pool.query(
    `SELECT s.*, u.phone FROM seller_profiles s JOIN users u ON u.id = s.user_id
     WHERE u.phone = $1 OR u.email = $2 ORDER BY s.created_at DESC LIMIT 1`,
    [phone ?? null, email ?? null],
  );
  if (!r.rows.length) throw ApiError.notFound('no seller application found');
  return r.rows[0];
};
