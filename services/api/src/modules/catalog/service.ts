import { pool } from '../../db/pool.js';
import { writeAudit } from '../../common/audit.js';
import { ApiError } from '../../common/errors.js';
import type { OfferInput } from './schemas.js';

const OFFER_COLS = `id, seller_id, canonical_product_id, title, brand, size, sku, price_kobo, bulk_breaks, moq, unit_type, on_hand, cartons, rolls, reserved, (on_hand - reserved) AS available, status, created_at`;

// --- Canonical products (admin-curated) ---
export const listCanonical = async (q?: string) =>
  (await pool.query(
    q
      ? `SELECT * FROM canonical_products WHERE name ILIKE $1 OR brand ILIKE $1 OR sku ILIKE $1 ORDER BY name LIMIT 100`
      : `SELECT * FROM canonical_products ORDER BY created_at DESC LIMIT 100`,
    q ? [`%${q}%`] : [],
  )).rows;

export async function createCanonical(input: { name: string; brand?: string; category: string; sku: string; unitTypes: string[] }, actorId: string) {
  try {
    const r = await pool.query(
      `INSERT INTO canonical_products (name, brand, category, sku, unit_types, status) VALUES ($1,$2,$3,$4,$5,'canonical') RETURNING *`,
      [input.name, input.brand ?? null, input.category, input.sku, input.unitTypes],
    );
    await writeAudit(pool, { actorId, action: 'canonical.create', entity: 'canonical_products', entityId: (r.rows[0] as { id: string }).id });
    return r.rows[0];
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') throw ApiError.conflict('sku already exists');
    throw e;
  }
}

export const getCanonical = async (id: string) =>
  (await pool.query(`SELECT * FROM canonical_products WHERE id = $1`, [id])).rows[0] ?? Promise.reject(ApiError.notFound('canonical product not found'));

// --- Seller helpers ---
// Resolve the seller_profiles.id for a user. Never trust a raw user id as a
// seller id (UUID mismatch → 500); buyers have no seller profile.
export async function resolveSeller(userId: string): Promise<string> {
  const r = await pool.query(`SELECT id FROM seller_profiles WHERE user_id = $1 ORDER BY created_at LIMIT 1`, [userId]);
  if (!r.rows.length) throw ApiError.forbidden('seller profile required');
  return (r.rows[0] as { id: string }).id;
}

// --- Seller offers ---
export const listOffers = async (sellerId?: string, status?: string) => {
  const conds: string[] = [];
  const params: unknown[] = [];
  if (sellerId) { params.push(sellerId); conds.push(`seller_id = $${params.length}`); }
  if (status) { params.push(status); conds.push(`status = $${params.length}`); }
  return (await pool.query(`SELECT ${OFFER_COLS} FROM seller_offers ${conds.length ? `WHERE ${conds.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT 200`, params)).rows;
};

export async function createOffer(sellerId: string, input: OfferInput) {
  const r = await pool.query(
    `INSERT INTO seller_offers (seller_id, canonical_product_id, title, brand, size, sku, price_kobo, bulk_breaks, moq, unit_type, on_hand, cartons, rolls, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft') RETURNING ${OFFER_COLS}`,
    [sellerId, input.canonicalProductId ?? null, input.title, input.brand ?? null, input.size ?? null, input.sku ?? null,
      input.priceKobo, JSON.stringify(input.bulkBreaks ?? []), input.moq ?? 1, input.unitType ?? 'piece',
      input.onHand ?? 0, input.cartons ?? 0, input.rolls ?? 0],
  );
  await writeAudit(pool, { actorId: sellerId, action: 'offer.create', entity: 'seller_offers', entityId: (r.rows[0] as { id: string }).id });
  return r.rows[0];
}

async function ownOffer(sellerId: string, id: string) {
  const r = await pool.query(`SELECT ${OFFER_COLS} FROM seller_offers WHERE id = $1 AND seller_id = $2`, [id, sellerId]);
  if (!r.rows.length) throw ApiError.notFound('offer not found');
  return r.rows[0];
}

export async function updateOffer(sellerId: string, id: string, input: Partial<OfferInput>) {
  await ownOffer(sellerId, id);
  const r = await pool.query(
    `UPDATE seller_offers SET title = COALESCE($3,title), price_kobo = COALESCE($4,price_kobo),
       bulk_breaks = COALESCE($5,bulk_breaks), moq = COALESCE($6,moq), unit_type = COALESCE($7,unit_type),
       on_hand = COALESCE($8,on_hand), canonical_product_id = COALESCE($9,canonical_product_id),
       brand = COALESCE($10,brand), size = COALESCE($11,size), sku = COALESCE($12,sku),
       cartons = COALESCE($13,cartons), rolls = COALESCE($14,rolls)
     WHERE id = $1 AND seller_id = $2 RETURNING ${OFFER_COLS}`,
    [id, sellerId, input.title ?? null, input.priceKobo ?? null, input.bulkBreaks ? JSON.stringify(input.bulkBreaks) : null,
      input.moq ?? null, input.unitType ?? null, input.onHand ?? null, input.canonicalProductId ?? null,
      input.brand ?? null, input.size ?? null, input.sku ?? null, input.cartons ?? null, input.rolls ?? null],
  );
  await writeAudit(pool, { actorId: sellerId, action: 'offer.update', entity: 'seller_offers', entityId: id, meta: { priceKobo: input.priceKobo, onHand: input.onHand } });
  return r.rows[0];
}

export async function setOfferStatus(sellerId: string, id: string, status: 'published' | 'paused' | 'archived') {
  await ownOffer(sellerId, id);
  const r = await pool.query(`UPDATE seller_offers SET status = $3 WHERE id = $1 AND seller_id = $2 RETURNING ${OFFER_COLS}`, [id, sellerId, status]);
  await writeAudit(pool, { actorId: sellerId, action: `offer.${status}`, entity: 'seller_offers', entityId: id });
  return r.rows[0];
}

export const deleteOffer = async (sellerId: string, id: string) => {
  await ownOffer(sellerId, id);
  await pool.query(`UPDATE seller_offers SET status = 'archived' WHERE id = $1`, [id]);
  await writeAudit(pool, { actorId: sellerId, action: 'offer.archive', entity: 'seller_offers', entityId: id });
  return { archived: id };
};

// --- Moderation queue: offers awaiting canonical mapping ---
export const moderationQueue = async () =>
  (await pool.query(
    `SELECT ${OFFER_COLS} FROM seller_offers WHERE status = 'draft' OR canonical_product_id IS NULL ORDER BY created_at LIMIT 100`,
  )).rows;

export async function moderateOffer(id: string, decision: 'approve' | 'reject', canonicalProductId: string | undefined, actorId: string) {
  const status = decision === 'approve' ? 'published' : 'archived';
  const r = await pool.query(
    `UPDATE seller_offers SET status = $2, canonical_product_id = COALESCE($3, canonical_product_id) WHERE id = $1 RETURNING ${OFFER_COLS}`,
    [id, status, canonicalProductId ?? null],
  );
  if (!r.rows.length) throw ApiError.notFound('offer not found');
  await writeAudit(pool, { actorId, action: `offer.moderate.${decision}`, entity: 'seller_offers', entityId: id, meta: { canonicalProductId } });
  return r.rows[0];
}

// Signed-URL stub (S3-compatible provider later): returns a fake upload target.
export function signedUploadUrl(sellerId: string, filename: string): { uploadUrl: string; publicUrl: string } {
  const key = `offers/${sellerId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  return { uploadUrl: `https://storage.dev/upload/${key}?signature=dev`, publicUrl: `https://storage.dev/${key}` };
}
