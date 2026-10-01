import { pool } from '../../db/pool.js';
import type { SearchParams } from './schemas.js';

// Ranked offers: text match + proximity (PostGIS ST_Distance) + stock depth.
// Offers joined to seller + canonical; alternatives = other sellers, same canonical.
export async function searchOffers(p: SearchParams) {
  const params: unknown[] = [];
  const conds = [`o.status = 'published'`, `(o.on_hand - o.reserved) > 0`];

  if (p.q) {
    params.push(`%${p.q}%`);
    conds.push(`(o.title ILIKE $${params.length} OR c.name ILIKE $${params.length} OR c.brand ILIKE $${params.length} OR c.sku ILIKE $${params.length})`);
  }
  if (p.category) { params.push(p.category); conds.push(`c.category = $${params.length}`); }
  if (p.unitType) { params.push(p.unitType); conds.push(`o.unit_type = $${params.length}`); }
  if (p.minQty) { params.push(p.minQty); conds.push(`(o.on_hand - o.reserved) >= $${params.length}`); }

  let distSelect = `NULL AS distance_m`;
  if (p.lat !== undefined && p.lng !== undefined) {
    params.push(p.lng, p.lat, (p.radiusKm ?? 5) * 1000);
    const n = params.length;
    distSelect = `ST_Distance(s.location::geography, ST_SetSRID(ST_MakePoint($${n - 2}, $${n - 1}), 4326)::geography) AS distance_m`;
    conds.push(`s.location IS NOT NULL AND ST_DWithin(s.location::geography, ST_SetSRID(ST_MakePoint($${n - 2}, $${n - 1}), 4326)::geography, $${n})`);
  }

  const rows = (await pool.query(
    `SELECT o.id, o.title, o.price_kobo, o.bulk_breaks, o.moq, o.unit_type,
       (o.on_hand - o.reserved) AS available, o.canonical_product_id,
       c.name AS canonical_name, c.brand, c.category,
       s.id AS seller_id, s.business_name, s.verification_tier, ${distSelect}
     FROM seller_offers o
     JOIN seller_profiles s ON s.id = o.seller_id
     LEFT JOIN canonical_products c ON c.id = o.canonical_product_id
     WHERE ${conds.join(' AND ')}
     ORDER BY distance_m NULLS LAST, (o.on_hand - o.reserved) DESC, o.price_kobo ASC
     LIMIT 60`,
    params,
  )).rows as Array<Record<string, unknown> & { canonical_product_id: string | null; id: string }>;

  // Alternative sellers for the same canonical products (canonical required per ADR).
  const canonIds = [...new Set(rows.map((r) => r.canonical_product_id).filter(Boolean))] as string[];
  let alternatives: Record<string, unknown[]> = {};
  if (canonIds.length) {
    const alt = (await pool.query(
      `SELECT o.id, o.title, o.price_kobo, o.canonical_product_id, s.id AS seller_id, s.business_name
       FROM seller_offers o JOIN seller_profiles s ON s.id = o.seller_id
       WHERE o.canonical_product_id = ANY($1) AND o.status = 'published' AND (o.on_hand - o.reserved) > 0
       ORDER BY o.price_kobo ASC LIMIT 120`,
      [canonIds],
    )).rows as Array<Record<string, unknown> & { canonical_product_id: string; id: string; seller_id: string }>;
    for (const a of alt) {
      const key = a.canonical_product_id;
      alternatives[key] ??= [];
      // Exclude the top-hit seller later client-side; keep all here (cheap).
      (alternatives[key] as unknown[]).push(a);
    }
  }
  return { results: rows, alternatives, count: rows.length };
}
