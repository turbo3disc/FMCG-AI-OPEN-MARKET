import crypto from 'node:crypto';
import { pool } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';
import { DELIVERY_OTP } from './schemas.js';

const otpHash = (otp: string): string => crypto.createHash('sha256').update(`pod:${otp}`).digest('hex');

export const listPartners = async () => (await pool.query(`SELECT * FROM delivery_partners ORDER BY name`, [])).rows;
export const createPartner = async (name: string, actorId: string) => {
  const r = await pool.query(`INSERT INTO delivery_partners (name) VALUES ($1) RETURNING *`, [name]);
  await writeAudit(pool, { actorId, action: 'logistics.partner.create', entity: 'delivery_partners', entityId: (r.rows[0] as { id: string }).id });
  return r.rows[0];
};
export const listDrivers = async (partnerId?: string) =>
  (await pool.query(partnerId ? `SELECT * FROM drivers WHERE partner_id = $1` : `SELECT * FROM drivers LIMIT 100`, partnerId ? [partnerId] : [])).rows;
export const createDriver = async (partnerId: string, name: string, phone: string) =>
  (await pool.query(`INSERT INTO drivers (partner_id, name, phone) VALUES ($1,$2,$3) RETURNING *`, [partnerId, name, phone])).rows[0];

export async function assignJob(orderId: string, partnerId: string | undefined, driverId: string | undefined, actorId: string) {
  const r = await pool.query(
    `INSERT INTO delivery_jobs (order_id, partner_id, driver_id, status, pickup_otp_hash) VALUES ($1,$2,$3,'assigned',$4) RETURNING *`,
    [orderId, partnerId ?? null, driverId ?? null, otpHash(DELIVERY_OTP)],
  );
  await pool.query(`UPDATE orders SET status = 'confirmed' WHERE id = $1 AND status = 'pending'`, [orderId]);
  await writeAudit(pool, { actorId, action: 'logistics.job.assign', entity: 'delivery_jobs', entityId: (r.rows[0] as { id: string }).id, meta: { orderId } });
  return r.rows[0];
}

async function jobOrThrow(id: string) {
  const r = await pool.query(`SELECT * FROM delivery_jobs WHERE id = $1`, [id]);
  if (!r.rows.length) throw ApiError.notFound('job not found');
  return r.rows[0] as Record<string, string & number> & { id: string; status: string; order_id: string; pickup_otp_hash: string };
}

async function moveJob(id: string, from: string[], to: string, actorId: string, extra: Record<string, unknown> = {}) {
  const job = await jobOrThrow(id);
  if (!from.includes(job.status)) throw ApiError.badRequest(`job is ${job.status}, cannot move to ${to}`, 'JOB_TRANSITION');
  const sets = [`status = '${to}'`];
  const params: unknown[] = [id];
  for (const [k, v] of Object.entries(extra)) { params.push(v); sets.push(`${k} = $${params.length}`); }
  const r = await pool.query(`UPDATE delivery_jobs SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, params);
  await writeAudit(pool, { actorId, action: `logistics.job.${to}`, entity: 'delivery_jobs', entityId: id, meta: { from: job.status } });
  return r.rows[0];
}

export const acceptJob = (id: string, actorId: string) => moveJob(id, ['assigned'], 'accepted', actorId);
export const pickupJob = (id: string, actorId: string) => moveJob(id, ['accepted'], 'picked_up', actorId);

export async function deliverJob(id: string, pod: { photoUrl?: string; signature?: string; lat?: number; lng?: number; otp: string }, actorId: string) {
  const job = await jobOrThrow(id);
  if (job.pickup_otp_hash !== otpHash(pod.otp)) throw ApiError.badRequest('invalid delivery OTP', 'OTP');
  const r = await moveJob(id, ['picked_up'], 'delivered', actorId, {
    pod_photo_url: pod.photoUrl ?? null, pod_signature: pod.signature ?? null, pod_lat: pod.lat ?? null, pod_lng: pod.lng ?? null,
  });
  await pool.query(`UPDATE orders SET status = 'delivered', payment_state = 'DELIVERED_PENDING_CONFIRMATION' WHERE id = $1`, [job.order_id]);
  return r;
}

export async function collectCod(id: string, amountKobo: number, actorId: string) {
  if (!Number.isInteger(amountKobo) || amountKobo <= 0) throw ApiError.badRequest('amountKobo must be positive integer kobo');
  const r = await moveJob(id, ['delivered'], 'cod_collected', actorId, { cod_amount_kobo: amountKobo, cod_status: 'collected' });
  return r;
}

export async function reconcileCod(id: string, actorId: string) {
  const r = await moveJob(id, ['cod_collected'], 'cod_reconciled', actorId, { cod_status: 'reconciled' });
  await pool.query(`UPDATE orders SET payment_state = 'COD_RECONCILED' WHERE id = (SELECT order_id FROM delivery_jobs WHERE id = $1)`, [id]);
  return r;
}

export async function reportException(id: string, note: string, actorId: string) {
  if (!note) throw ApiError.badRequest('note required');
  const r = await pool.query(`UPDATE delivery_jobs SET status = 'exception', exception_note = $2 WHERE id = $1 RETURNING *`, [id, note]);
  if (!r.rows.length) throw ApiError.notFound('job not found');
  await writeAudit(pool, { actorId, action: 'logistics.job.exception', entity: 'delivery_jobs', entityId: id, meta: { note } });
  return r.rows[0];
}

export const listJobs = async (driverId?: string) =>
  (await pool.query(driverId ? `SELECT * FROM delivery_jobs WHERE driver_id = $1 ORDER BY created_at DESC` : `SELECT * FROM delivery_jobs ORDER BY created_at DESC LIMIT 100`, driverId ? [driverId] : [])).rows;
