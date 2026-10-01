import crypto from 'node:crypto';
import { pool, withTx, type TxClient } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';

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
  // Dev stub: accepts 123456. Real Termii/WhatsApp OTP later.
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
