import { pool } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';

// Dispute workflow (PRD §9.2): open -> awaiting_evidence -> under_review -> resolved | appealed.
// Opening a dispute pauses settlement for the order.
export async function createReview(buyerId: string, input: { orderId: string; rating: number; reasons?: string[]; comment?: string }) {
  const o = await pool.query(`SELECT id, seller_id FROM orders WHERE id = $1 AND buyer_id = $2`, [input.orderId, buyerId]);
  const order = o.rows[0] as { id: string; seller_id: string } | undefined;
  if (!order) throw ApiError.notFound('order not found');
  const r = await pool.query(
    `INSERT INTO reviews (order_id, seller_id, buyer_id, rating, reasons, comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [input.orderId, order.seller_id, buyerId, input.rating, input.reasons ?? [], input.comment ?? null],
  );
  return r.rows[0];
}

export const listReviews = async (sellerId: string) =>
  (await pool.query(`SELECT * FROM reviews WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 100`, [sellerId])).rows;

export async function createReport(reporterId: string, entity: string, entityId: string, reason: string) {
  const r = await pool.query(`INSERT INTO reports (reporter_id, entity, entity_id, reason, status) VALUES ($1,$2,$3,$4,'open') RETURNING *`, [
    reporterId, entity, entityId, reason,
  ]);
  return r.rows[0];
}

export async function openDispute(reporterId: string, input: { orderId: string; reason: string; details?: string }) {
  const o = await pool.query(`SELECT id FROM orders WHERE id = $1`, [input.orderId]);
  if (!o.rows.length) throw ApiError.notFound('order not found');
  const r = await pool.query(
    `INSERT INTO disputes (order_id, reporter_id, reason, details, status, sla_due_at)
     VALUES ($1,$2,$3,$4,'open', now() + interval '48 hours') RETURNING *`,
    [input.orderId, reporterId, input.reason, input.details ?? null],
  );
  const d = r.rows[0] as { id: string };
  await pool.query(`UPDATE orders SET status = 'disputed', payment_state = 'DISPUTED' WHERE id = $1`, [input.orderId]);
  await pool.query(`UPDATE settlements SET status = 'paused' WHERE order_id = $1`, [input.orderId]);
  await writeAudit(pool, { actorId: reporterId, action: 'dispute.open', entity: 'disputes', entityId: d.id, meta: { orderId: input.orderId } });
  return r.rows[0];
}

export async function addEvidence(disputeId: string, actorId: string, url: string, note?: string) {
  const d = await pool.query(`SELECT id, status FROM disputes WHERE id = $1`, [disputeId]);
  if (!d.rows.length) throw ApiError.notFound('dispute not found');
  const r = await pool.query(`INSERT INTO dispute_evidence (dispute_id, actor_id, url, note) VALUES ($1,$2,$3,$4) RETURNING *`, [
    disputeId, actorId, url, note ?? null,
  ]);
  await pool.query(`UPDATE disputes SET status = 'under_review' WHERE id = $1 AND status = 'open'`, [disputeId]);
  return r.rows[0];
}

// Resolve: ruling buyer|seller|split + optional refund amount (kobo). Unpauses settlement.
export async function resolveDispute(disputeId: string, ruling: 'buyer' | 'seller' | 'split', resolution: string, actorId: string, refundKobo = 0) {
  const d = await pool.query(`SELECT * FROM disputes WHERE id = $1`, [disputeId]);
  const dispute = d.rows[0] as { id: string; order_id: string; status: string } | undefined;
  if (!dispute) throw ApiError.notFound('dispute not found');
  if (!['buyer', 'seller', 'split'].includes(ruling)) throw ApiError.badRequest('ruling must be buyer|seller|split');
  const r = await pool.query(
    `UPDATE disputes SET status = 'resolved', ruling = $2, resolution = $3, resolved_at = now() WHERE id = $1 RETURNING *`,
    [disputeId, ruling, resolution],
  );
  await pool.query(`UPDATE settlements SET status = 'pending' WHERE order_id = $1`, [dispute.order_id]);
  if (ruling !== 'seller') {
    await pool.query(`UPDATE orders SET status = 'completed', payment_state = 'REFUNDED' WHERE id = $1`, [dispute.order_id]);
  } else {
    await pool.query(`UPDATE orders SET status = 'completed' WHERE id = $1`, [dispute.order_id]);
  }
  await writeAudit(pool, { actorId, action: 'dispute.resolve', entity: 'disputes', entityId: disputeId, meta: { ruling, refundKobo } });
  return r.rows[0];
}

export const listDisputes = async (status?: string) =>
  (await pool.query(status ? `SELECT * FROM disputes WHERE status = $1 ORDER BY sla_due_at` : `SELECT * FROM disputes ORDER BY created_at DESC LIMIT 100`, status ? [status] : [])).rows;
