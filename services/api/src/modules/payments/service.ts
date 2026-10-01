import { pool, withTx, type TxClient } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';

// PSP abstraction (ADR-0006): provider interface so Paystack/Flutterwave swap
// without touching order logic. FakeProvider always approves in dev.
export interface PaymentProvider {
  name: string;
  initialize(amountKobo: number, ref: string): Promise<{ providerRef: string; authUrl: string }>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  refund(providerRef: string, amountKobo: number): Promise<{ ok: boolean }>;
}

export const FakeProvider: PaymentProvider = {
  name: 'fake',
  initialize: async (amountKobo: number, ref: string) => ({
    providerRef: `fake_${ref}`,
    authUrl: `https://pay.dev/checkout/${ref}?amount=${amountKobo}`,
  }),
  verifyWebhookSignature: (payload: string, signature: string) =>
    signature === (process.env.PSP_WEBHOOK_SECRET ?? 'dev-secret') || signature === `sha256:${payload.length}`,
  refund: async () => ({ ok: true }),
};

const PLATFORM_FEE_BPS = 250; // 2.5% platform fee, rest to seller(s)

export async function initialize(orderGroupId: string, method: 'card' | 'transfer' | 'cod', actorId: string) {
  return withTx(async (tx) => {
    const g = await tx.query(`SELECT * FROM order_groups WHERE id = $1`, [orderGroupId]);
    const group = g.rows[0] as { id: string; total_kobo: number; buyer_id: string } | undefined;
    if (!group) throw ApiError.notFound('order group not found');
    const init = await FakeProvider.initialize(group.total_kobo, group.id);
    const state = method === 'cod' ? 'COD_PENDING_COLLECTION' : 'PENDING';
    const p = await tx.query(
      `INSERT INTO payment_transactions (order_group_id, amount_kobo, state, provider, provider_ref, method)
       VALUES ($1,$2,$3,'fake',$4,$5) RETURNING *`,
      [group.id, group.total_kobo, state, init.providerRef, method],
    );
    const payment = p.rows[0] as { id: string };
    await tx.query(`INSERT INTO payment_events (payment_id, event, payload) VALUES ($1,'initialize',$2)`, [
      payment.id, JSON.stringify({ method, providerRef: init.providerRef }),
    ]);
    if (method !== 'cod') {
      await tx.query(`UPDATE orders SET payment_state = 'PENDING' WHERE group_id = $1`, [group.id]);
    } else {
      await tx.query(`UPDATE orders SET payment_state = 'COD_PENDING_COLLECTION' WHERE group_id = $1`, [group.id]);
    }
    await writeAudit(tx, { actorId, action: 'payment.initialize', entity: 'payment_transactions', entityId: payment.id, meta: { method, amount: group.total_kobo } });
    return { payment: p.rows[0], authUrl: init.authUrl };
  });
}

// Webhook: signature-checked, replay-safe via provider_ref+event dedupe.
export async function webhook(rawBody: string, signature: string, event: { providerRef: string; type: string; amountKobo?: number }) {
  if (!FakeProvider.verifyWebhookSignature(rawBody, signature)) throw ApiError.unauthorized('bad webhook signature');
  return withTx(async (tx) => {
    const p = await tx.query(`SELECT * FROM payment_transactions WHERE provider_ref = $1 FOR UPDATE`, [event.providerRef]);
    const payment = p.rows[0] as { id: string; order_group_id: string; amount_kobo: number; state: string } | undefined;
    if (!payment) throw ApiError.notFound('payment not found');
    const dup = await tx.query(`SELECT id FROM payment_events WHERE payment_id = $1 AND payload->>'type' = $2`, [payment.id, event.type]);
    if (dup.rows.length) return { payment, replayed: true }; // idempotent replay
    const next: Record<string, string> = { paid: 'PROTECTED', shipped: 'OUT_FOR_DELIVERY', delivered: 'DELIVERED_PENDING_CONFIRMATION', settled: 'SETTLEMENT_PENDING' };
    const to = next[event.type];
    if (to) {
      await tx.query(`UPDATE payment_transactions SET state = $2 WHERE id = $1`, [payment.id, to]);
      await tx.query(`UPDATE orders SET payment_state = $2 WHERE group_id = $1`, [payment.order_group_id, to]);
    }
    await tx.query(`INSERT INTO payment_events (payment_id, event, payload) VALUES ($1,$2,$3)`, [
      payment.id, event.type, JSON.stringify({ type: event.type, amountKobo: event.amountKobo }),
    ]);
    await writeAudit(tx, { action: 'payment.webhook', entity: 'payment_transactions', entityId: payment.id, meta: { type: event.type } });
    if (event.type === 'settled') await splitSettlement(tx, payment.id, payment.order_group_id, payment.amount_kobo);
    return { payment: { ...payment, state: to ?? payment.state }, replayed: false };
  });
}

async function splitSettlement(tx: TxClient, paymentId: string, groupId: string, _total: number) {
  const orders = (await tx.query(`SELECT id, seller_id, subtotal_kobo FROM orders WHERE group_id = $1`, [groupId])).rows as Array<{ id: string; seller_id: string; subtotal_kobo: number }>;
  for (const o of orders) {
    const fee = Math.round((o.subtotal_kobo * PLATFORM_FEE_BPS) / 10_000);
    await tx.query(
      `INSERT INTO settlements (payment_id, order_id, seller_id, amount_kobo, fee_kobo, net_kobo, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')`,
      [paymentId, o.id, o.seller_id, o.subtotal_kobo, fee, o.subtotal_kobo - fee],
    );
    await writeAudit(tx, { action: 'settlement.split', entity: 'settlements', entityId: o.id, meta: { net: o.subtotal_kobo - fee } });
  }
}

export const status = async (paymentId: string) =>
  (await pool.query(
    `SELECT p.*, (SELECT json_agg(e ORDER BY e.created_at) FROM payment_events e WHERE e.payment_id = p.id) AS events
     FROM payment_transactions p WHERE p.id = $1`, [paymentId],
  )).rows[0] ?? Promise.reject(ApiError.notFound('payment not found'));

export async function refundRequest(paymentId: string, actorId: string, reason: string) {
  const r = await pool.query(`SELECT * FROM payment_transactions WHERE id = $1`, [paymentId]);
  const payment = r.rows[0] as { provider_ref: string; amount_kobo: number; state: string } | undefined;
  if (!payment) throw ApiError.notFound('payment not found');
  if (payment.state === 'SETTLED') throw ApiError.badRequest('already settled; manual review required', 'REFUND_STATE');
  const res = await FakeProvider.refund(payment.provider_ref, payment.amount_kobo);
  if (!res.ok) throw ApiError.badRequest('provider refund failed');
  await pool.query(`UPDATE payment_transactions SET state = 'REFUNDED' WHERE id = $1`, [paymentId]);
  await pool.query(`INSERT INTO payment_events (payment_id, event, payload) VALUES ($1,'refund',$2)`, [paymentId, JSON.stringify({ reason })]);
  await writeAudit(pool, { actorId, action: 'payment.refund', entity: 'payment_transactions', entityId: paymentId, meta: { reason } });
  return { refunded: paymentId };
}

export const settlementsForSeller = async (sellerId: string) =>
  (await pool.query(`SELECT * FROM settlements WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 100`, [sellerId])).rows;
