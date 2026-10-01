import { pool, withTx } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';

export async function createRfq(buyerId: string, input: { sellerId?: string; canonicalProductId?: string; title: string; qty: number; unitType: string; targetPriceKobo?: number; expiresInHours: number }) {
  const expiresAt = new Date(Date.now() + input.expiresInHours * 3600_000).toISOString();
  const r = await pool.query(
    `INSERT INTO quotes (buyer_id, seller_id, canonical_product_id, title, qty, unit_type, target_price_kobo, status, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8) RETURNING *`,
    [buyerId, input.sellerId ?? null, input.canonicalProductId ?? null, input.title, input.qty, input.unitType, input.targetPriceKobo ?? null, expiresAt],
  );
  const quote = r.rows[0] as { id: string };
  await writeAudit(pool, { actorId: buyerId, action: 'quote.rfq.create', entity: 'quotes', entityId: quote.id });
  return r.rows[0];
}

export const listQuotes = async (userId: string, role: string) =>
  (await pool.query(
    `SELECT q.*, (SELECT json_agg(v ORDER BY v.version_no) FROM quote_versions v WHERE v.quote_id = q.id) AS versions
     FROM quotes q WHERE ${role === 'seller' ? `q.seller_id IN (SELECT id FROM seller_profiles WHERE user_id = $1)` : `q.buyer_id = $1`}
     ORDER BY q.created_at DESC LIMIT 100`,
    [userId],
  )).rows;

export async function respond(quoteId: string, actor: 'seller' | 'buyer', priceKobo: number, qty: number | undefined, note: string | undefined, actorId: string) {
  return withTx(async (tx) => {
    const q = await tx.query(`SELECT * FROM quotes WHERE id = $1 FOR UPDATE`, [quoteId]);
    const quote = q.rows[0] as { id: string; status: string; expires_at: string } | undefined;
    if (!quote) throw ApiError.notFound('quote not found');
    if (quote.status !== 'open' && quote.status !== 'countered') throw ApiError.badRequest(`quote is ${quote.status}`, 'QUOTE_STATE');
    if (new Date(quote.expires_at).getTime() < Date.now()) {
      await tx.query(`UPDATE quotes SET status = 'expired' WHERE id = $1`, [quoteId]);
      throw ApiError.badRequest('quote expired', 'QUOTE_EXPIRED');
    }
    const n = await tx.query(`SELECT COALESCE(MAX(version_no),0)+1 AS v FROM quote_versions WHERE quote_id = $1`, [quoteId]);
    const v = await tx.query(
      `INSERT INTO quote_versions (quote_id, version_no, actor, price_kobo, qty, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [quoteId, (n.rows[0] as { v: number }).v, actor, priceKobo, qty ?? null, note ?? null],
    );
    await tx.query(`UPDATE quotes SET status = 'countered' WHERE id = $1`, [quoteId]);
    await writeAudit(tx, { actorId, action: `quote.${actor}.respond`, entity: 'quotes', entityId: quoteId, meta: { priceKobo } });
    return v.rows[0];
  });
}

// Accept latest version -> creates order_group + order + PO reference.
export async function accept(quoteId: string, versionId: string, buyerId: string) {
  return withTx(async (tx) => {
    const q = await tx.query(`SELECT * FROM quotes WHERE id = $1 FOR UPDATE`, [quoteId]);
    const quote = q.rows[0] as Record<string, string & number> & { id: string; status: string; seller_id: string; buyer_id: string; qty: number; unit_type: string; title: string; expires_at: string } | undefined;
    if (!quote) throw ApiError.notFound('quote not found');
    if (quote.buyer_id !== buyerId) throw ApiError.forbidden('not your RFQ');
    if (quote.status === 'accepted' || quote.status === 'declined') throw ApiError.badRequest(`quote already ${quote.status}`);
    if (new Date(quote.expires_at).getTime() < Date.now()) {
      await tx.query(`UPDATE quotes SET status = 'expired' WHERE id = $1`, [quoteId]);
      throw ApiError.badRequest('quote expired', 'QUOTE_EXPIRED');
    }
    const v = await tx.query(`SELECT * FROM quote_versions WHERE id = $1 AND quote_id = $2`, [versionId, quoteId]);
    const ver = v.rows[0] as { price_kobo: number; qty: number | null } | undefined;
    if (!ver) throw ApiError.notFound('quote version not found');
    const qty = ver.qty ?? quote.qty;
    const total = ver.price_kobo * qty;
    const poRef = `PO-${Date.now().toString(36).toUpperCase()}`;
    const g = await tx.query(`INSERT INTO order_groups (buyer_id, total_kobo, status) VALUES ($1,$2,'pending') RETURNING *`, [buyerId, total]);
    const group = g.rows[0] as { id: string };
    const o = await tx.query(
      `INSERT INTO orders (group_id, buyer_id, seller_id, subtotal_kobo, status, payment_state, po_ref)
       VALUES ($1,$2,$3,$4,'pending','PENDING',$5) RETURNING *`,
      [group.id, buyerId, quote.seller_id, total, poRef],
    );
    await tx.query(`UPDATE quotes SET status = 'accepted', po_ref = $2 WHERE id = $1`, [quoteId, poRef]);
    await writeAudit(tx, { actorId: buyerId, action: 'quote.accept', entity: 'quotes', entityId: quoteId, meta: { poRef, total } });
    return { order: o.rows[0], group: g.rows[0], poRef };
  });
}

export async function decline(quoteId: string, actorId: string) {
  const r = await pool.query(`UPDATE quotes SET status = 'declined' WHERE id = $1 AND status IN ('open','countered') RETURNING *`, [quoteId]);
  if (!r.rows.length) throw ApiError.notFound('open quote not found');
  await writeAudit(pool, { actorId, action: 'quote.decline', entity: 'quotes', entityId: quoteId });
  return r.rows[0];
}

// Expiry worker: call on a schedule (pg_cron / node-cron later).
export async function expireQuotes(): Promise<{ expired: number }> {
  const r = await pool.query(`UPDATE quotes SET status = 'expired' WHERE status IN ('open','countered') AND expires_at < now() RETURNING id`, []);
  for (const row of r.rows) {
    await writeAudit(pool, { action: 'quote.expire', entity: 'quotes', entityId: (row as { id: string }).id });
  }
  return { expired: r.rows.length };
}
