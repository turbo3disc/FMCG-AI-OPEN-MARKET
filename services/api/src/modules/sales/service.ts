import { pool } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { PLANS, type Plan, type SaleItem } from './schemas.js';
import { resolveSeller } from '../catalog/service.js';

// --- Subscriptions (FMCG Open Market paid add-on for the POS suite) ---
export const mySubscription = async (userId: string) => {
  const sid = await resolveSeller(userId).catch(() => null);
  if (!sid) return { status: 'none' as const };
  const r = await pool.query(
    `SELECT * FROM subscriptions WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 1`, [sid],
  ).catch(() => ({ rows: [] as unknown[] }));
  const sub = (r.rows[0] ?? null) as null | { status: string; ends_at: string; plan: string };
  if (!sub) return { status: 'none' as const };
  const live = sub.status === 'active' && new Date(sub.ends_at) > new Date();
  return { status: live ? ('active' as const) : (sub.status as string), sub };
};

export async function subscribe(userId: string, plan: Plan, actorId: string) {
  const sellerId = await resolveSeller(userId);
  const p = PLANS[plan];
  const r = await pool.query(
    `INSERT INTO subscriptions (seller_id, plan, status, amount_kobo, ends_at)
     VALUES ($1,$2,'active',$3, now() + ($4 || ' months')::interval) RETURNING *`,
    [sellerId, plan, p.amountKobo, String(p.months)],
  );
  await writeAudit(pool, { actorId, action: 'subscription.subscribe', entity: 'subscriptions', entityId: (r.rows[0] as { id: string }).id, meta: { plan } });
  return r.rows[0];
}

// --- POS sales + stock moves (also fed by the offline outbox sync) ---
export async function recordSale(sellerId: string, items: SaleItem[]) {
  const total = items.reduce((n, it) => n + it.qty * it.priceKobo, 0);
  const r = await pool.query(
    `INSERT INTO pos_sales (seller_id, items, total_kobo) VALUES ($1,$2,$3) RETURNING *`,
    [sellerId, JSON.stringify(items), total],
  );
  await writeAudit(pool, { actorId: sellerId, action: 'pos.sale', entity: 'pos_sales', entityId: (r.rows[0] as { id: string }).id, meta: { totalKobo: total } });
  return r.rows[0];
}

export const listSales = async (sellerId: string, limit = 100) =>
  (await pool.query(`SELECT * FROM pos_sales WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2`, [sellerId, limit])).rows;

export async function recordMove(sellerId: string, m: {
  sku: string; deltaCartons: number; deltaRolls: number; deltaPacks: number; deltaPieces: number;
  reason: string; note?: string;
}) {
  const r = await pool.query(
    `INSERT INTO stock_moves (seller_id, sku, delta_cartons, delta_rolls, delta_packs, delta_pieces, reason, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [sellerId, m.sku, m.deltaCartons, m.deltaRolls, m.deltaPacks, m.deltaPieces, m.reason, m.note ?? null],
  );
  return r.rows[0];
}

export const listMoves = async (sellerId: string, reason?: string, limit = 200) =>
  (await pool.query(
    reason
      ? `SELECT * FROM stock_moves WHERE seller_id = $1 AND reason = $2 ORDER BY created_at DESC LIMIT $3`
      : `SELECT * FROM stock_moves WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2`,
    reason ? [sellerId, reason, limit] : [sellerId, limit],
  )).rows;
